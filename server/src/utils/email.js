import { Resend } from 'resend';

const SITE_NAME = process.env.SITE_NAME || 'My Duke';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

let resendClient = null;

const getResend = () => {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
};

const fromAddress = () =>
  process.env.RESEND_FROM_EMAIL || `${SITE_NAME} <onboarding@resend.dev>`;

const adminNotifyEmail = () =>
  process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || '';

const layout = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f7f7f5;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f7f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eee;">
        <tr>
          <td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:22px 28px;color:#fff;">
            <div style="font-size:20px;font-weight:700;">${SITE_NAME}</div>
            <div style="font-size:12px;opacity:.9;margin-top:2px;">pet solution</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <h1 style="margin:0 0 12px;font-size:20px;color:#111827;">${title}</h1>
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px 24px;background:#fafafa;border-top:1px solid #f0f0f0;font-size:12px;color:#9ca3af;">
            You’re receiving this email from ${SITE_NAME}.
            <a href="${CLIENT_URL}" style="color:#ea580c;text-decoration:none;">Visit website</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

/**
 * Low-level send. Never throws — logs failures so API flows stay resilient.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY missing — skipped:', subject);
    return { skipped: true };
  }
  if (!to) {
    console.warn('[email] No recipient — skipped:', subject);
    return { skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress(),
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('[email] Resend error:', error);
      return { success: false, error };
    }

    console.log('[email] Sent:', subject, '→', to, data?.id || '');
    return { success: true, data };
  } catch (err) {
    console.error('[email] Failed:', err.message);
    return { success: false, error: err.message };
  }
};

export const sendOtpEmail = async ({ email, code }) =>
  sendEmail({
    to: email,
    subject: `Your ${SITE_NAME} login OTP`,
    html: layout(
      'Your one-time password',
      `
      <p style="margin:0 0 16px;line-height:1.6;color:#4b5563;">Use this code to log in or sign up. It expires in <strong>10 minutes</strong>.</p>
      <div style="letter-spacing:8px;font-size:32px;font-weight:700;color:#ea580c;background:#fff7ed;border:1px dashed #fdba74;border-radius:12px;padding:16px;text-align:center;margin:8px 0 16px;">${code}</div>
      <p style="margin:0;font-size:13px;color:#9ca3af;">If you didn’t request this, you can ignore this email.</p>
      `
    ),
    text: `Your ${SITE_NAME} OTP is ${code}. It expires in 10 minutes.`,
  });

export const sendWelcomeEmail = async ({ email, name }) =>
  sendEmail({
    to: email,
    subject: `Welcome to ${SITE_NAME}!`,
    html: layout(
      `Welcome${name ? `, ${name}` : ''}!`,
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Your account is ready. Browse healthy, vaccinated pets and enquire anytime.</p>
      <p style="margin:0 0 20px;"><a href="${CLIENT_URL}/pets" style="display:inline-block;background:#ea580c;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;">Browse pets</a></p>
      <p style="margin:0;font-size:13px;color:#9ca3af;">You can also support animals in need on our <a href="${CLIENT_URL}/donate" style="color:#ea580c;">Donate</a> page.</p>
      `
    ),
    text: `Welcome to ${SITE_NAME}${name ? `, ${name}` : ''}! Browse pets at ${CLIENT_URL}/pets`,
  });

export const sendLoginAlertEmail = async ({ email, name }) =>
  sendEmail({
    to: email,
    subject: `New login to your ${SITE_NAME} account`,
    html: layout(
      'You’re signed in',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Hi${name ? ` ${name}` : ''}, a successful OTP login just happened on your ${SITE_NAME} account.</p>
      <p style="margin:0;font-size:13px;color:#9ca3af;">If this wasn’t you, contact us right away.</p>
      `
    ),
    text: `Successful login to your ${SITE_NAME} account.`,
  });

export const sendEnquiryConfirmationEmail = async ({ enquiry }) =>
  sendEmail({
    to: enquiry.email,
    subject: `We received your enquiry for ${enquiry.petName}`,
    html: layout(
      'Enquiry received',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Hi ${enquiry.name}, thanks for your interest in <strong>${enquiry.petName}</strong>. Our team will contact you shortly.</p>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#9ca3af;">Pet</td><td style="padding:6px 0;">${enquiry.petName}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Category</td><td style="padding:6px 0;">${enquiry.category || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Phone</td><td style="padding:6px 0;">${enquiry.phone}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">City</td><td style="padding:6px 0;">${enquiry.city}, ${enquiry.state}</td></tr>
      </table>
      `
    ),
    text: `Hi ${enquiry.name}, we received your enquiry for ${enquiry.petName}. We'll contact you soon.`,
  });

export const sendEnquiryAdminEmail = async ({ enquiry }) => {
  const to = adminNotifyEmail();
  if (!to) return { skipped: true };
  return sendEmail({
    to,
    subject: `New enquiry: ${enquiry.petName} — ${enquiry.name}`,
    html: layout(
      'New pet enquiry',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">A new enquiry was submitted on ${SITE_NAME}.</p>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#9ca3af;">Name</td><td style="padding:6px 0;">${enquiry.name}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Phone</td><td style="padding:6px 0;">${enquiry.phone}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Email</td><td style="padding:6px 0;">${enquiry.email}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Pet</td><td style="padding:6px 0;">${enquiry.petName} (${enquiry.category || '-'})</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Location</td><td style="padding:6px 0;">${enquiry.city}, ${enquiry.state}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Message</td><td style="padding:6px 0;">${enquiry.message || '-'}</td></tr>
      </table>
      <p style="margin:16px 0 0;"><a href="${process.env.ADMIN_URL || CLIENT_URL}" style="color:#ea580c;">Open admin</a></p>
      `
    ),
    text: `New enquiry from ${enquiry.name} for ${enquiry.petName}. Phone: ${enquiry.phone}`,
  });
};

export const sendEnquiryStatusEmail = async ({ enquiry }) => {
  if (!enquiry.email) return { skipped: true };
  return sendEmail({
    to: enquiry.email,
    subject: `Enquiry update: ${enquiry.petName} is now ${enquiry.status}`,
    html: layout(
      'Enquiry status updated',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Hi ${enquiry.name}, your enquiry for <strong>${enquiry.petName}</strong> is now marked as <strong>${enquiry.status}</strong>.</p>
      <p style="margin:0;font-size:13px;color:#9ca3af;">Reply to this conversation by contacting us if you have questions.</p>
      `
    ),
    text: `Your enquiry for ${enquiry.petName} is now ${enquiry.status}.`,
  });
};

export const sendDonationThankYouEmail = async ({ email, name, amount }) =>
  sendEmail({
    to: email,
    subject: `Thank you for supporting ${SITE_NAME}`,
    html: layout(
      'Thank you for your donation!',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Hi${name ? ` ${name}` : ''}, we’re grateful for your kindness${
        amount ? ` of <strong>₹${amount}</strong>` : ''
      }. Your support helps feed, treat, and shelter pets in need.</p>
      <p style="margin:0 0 16px;line-height:1.6;color:#4b5563;">With love,<br/>The ${SITE_NAME} team</p>
      <p style="margin:0;"><a href="${CLIENT_URL}/donate" style="color:#ea580c;">Donate again</a></p>
      `
    ),
    text: `Thank you for supporting ${SITE_NAME}${amount ? ` with ₹${amount}` : ''}.`,
  });

export const sendDonationAdminEmail = async ({ email, name, amount, note }) => {
  const to = adminNotifyEmail();
  if (!to) return { skipped: true };
  return sendEmail({
    to,
    subject: `Donation reported${amount ? `: ₹${amount}` : ''} — ${name || email}`,
    html: layout(
      'Donation acknowledgment',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Someone reported a donation on the website.</p>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#9ca3af;">Name</td><td style="padding:6px 0;">${name || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Email</td><td style="padding:6px 0;">${email}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Amount</td><td style="padding:6px 0;">${amount ? `₹${amount}` : '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Note</td><td style="padding:6px 0;">${note || '-'}</td></tr>
      </table>
      `
    ),
    text: `Donation from ${name || email}${amount ? ` ₹${amount}` : ''}`,
  });
};

export const sendSellRequestConfirmationEmail = async ({ request }) =>
  sendEmail({
    to: request.sellerEmail,
    subject: `We received your sell request for ${request.name}`,
    html: layout(
      'Sell request received',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Hi ${request.sellerName}, thanks for listing <strong>${request.name}</strong> with ${SITE_NAME}. Our team will review your request shortly.</p>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#9ca3af;">Mode</td><td style="padding:6px 0;">${request.mode === 'other' ? 'Other (custom breed)' : 'Catalog category'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Pet</td><td style="padding:6px 0;">${request.name} (${request.breed || '-'})</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Price</td><td style="padding:6px 0;">₹${request.price}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Status</td><td style="padding:6px 0;">${request.status}</td></tr>
      </table>
      `
    ),
    text: `Hi ${request.sellerName}, we received your sell request for ${request.name}.`,
  });

export const sendSellRequestAdminEmail = async ({ request }) => {
  const to = adminNotifyEmail();
  if (!to) return { skipped: true };
  return sendEmail({
    to,
    subject: `New sell request: ${request.name} — ${request.sellerName}`,
    html: layout(
      'New pet sell request',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">A seller submitted a pet listing request.</p>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#9ca3af;">Seller</td><td style="padding:6px 0;">${request.sellerName}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Phone</td><td style="padding:6px 0;">${request.sellerPhone}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Email</td><td style="padding:6px 0;">${request.sellerEmail}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Mode</td><td style="padding:6px 0;">${request.mode}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Pet</td><td style="padding:6px 0;">${request.name} / ${request.breed || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Price</td><td style="padding:6px 0;">₹${request.price}</td></tr>
      </table>
      <p style="margin:16px 0 0;"><a href="${process.env.ADMIN_URL || CLIENT_URL}" style="color:#ea580c;">Review in admin</a></p>
      `
    ),
    text: `New sell request from ${request.sellerName} for ${request.name}`,
  });
};

export const sendSellStatusEmail = async ({ request }) =>
  sendEmail({
    to: request.sellerEmail,
    subject: `Sell request update: ${request.name} is ${request.status}`,
    html: layout(
      'Sell request updated',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Hi ${request.sellerName}, your listing request for <strong>${request.name}</strong> is now <strong>${request.status}</strong>.</p>
      ${request.adminNotes ? `<p style="margin:0;font-size:13px;color:#6b7280;">Note: ${request.adminNotes}</p>` : ''}
      `
    ),
    text: `Your sell request for ${request.name} is now ${request.status}.`,
  });
