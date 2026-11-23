// Email notification for a new enquiry, sent with the Resend API (https://resend.com).
// Fail-safe by design: the enquiry is already saved in D1 before this runs, so a missing key or a failed send is only
// logged and never turns a saved enquiry into an error for the visitor.
//   RESEND_API_KEY      Worker secret (not set = emails are skipped and a log line is written)
//   ENQUIRY_FROM_EMAIL  optional, e.g. "Altara Bhutan <enquiries@altarabhutan.com>" (needs the domain verified in Resend).
//                       The default sender only delivers to the Resend account's own email address.
//   ENQUIRY_TO_EMAIL    optional, defaults to the owner's inbox below.
import { env } from 'cloudflare:workers';

const DEFAULT_TO = 'Basanbt07@gmail.com';
const DEFAULT_FROM = 'Altara Bhutan <onboarding@resend.dev>';

interface MailEnv {
  RESEND_API_KEY?: string;
  ENQUIRY_FROM_EMAIL?: string;
  ENQUIRY_TO_EMAIL?: string;
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

export interface Notification {
  subject: string;
  replyTo: string;
  /** Label → value pairs, shown in order. Empty values are left out. */
  fields: [string, string | number | null | undefined][];
}

export async function notifyEnquiry(note: Notification): Promise<{ sent: boolean; reason?: string }> {
  const mail = env as unknown as MailEnv;
  if (!mail.RESEND_API_KEY) {
    console.warn(`[notify] RESEND_API_KEY is not set, so no email was sent for: ${note.subject} (the enquiry is saved in the admin inbox).`);
    return { sent: false, reason: 'no-api-key' };
  }
  const rows = note.fields.filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '');
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html =
    '<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">' +
    rows.map(([k, v]) => `<tr><td valign="top"><strong>${escapeHtml(k)}</strong></td><td style="white-space:pre-wrap">${escapeHtml(String(v))}</td></tr>`).join('') +
    '</table>';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${mail.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: mail.ENQUIRY_FROM_EMAIL || DEFAULT_FROM,
        to: [mail.ENQUIRY_TO_EMAIL || DEFAULT_TO],
        reply_to: note.replyTo,
        subject: note.subject,
        text,
        html,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      // Typical causes: 403 "domain is not verified" (the from-address must be on a verified Resend domain, or be
      // onboarding@resend.dev, which only delivers to the Resend account's own email), 401 bad API key, 422 bad address.
      const detail = (await res.text()).slice(0, 400);
      console.error(`[notify] Resend refused the email (HTTP ${res.status}) from=${mail.ENQUIRY_FROM_EMAIL || DEFAULT_FROM}: ${detail}`);
      return { sent: false, reason: `resend-${res.status}` };
    }
    return { sent: true };
  } catch (error) {
    console.error('[notify] email failed:', error);
    return { sent: false, reason: 'network' };
  }
}
