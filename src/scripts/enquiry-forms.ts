// Browser side of every public form (<form data-enquiry-form>): the Cloudflare Turnstile widget and the submit handler
// that POSTs the fields (including `cf-turnstile-response`) to /api/enquire.
//   - Turnstile's script is loaded once, on pages that have a form, and widgets are (re)rendered on page load and on
//     `astro:page-load`, so they also appear after client-side navigation.
//   - Browser checks run first (required fields, email format, the calendar's date check); the server validates again.
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widget?: string | HTMLElement) => void;
}
const turnstile = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile;

let loading: Promise<void> | null = null;
function loadTurnstile(): Promise<void> {
  if (turnstile()) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error('Turnstile failed to load'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

function renderWidgets() {
  const slots = Array.from(document.querySelectorAll<HTMLElement>('.cf-turnstile:not([data-rendered])'));
  if (!slots.length) return;
  loadTurnstile()
    .then(() => {
      slots.forEach((slot) => {
        if (slot.dataset.rendered) return;
        slot.dataset.rendered = '1';
        slot.dataset.widget = turnstile()!.render(slot, { sitekey: slot.dataset.sitekey, theme: 'light' });
      });
    })
    .catch(() => {
      const note = slots[0].closest('form')?.querySelector<HTMLElement>('[data-form-message]');
      if (note) showMessage(note, 'The security check could not load. Please check your connection and reload the page.');
    });
}

function showMessage(box: HTMLElement, text: string) {
  box.textContent = text;
  box.hidden = false;
}

function clearErrors(form: HTMLFormElement) {
  form.querySelectorAll('.field-error-text.js-api-err').forEach((n) => n.remove());
  form.querySelectorAll('[aria-invalid="true"]').forEach((n) => n.removeAttribute('aria-invalid'));
  const box = form.querySelector<HTMLElement>('[data-form-message]');
  if (box) box.hidden = true;
}

function showFieldErrors(form: HTMLFormElement, errors: Record<string, string>) {
  let first: HTMLElement | null = null;
  for (const [name, message] of Object.entries(errors)) {
    const input = form.querySelector<HTMLElement>(`[name="${name}"]`);
    const field = input?.closest('.form-field');
    if (!input || !field) continue;
    (field.querySelector('.date-btn') ?? input).setAttribute('aria-invalid', 'true');
    const span = document.createElement('span');
    span.className = 'field-error-text js-api-err';
    span.textContent = message;
    field.appendChild(span);
    first ??= (field.querySelector('.date-btn') as HTMLElement | null) ?? input;
  }
  first?.focus();
}

function showThanks(form: HTMLFormElement) {
  const notice = document.createElement('div');
  notice.className = 'form-notice';
  notice.setAttribute('role', 'status');
  notice.id = form.id;
  const strong = document.createElement('strong');
  strong.textContent = form.dataset.successTitle || 'Thank you — your message has been received.';
  notice.appendChild(strong);
  notice.appendChild(document.createTextNode(' ' + (form.dataset.successText || '')));
  form.replaceWith(notice);
  notice.setAttribute('tabindex', '-1');
  notice.scrollIntoView({ block: 'center', behavior: 'smooth' });
  notice.focus({ preventScroll: true });
}

async function submit(form: HTMLFormElement) {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const label = button?.textContent ?? '';
  const box = form.querySelector<HTMLElement>('[data-form-message]');
  clearErrors(form);

  const data = new FormData(form);
  if (!data.get('cf-turnstile-response')) {
    if (box) showMessage(box, 'Please complete the security check above the button.');
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = 'Sending…';
  }
  form.setAttribute('aria-busy', 'true');
  const widget = form.querySelector<HTMLElement>('.cf-turnstile')?.dataset.widget;
  try {
    const res = await fetch(form.dataset.endpoint || '/api/enquire', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    const out = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; errors?: Record<string, string> };
    if (res.ok && out.ok) {
      showThanks(form);
      return;
    }
    if (out.errors) showFieldErrors(form, out.errors);
    if (box && (out.message || !out.errors)) showMessage(box, out.message || 'Sorry, something went wrong. Please try again in a moment.');
  } catch {
    if (box) showMessage(box, 'We could not reach the server. Please check your connection and try again.');
  }
  // A Turnstile token works once, so a retry needs a fresh one.
  if (widget) turnstile()?.reset(widget);
  if (button) {
    button.disabled = false;
    button.textContent = label;
  }
  form.removeAttribute('aria-busy');
}

// Listening on the document (not the form) keeps this working for forms that arrive with client-side navigation, and
// lets the calendar's own check (registered on the form) run first and stop the submit.
document.addEventListener('submit', (event) => {
  const form = event.target as HTMLFormElement | null;
  if (!form || !form.matches || !form.matches('form[data-enquiry-form]')) return;
  if (event.defaultPrevented) return; // the calendar's "choose a date" check already stopped this submit
  event.preventDefault();
  void submit(form);
});

renderWidgets();
document.addEventListener('astro:page-load', renderWidgets);
