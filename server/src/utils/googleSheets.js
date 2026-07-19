/**
 * Sync enquiries to a live Google Sheet via a Google Apps Script web app webhook.
 * Set GOOGLE_SHEETS_WEBHOOK_URL in .env (see scripts/google-sheets-appscript.gs).
 * Local Excel export still runs as a backup when this is unset or fails.
 */

const HEADERS = {
  'Content-Type': 'application/json',
};

const isConfigured = () => Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim());

const postToSheet = async (payload) => {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (!url) return { skipped: true };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(payload),
      signal: controller.signal,
      redirect: 'follow',
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      throw new Error(data?.error || data?.message || `Google Sheets HTTP ${res.status}`);
    }

    return { success: true, data };
  } finally {
    clearTimeout(timeout);
  }
};

const enquiryPayload = (enquiry) => ({
  id: String(enquiry._id || enquiry.id || ''),
  date: new Date(enquiry.createdAt || Date.now()).toLocaleString('en-IN'),
  name: enquiry.name || '',
  phone: enquiry.phone || '',
  email: enquiry.email || '',
  city: enquiry.city || '',
  state: enquiry.state || '',
  address: enquiry.address || '',
  petName: enquiry.petName || '',
  category: enquiry.category || '',
  message: enquiry.message || '',
  status: enquiry.status || 'Pending',
});

export const appendEnquiryToGoogleSheet = async (enquiry) => {
  if (!isConfigured()) return { skipped: true };

  try {
    const result = await postToSheet({
      action: 'create',
      secret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET || '',
      ...enquiryPayload(enquiry),
    });
    console.log('Enquiry synced to Google Sheet:', enquiry._id);
    return result;
  } catch (error) {
    console.error('Failed to sync enquiry to Google Sheet:', error.message);
    return { success: false, error: error.message };
  }
};

export const updateEnquiryInGoogleSheet = async (enquiry) => {
  if (!isConfigured()) return { skipped: true };

  try {
    return await postToSheet({
      action: 'update',
      secret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET || '',
      id: String(enquiry._id || enquiry.id || ''),
      status: enquiry.status || 'Pending',
    });
  } catch (error) {
    console.error('Failed to update enquiry in Google Sheet:', error.message);
    return { success: false, error: error.message };
  }
};

export const deleteEnquiryFromGoogleSheet = async (enquiryId) => {
  if (!isConfigured()) return { skipped: true };

  try {
    return await postToSheet({
      action: 'delete',
      secret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET || '',
      id: String(enquiryId),
    });
  } catch (error) {
    console.error('Failed to delete enquiry from Google Sheet:', error.message);
    return { success: false, error: error.message };
  }
};

export const getGoogleSheetInfo = () => ({
  enabled: isConfigured(),
  url: process.env.GOOGLE_SHEETS_URL?.trim() || null,
});
