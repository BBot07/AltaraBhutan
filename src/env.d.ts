/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    /** Set by the middleware on authenticated /admin requests. */
    user?: { id: number; email: string };
  }
}

// The original map script reads each district's name from a `title` attribute on its <path>.
declare namespace astroHTML.JSX {
  interface SVGAttributes {
    title?: string;
  }
}

// Worker secrets and variables that `wrangler types` cannot see (they are set with `wrangler secret put`, not in wrangler.jsonc).
declare namespace Cloudflare {
  interface Env {
    /** Cloudflare Turnstile secret key; required for every public form. */
    TURNSTILE_SECRET_KEY?: string;
    /** Resend API key; optional (enquiries are always saved in D1, the email is skipped without it). */
    RESEND_API_KEY?: string;
    ENQUIRY_FROM_EMAIL?: string;
    ENQUIRY_TO_EMAIL?: string;
  }
}
