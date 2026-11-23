// Validation for the two public forms (traveler enquiry and trade-partner proposal). Used by POST /api/enquire, which
// validates every field on the server whatever the browser-side attributes say.
import { z } from 'astro/zod';

export const PURPOSES = [
  'Plan A New Trip',
  'Group Or Family Journey',
  'An Existing Booking',
  'Press Or Partnership',
  'General Question',
] as const;

export const PARTNER_TYPES = [
  'Travel Agent Or Tour Operator',
  'Hotel Or Lodge',
  'Guide, Driver Or Transport',
  'Experience Or Activity Provider',
  'Media Or Content Partner',
  'Other',
] as const;

const optionalText = (max: number, message: string) => z.string().trim().max(max, message).nullish();

// An empty string (untouched date picker) is allowed; anything else must be a real calendar date.
const isoDate = z
  .string()
  .trim()
  .refine((v) => v === '' || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`))), 'Please choose a valid date.');

// Form fields arrive as strings; an empty number box means "not given".
const optionalInt = (min: number, max: number, label: string) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().int(`${label} must be a whole number.`).min(min, `${label} must be at least ${min}.`).max(max, `${label} must be ${max} or fewer.`).nullable(),
  );

const phone = z
  .string()
  .trim()
  .max(30, 'That phone number is too long.')
  .refine((v) => v === '' || /^[0-9+()\-.\s]{5,30}$/.test(v), 'Please enter a valid phone number.')
  .nullish();

const enquiryFields = z.object({
  purpose: z.string().trim().max(60).nullish(),
  name: z.string().trim().min(2, 'Please enter your name (at least 2 characters).').max(100, 'Your name is too long (100 characters maximum).'),
  email: z.string().trim().max(200, 'That email address is too long.').pipe(z.email('Please enter a valid email address.')),
  phone,
  country: optionalText(80, 'Home country is too long (80 characters maximum).'),
  preferred_dates: optionalText(100, 'Travel dates are too long (100 characters maximum).'),
  // Tour-page form: real dates from the calendar (YYYY-MM-DD), combined into "preferred dates" when saved.
  arrival_date: isoDate.nullish(),
  departure_date: isoDate.nullish(),
  travellers: optionalInt(1, 50, 'Travelers'),
  message: z.string().trim().max(2000, 'Your message is too long (2000 characters maximum).').nullish(),
  tour: z.string().trim().max(200).nullish(),
});

// Every field is required. The tour-page form (it has a `tour`) asks for arrival and departure dates; the general form for
// preferred dates in words.
export const enquirySchema = enquiryFields.superRefine((v, ctx) => {
  const need = (field: string, value: unknown, message: string) => {
    if (value === null || value === undefined || value === '') ctx.addIssue({ code: 'custom', path: [field], message });
  };
  need('phone', v.phone, 'Please enter your phone or WhatsApp number.');
  need('country', v.country, v.tour ? 'Please enter your nationality.' : 'Please enter your home country.');
  need('travellers', v.travellers, 'Please enter the number of travelers.');
  if (v.tour) {
    need('arrival_date', v.arrival_date, 'Please choose your arrival date.');
    need('departure_date', v.departure_date, 'Please choose your departure date.');
  } else {
    need('preferred_dates', v.preferred_dates, 'Please tell us your preferred travel dates.');
  }
  if ((v.message?.trim() ?? '').length < 10) {
    ctx.addIssue({ code: 'custom', path: ['message'], message: 'Please tell us a little about your trip (at least 10 characters).' });
  }
  if (v.arrival_date && v.departure_date && v.departure_date < v.arrival_date) {
    ctx.addIssue({ code: 'custom', path: ['departure_date'], message: 'Departure cannot be before arrival.' });
  }
});

// Business-to-business partnership proposal. Saved in the same inbox as other enquiries (purpose "Trade Partnership"),
// with the company details written at the top of the message.
export const partnerSchema = z.object({
  partner_type: z.string().trim().max(60).nullish(),
  company: z.string().trim().min(2, 'Please enter your company name.').max(120, 'The company name is too long (120 characters maximum).'),
  name: z.string().trim().min(2, 'Please enter your name (at least 2 characters).').max(100, 'Your name is too long (100 characters maximum).'),
  role: z.string().trim().max(80, 'Your role is too long (80 characters maximum).').nullish(),
  email: z.string().trim().max(200, 'That email address is too long.').pipe(z.email('Please enter a valid email address.')),
  phone,
  country: z.string().trim().min(2, 'Please enter your country.').max(80, 'The country is too long (80 characters maximum).'),
  website: z.string().trim().max(200, 'The website address is too long.').nullish(),
  message: z.string().trim().min(10, 'Please tell us a little about how we could work together (at least 10 characters).').max(2000, 'Your message is too long (2000 characters maximum).'),
});
