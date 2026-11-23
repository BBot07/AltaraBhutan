// POST /api/enquire — the one endpoint behind every public form (traveler enquiry, tour-page enquiry, trade proposal).
//   1. Cloudflare Turnstile token (`cf-turnstile-response`) is verified with Cloudflare; 400 if it fails.
//   2. Fields are validated on the server (src/lib/enquiry-schemas.ts); 400 with per-field messages if invalid.
//   3. The enquiry is saved to D1 (the `enquiries` table, read in /admin/enquiries).
//   4. The owner is emailed (src/lib/notify.ts); a failed email never fails the request.
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { z } from 'astro/zod';
import { createEnquiry, getTourBySlug, db } from '../../lib/db';
import { formatDate } from '../../lib/text';
import { PARTNER_TYPES, PURPOSES, enquirySchema, partnerSchema } from '../../lib/enquiry-schemas';
import { verifyTurnstile } from '../../lib/turnstile';
import { notifyEnquiry } from '../../lib/notify';

export const prerender = false;

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

async function readFields(request: Request): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const data = (await request.json()) as Record<string, unknown>;
    for (const [k, v] of Object.entries(data ?? {})) if (typeof v === 'string' || typeof v === 'number') out[k] = String(v);
  } else {
    for (const [k, v] of await request.formData()) if (typeof v === 'string') out[k] = v;
  }
  return out;
}

const firstErrors = (error: z.ZodError) => {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    errors[key] ??= issue.message;
  }
  return errors;
};

export const POST: APIRoute = async ({ request }) => {
  let fields: Record<string, string>;
  try {
    fields = await readFields(request);
  } catch {
    return json({ ok: false, message: 'We could not read that form. Please try again.' }, 400);
  }

  // 1. Turnstile
  const ip = request.headers.get('CF-Connecting-IP');
  const secret = (env as unknown as { TURNSTILE_SECRET_KEY?: string }).TURNSTILE_SECRET_KEY;
  const human = await verifyTurnstile(secret, fields['cf-turnstile-response'] ?? '', ip);
  if (!human.ok) {
    const failures = {
      missing: [400, 'Please complete the security check above the button.'],
      rejected: [400, 'The security check expired or could not be verified. Please tick it again and resend.'],
      not_configured: [503, 'Our enquiry form is temporarily unavailable. Please email hello@altarabhutan.com or message us on WhatsApp and we will reply the same day.'],
      unreachable: [503, 'We could not reach the security service just now. Please try again in a moment.'],
    } as const;
    const [status, message] = failures[human.reason];
    return json({ ok: false, code: `turnstile_${human.reason}`, message, codes: human.codes }, status);
  }

  const kind = fields.form_type === 'partner' ? 'partner' : 'enquiry';

  // Honeypot: a field people never see. Bots that fill it are told it worked; nothing is saved.
  const trap = kind === 'partner' ? fields.hp : fields.website;
  if (trap) return json({ ok: true });

  try {
    if (kind === 'partner') {
      const parsed = partnerSchema.safeParse(fields);
      if (!parsed.success) return json({ ok: false, errors: firstErrors(parsed.error) }, 400);
      const input = parsed.data;
      const type = (PARTNER_TYPES as readonly string[]).includes(input.partner_type ?? '') ? (input.partner_type as string) : 'Other';
      const header = [`Company: ${input.company}`, `Partner type: ${type}`, input.role ? `Role: ${input.role}` : '', input.website ? `Website: ${input.website}` : '']
        .filter(Boolean)
        .join('\n');
      await createEnquiry({
        tour_id: null,
        purpose: 'Trade Partnership',
        name: input.name,
        email: input.email,
        phone: input.phone ?? '',
        country: input.country,
        preferred_dates: '',
        travellers: null,
        message: `${header}\n\n${input.message}`,
      });
      const mailed = await notifyEnquiry({
        subject: oneLine(`New trade partnership proposal - ${input.company} - ${input.name}`),
        replyTo: input.email,
        fields: [
          ['Company', input.company],
          ['Partner type', type],
          ['Name', input.name],
          ['Role', input.role],
          ['Email', input.email],
          ['Phone / WhatsApp', input.phone],
          ['Country', input.country],
          ['Website', input.website],
          ['Message', input.message],
        ],
      });
      return json({ ok: true, emailed: mailed.sent });
    }

    const parsed = enquirySchema.safeParse(fields);
    if (!parsed.success) return json({ ok: false, errors: firstErrors(parsed.error) }, 400);
    const input = parsed.data;

    let tourId: number | null = null;
    let tourTitle = '';
    if (input.tour) {
      const tour = await getTourBySlug(input.tour);
      tourId = tour?.id ?? null; // an unknown or draft tour is simply not linked
      tourTitle = tour?.title ?? '';
    }
    const message = input.message?.trim() || `Enquiry about ${tourTitle || 'a tour'}.`;

    // "10 April 2027 – 16 April 2027", "From 10 April 2027" or "Until 16 April 2027"; falls back to the free-text field.
    const arrival = input.arrival_date ? formatDate(input.arrival_date) : '';
    const departure = input.departure_date ? formatDate(input.departure_date) : '';
    const preferredDates = arrival && departure ? `${arrival} – ${departure}` : arrival ? `From ${arrival}` : departure ? `Until ${departure}` : (input.preferred_dates ?? '');
    const purpose = (PURPOSES as readonly string[]).includes(input.purpose ?? '') ? (input.purpose as string) : '';

    await createEnquiry({
      tour_id: tourId,
      purpose,
      name: input.name,
      email: input.email,
      phone: input.phone ?? '',
      country: input.country ?? '',
      preferred_dates: preferredDates,
      travellers: input.travellers ?? null,
      message,
    });
    const mailed = await notifyEnquiry({
      subject: oneLine(`New ${tourTitle ? 'tour enquiry' : 'enquiry'} - ${tourTitle || purpose || 'General'} - ${input.name}`),
      replyTo: input.email,
      fields: [
        ['Tour', tourTitle],
        ['What can we help with', purpose],
        ['Name', input.name],
        ['Email', input.email],
        ['Phone / WhatsApp', input.phone],
        [tourTitle ? 'Nationality' : 'Home country', input.country],
        ['Travel dates', preferredDates],
        ['Travelers', input.travellers],
        ['Message', message],
      ],
    });
    return json({ ok: true, emailed: mailed.sent });
  } catch (error) {
    console.error('[enquire] could not save the enquiry:', error);
    return json({ ok: false, message: 'Sorry, something went wrong on our side. Please try again in a moment, or reach us on WhatsApp or email.' }, 500);
  }
};

// GET /api/enquire: setup check. Reports only whether each piece is configured (never a value), so a visitor-facing
// "temporarily unavailable" can be diagnosed from a browser without reading logs.
export const GET: APIRoute = async () => {
  const e = env as unknown as { TURNSTILE_SECRET_KEY?: string; RESEND_API_KEY?: string; DB?: unknown };
  let database = false;
  try {
    await db().prepare('SELECT 1 FROM enquiries LIMIT 1').first();
    database = true;
  } catch {
    database = false;
  }
  return json({ turnstileSecret: !!e.TURNSTILE_SECRET_KEY, resendKey: !!e.RESEND_API_KEY, database });
};
