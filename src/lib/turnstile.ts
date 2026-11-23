// Cloudflare Turnstile (free CAPTCHA alternative).
//  - The SITE key is public: it goes in the page next to the widget.
//  - The SECRET key never goes in the repository. It is the Worker secret TURNSTILE_SECRET_KEY
//    (production: `npx wrangler secret put TURNSTILE_SECRET_KEY`; local: .dev.vars).
// On localhost the real site key is only accepted if "localhost" is listed on the widget in the Cloudflare dashboard, so
// `astro dev` uses Cloudflare's published always-passes test key; pair it with the test secret in .dev.vars.example.
export const TURNSTILE_SITE_KEY = import.meta.env.DEV ? '1x00000000000000000000AA' : '0x4AAAAAAGPXHRZ3skKDZVCX';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileResult =
  | { ok: true }
  | { ok: false; reason: 'missing' | 'rejected' | 'not_configured' | 'unreachable'; codes?: string[] };

export async function verifyTurnstile(secret: string | undefined, token: string, ip: string | null): Promise<TurnstileResult> {
  if (!secret) {
    // A deployment problem, not the visitor's: the Worker has no TURNSTILE_SECRET_KEY (a *build* variable is not enough,
    // it must be a runtime Secret on the Worker).
    console.error('[turnstile] TURNSTILE_SECRET_KEY is not set on this Worker: every submission is refused until it is.');
    return { ok: false, reason: 'not_configured' };
  }
  if (!token) return { ok: false, reason: 'missing' };
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(8000) });
    const outcome = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (outcome.success) return { ok: true };
    const codes = outcome['error-codes'] ?? [];
    console.warn('[turnstile] siteverify said no:', codes.join(',') || '(no codes)');
    // "invalid-input-secret" / "missing-input-secret" mean the configured secret is wrong, which is again a setup problem.
    if (codes.some((c) => c.includes('secret'))) return { ok: false, reason: 'not_configured', codes };
    return { ok: false, reason: 'rejected', codes };
  } catch (error) {
    console.error('[turnstile] siteverify request failed:', error);
    return { ok: false, reason: 'unreachable' };
  }
}
