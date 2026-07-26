/**
 * One-off SMTP test: node scripts/send-test-email.js [recipient]
 * Defaults to ADMIN_NOTIFY_EMAIL from .env
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { sendEmail } = await import('../src/utils/email.js');

const to =
  process.argv[2] ||
  process.env.TEST_EMAIL ||
  process.env.ADMIN_NOTIFY_EMAIL ||
  process.env.ADMIN_EMAIL;

if (!to) {
  console.error('No recipient. Pass an email: node scripts/send-test-email.js you@example.com');
  process.exit(1);
}

console.log('SMTP host:', process.env.SMTP_HOST || 'smtp.hostinger.com');
console.log('SMTP user:', process.env.SMTP_USER);
console.log('From:', process.env.SMTP_FROM || process.env.RESEND_FROM_EMAIL);
console.log('To:', to);

const result = await sendEmail({
  to,
  subject: `My Duke SMTP test — ${new Date().toLocaleString('en-IN')}`,
  html: `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
      <h2 style="color:#ea580c;margin:0 0 12px;">SMTP is working</h2>
      <p style="color:#374151;line-height:1.6;">
        This is a test email from <strong>My Duke</strong> sent via
        <code>${process.env.SMTP_USER || 'SMTP'}</code> on Hostinger.
      </p>
      <p style="color:#6b7280;font-size:13px;margin-top:20px;">
        Sent at ${new Date().toISOString()}
      </p>
    </div>
  `,
  text: `My Duke SMTP test sent at ${new Date().toISOString()} from ${process.env.SMTP_USER}`,
});

console.log('Result:', result);
process.exit(result?.success ? 0 : 1);
