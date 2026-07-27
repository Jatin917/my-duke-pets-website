import nodemailer from 'nodemailer';

const SITE_NAME = process.env.SITE_NAME || 'My Duke';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

let smtpTransport = null;

const smtpConfigured = () =>
  Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD);

/** Human-readable SMTP / nodemailer error for logs and API responses. */
export const formatEmailError = (err) => {
  if (!err) return 'Unknown email error';
  if (typeof err === 'string') return err;
  const parts = [
    err.code,
    err.responseCode ? `SMTP ${err.responseCode}` : null,
    err.response || err.message,
  ].filter(Boolean);
  return parts.join(' — ') || 'Email send failed';
};

const getSmtpTransport = () => {
  if (!smtpConfigured()) return null;
  if (!smtpTransport) {
    const port = Number(process.env.SMTP_PORT || 465);
    smtpTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port,
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === 'true'
        : port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return smtpTransport;
};

const fromAddress = () =>
  process.env.SMTP_FROM || `${SITE_NAME} <${process.env.SMTP_USER}>`;

const adminNotifyEmail = () =>
  process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || '';

/** Verify SMTP credentials on server boot — logs a clear error if misconfigured. */
export const verifySmtpOnStartup = async () => {
  if (!smtpConfigured()) {
    console.warn('[email] SMTP not configured — set SMTP_USER and SMTP_PASSWORD');
    return false;
  }
  try {
    await getSmtpTransport().verify();
    console.log('[email] SMTP verified:', process.env.SMTP_HOST || 'smtp.hostinger.com');
    return true;
  } catch (err) {
    console.error('[email] SMTP verify failed:', formatEmailError(err));
    return false;
  }
};

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

const sendViaSmtp = async ({ to, subject, html, text }) => {
  const transport = getSmtpTransport();
  if (!transport) {
    return {
      success: false,
      error: 'SMTP is not configured (SMTP_USER / SMTP_PASSWORD missing)',
      provider: 'smtp',
    };
  }

  const info = await transport.sendMail({
    from: fromAddress(),
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
    text,
  });

  console.log('[email] SMTP sent:', subject, '→', to, info.messageId || '');
  return { success: true, data: info, provider: 'smtp' };
};

/**
 * Low-level send — SMTP only. Returns { success, error?, provider }.
 * Never throws; callers inspect success / use isEmailDeliveryFailure().
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    const error = 'No recipient address';
    console.warn('[email]', error, '—', subject);
    return { success: false, skipped: true, error, provider: 'smtp' };
  }

  try {
    return await sendViaSmtp({ to, subject, html, text });
  } catch (err) {
    const error = formatEmailError(err);
    console.error('[email] SMTP failed:', subject, '→', to);
    console.error('[email] Detail:', error);
    if (err.response) console.error('[email] SMTP response:', err.response);
    return { success: false, error, provider: 'smtp', code: err.code };
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

export const sendSellStatusEmail = async ({ request }) => {
  const rejected = String(request.status || '').toLowerCase() === 'rejected';
  return sendEmail({
    to: request.sellerEmail,
    subject: rejected
      ? `Listing update: ${request.name} was not approved`
      : `Sell request update: ${request.name} is ${request.status}`,
    html: layout(
      rejected ? 'Listing not approved' : 'Sell request updated',
      rejected
        ? `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Hi ${request.sellerName}, unfortunately your listing request for <strong>${request.name}</strong> was <strong>not approved</strong>.</p>
      ${request.adminNotes ? `<p style="margin:0 0 12px;font-size:14px;color:#6b7280;">Reason: ${request.adminNotes}</p>` : ''}
      <p style="margin:0;font-size:13px;color:#9ca3af;">You can update the details and submit again, or contact us for help.</p>
      `
        : `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Hi ${request.sellerName}, your listing request for <strong>${request.name}</strong> is now <strong>${request.status}</strong>.</p>
      ${request.adminNotes ? `<p style="margin:0;font-size:13px;color:#6b7280;">Note: ${request.adminNotes}</p>` : ''}
      `
    ),
    text: rejected
      ? `Your listing request for ${request.name} was not approved.${request.adminNotes ? ` Reason: ${request.adminNotes}` : ''}`
      : `Your sell request for ${request.name} is now ${request.status}.`,
  });
};

export const sendContactConfirmationEmail = async ({ form }) =>
  sendEmail({
    to: form.email,
    subject: `We received your message — ${SITE_NAME}`,
    html: layout(
      'Message received',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Hi ${form.name}, thanks for contacting ${SITE_NAME}. We’ve received your message and will reply shortly.</p>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#9ca3af;">Subject</td><td style="padding:6px 0;">${form.subject || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Phone</td><td style="padding:6px 0;">${form.phone || '-'}</td></tr>
      </table>
      `
    ),
    text: `Hi ${form.name}, we received your message on ${SITE_NAME}. We'll get back to you soon.`,
  });

export const sendContactAdminEmail = async ({ form }) => {
  const to = adminNotifyEmail();
  if (!to) return { skipped: true };
  return sendEmail({
    to,
    subject: `Contact form: ${form.subject || 'New message'} — ${form.name}`,
    html: layout(
      'New contact message',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Someone submitted the Contact Us form.</p>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#9ca3af;">Name</td><td style="padding:6px 0;">${form.name}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Phone</td><td style="padding:6px 0;">${form.phone || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Email</td><td style="padding:6px 0;">${form.email}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Subject</td><td style="padding:6px 0;">${form.subject || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Message</td><td style="padding:6px 0;">${form.message || '-'}</td></tr>
      </table>
      `
    ),
    text: `Contact from ${form.name} (${form.email}): ${form.subject || ''} — ${form.message || ''}`,
  });
};

export const sendHelpEnquiryConfirmationEmail = async ({ form }) =>
  sendEmail({
    to: form.email,
    subject: `We received your enquiry — ${SITE_NAME}`,
    html: layout(
      'Enquiry received',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Hi ${form.name}, thanks for reaching out. Our team will contact you within 24 hours.</p>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#9ca3af;">Intent</td><td style="padding:6px 0;">${form.intent || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Pet type</td><td style="padding:6px 0;">${form.petType || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">City</td><td style="padding:6px 0;">${form.city || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Phone</td><td style="padding:6px 0;">${form.phone || '-'}</td></tr>
      </table>
      `
    ),
    text: `Hi ${form.name}, we received your ${form.intent || 'enquiry'} on ${SITE_NAME}.`,
  });

export const sendHelpEnquiryAdminEmail = async ({ form }) => {
  const to = adminNotifyEmail();
  if (!to) return { skipped: true };
  return sendEmail({
    to,
    subject: `Help enquiry: ${form.intent || 'General'} — ${form.name}`,
    html: layout(
      'New help / enquiries form',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Someone submitted the Help / Enquiries form.</p>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#9ca3af;">Intent</td><td style="padding:6px 0;">${form.intent || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Name</td><td style="padding:6px 0;">${form.name}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Phone</td><td style="padding:6px 0;">${form.phone || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Email</td><td style="padding:6px 0;">${form.email}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Pet type</td><td style="padding:6px 0;">${form.petType || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">City</td><td style="padding:6px 0;">${form.city || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Message</td><td style="padding:6px 0;">${form.message || '-'}</td></tr>
      </table>
      `
    ),
    text: `Help enquiry from ${form.name} (${form.intent}): ${form.message || ''}`,
  });
};

export const sendRegistrationAdminEmail = async ({ customer }) => {
  const to = adminNotifyEmail();
  if (!to) return { skipped: true };
  return sendEmail({
    to,
    subject: `New user registered — ${customer.name || customer.email}`,
    html: layout(
      'New user registration',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">A new customer account was created on ${SITE_NAME}.</p>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#9ca3af;">Name</td><td style="padding:6px 0;">${customer.name || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Email</td><td style="padding:6px 0;">${customer.email || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Phone</td><td style="padding:6px 0;">${customer.phone || '-'}</td></tr>
      </table>
      `
    ),
    text: `New user: ${customer.name || '-'} / ${customer.email || '-'} / ${customer.phone || '-'}`,
  });
};

export const sendOtpFailureAdminEmail = async ({ email, error }) => {
  const to = adminNotifyEmail();
  if (!to) return { skipped: true };
  return sendEmail({
    to,
    subject: `OTP email failed — ${email}`,
    html: layout(
      'OTP delivery failed',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">An OTP email could not be delivered.</p>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#9ca3af;">Recipient</td><td style="padding:6px 0;">${email}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Error</td><td style="padding:6px 0;">${error || 'Unknown'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Time</td><td style="padding:6px 0;">${new Date().toISOString()}</td></tr>
      </table>
      `
    ),
    text: `OTP email failed for ${email}: ${error || 'Unknown'}`,
  });
};

export const sendSubmissionApologyEmail = async ({ email, name, context }) =>
  sendEmail({
    to: email,
    subject: `We received your ${context || 'request'} — delivery note from ${SITE_NAME}`,
    html: layout(
      'We have your request',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Hi${name ? ` ${name}` : ''}, we successfully received your <strong>${context || 'request'}</strong> on ${SITE_NAME}.</p>
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">Our confirmation email had a delivery hiccup, but your submission is safe with us and our team will follow up shortly.</p>
      <p style="margin:0;font-size:13px;color:#9ca3af;">If you need anything sooner, reply to this note or contact us from the website.</p>
      `
    ),
    text: `Hi${name ? ` ${name}` : ''}, we received your ${context || 'request'} on ${SITE_NAME}. Our team will follow up shortly.`,
  });

export const sendSubmissionFailureAdminEmail = async ({
  context,
  userEmail,
  userName,
  errorDetail,
}) => {
  const to = adminNotifyEmail();
  if (!to) return { skipped: true };
  return sendEmail({
    to,
    subject: `Email delivery issue — ${context || 'submission'}`,
    html: layout(
      'Transactional email failed',
      `
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563;">A confirmation email failed after a successful submission.</p>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#9ca3af;">Context</td><td style="padding:6px 0;">${context || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">User</td><td style="padding:6px 0;">${userName || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Email</td><td style="padding:6px 0;">${userEmail || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Detail</td><td style="padding:6px 0;">${errorDetail || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Time</td><td style="padding:6px 0;">${new Date().toISOString()}</td></tr>
      </table>
      `
    ),
    text: `Email failure after ${context}: ${userEmail} — ${errorDetail || ''}`,
  });
};

/** Returns true when an email result indicates delivery did not succeed. */
export const isEmailDeliveryFailure = (result) =>
  !result || result.skipped === true || result.success === false;

/** Returns true when any result is an explicit send failure (not skipped). */
export const hasEmailFailure = (results = []) =>
  results.some((r) => isEmailDeliveryFailure(r));

export const notifyDeliveryFailure = async ({
  userEmail,
  userName,
  context,
  results = [],
}) => {
  const errorDetail = results
    .filter((r) => r && r.success === false)
    .map((r) => (typeof r.error === 'string' ? r.error : JSON.stringify(r.error || r)))
    .join('; ');

  await Promise.all([
    userEmail
      ? sendSubmissionApologyEmail({ email: userEmail, name: userName, context })
      : Promise.resolve({ skipped: true }),
    sendSubmissionFailureAdminEmail({
      context,
      userEmail,
      userName,
      errorDetail: errorDetail || 'Unknown delivery error',
    }),
  ]);
};
