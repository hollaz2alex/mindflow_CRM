// ---------------------------------------------------------------------------
// Enums — MUST stay in sync with the Postgres CHECK constraints in
// supabase/migrations. Changing one without the other is a bug.
// ---------------------------------------------------------------------------

export const CATEGORIES = [
  'potential_client',
  'event_attendee',
  'app_user',
  'shop_buyer',
  'partner',
  'sponsor',
  'contractor',
  'other',
];

export const CLIENT_TYPES = ['enterprise_b2b', 'consumer_d2c'];

export const STAGES = [
  'new_lead',
  'contacted',
  'engaged',
  'qualified',
  'converted',
  'inactive',
];

export const SOURCES = [
  'website',
  'referral',
  'event',
  'social_media',
  'app',
  'shop',
  'cold_outreach',
  'other',
];

export const ACTIVITY_TYPES = [
  'email',
  'call',
  'meeting',
  'note',
  'event',
  'purchase',
  'app_signup',
  'follow_up',
  'other',
];

// Fallbacks used by CSV normalization (see below) and defensive UI code.
export const DEFAULT_CATEGORY = 'other';
export const DEFAULT_STAGE = 'new_lead';
export const DEFAULT_SOURCE = 'other';
export const DEFAULT_ACTIVITY_TYPE = 'note';

// ---------------------------------------------------------------------------
// Human-readable labels
// ---------------------------------------------------------------------------

/** Turn a snake_case enum into "Title Case" for display. */
export function labelize(value) {
  if (!value) return '';
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const STAGE_LABELS = Object.fromEntries(
  STAGES.map((s) => [s, labelize(s)])
);
export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((c) => [c, labelize(c)])
);
export const SOURCE_LABELS = Object.fromEntries(
  SOURCES.map((s) => [s, labelize(s)])
);
export const CLIENT_TYPE_LABELS = {
  enterprise_b2b: 'Enterprise (B2B)',
  consumer_d2c: 'Consumer (D2C)',
};
export const ACTIVITY_TYPE_LABELS = Object.fromEntries(
  ACTIVITY_TYPES.map((t) => [t, labelize(t)])
);

// ---------------------------------------------------------------------------
// Color maps
// ---------------------------------------------------------------------------

// Stage badges use the -50/-700 pair; pipeline bar segments use -500 (-400 for gray).
export const STAGE_BADGE = {
  new_lead: 'bg-blue-50 text-blue-700',
  contacted: 'bg-cyan-50 text-cyan-700',
  engaged: 'bg-violet-50 text-violet-700',
  qualified: 'bg-amber-50 text-amber-700',
  converted: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-500',
};

export const STAGE_BAR = {
  new_lead: 'bg-blue-500',
  contacted: 'bg-cyan-500',
  engaged: 'bg-violet-500',
  qualified: 'bg-amber-500',
  converted: 'bg-emerald-500',
  inactive: 'bg-gray-400',
};

// Category badges. `hex` feeds the Recharts fills on the dashboard.
export const CATEGORY_BADGE = {
  potential_client: 'bg-indigo-50 text-indigo-700',
  event_attendee: 'bg-pink-50 text-pink-700',
  app_user: 'bg-sky-50 text-sky-700',
  shop_buyer: 'bg-teal-50 text-teal-700',
  partner: 'bg-purple-50 text-purple-700',
  sponsor: 'bg-orange-50 text-orange-700',
  contractor: 'bg-rose-50 text-rose-700',
  other: 'bg-gray-100 text-gray-500',
};

export const CATEGORY_HEX = {
  potential_client: '#6366f1', // indigo-500
  event_attendee: '#ec4899', // pink-500
  app_user: '#0ea5e9', // sky-500
  shop_buyer: '#14b8a6', // teal-500
  partner: '#a855f7', // purple-500
  sponsor: '#f97316', // orange-500
  contractor: '#f43f5e', // rose-500
  other: '#9ca3af', // gray-400
};

// ---------------------------------------------------------------------------
// CSV import — header alias tables + normalization helpers
// ---------------------------------------------------------------------------

/** CRM fields a CSV column can be mapped to. */
export const CSV_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'company',
  'location',
  'category',
  'stage',
  'source',
  'notes',
  'tags',
  'assigned_to',
  'last_event_date',
  'client_type',
];

// Lowercased header aliases → canonical field. Used to auto-detect mappings.
export const CSV_ALIASES = {
  first_name: ['first name', 'firstname', 'first', 'given name', 'fname'],
  last_name: ['last name', 'lastname', 'last', 'surname', 'family name', 'lname'],
  email: ['email', 'e-mail', 'email address', 'mail'],
  phone: ['phone', 'phone number', 'mobile', 'cell', 'telephone', 'tel'],
  company: ['company', 'organization', 'organisation', 'org', 'business'],
  location: ['location', 'city', 'address', 'region', 'country'],
  category: ['category', 'type', 'segment'],
  stage: ['stage', 'status', 'pipeline stage', 'pipeline'],
  source: ['source', 'lead source', 'origin', 'channel'],
  notes: ['notes', 'note', 'comments', 'description'],
  tags: ['tags', 'tag', 'labels'],
  assigned_to: ['assigned to', 'assigned', 'owner', 'rep', 'account owner'],
  last_event_date: ['last event date', 'event date', 'last event'],
  client_type: ['client type', 'clienttype', 'client_type'],
};

/** Slugify a free-text value to snake_case for enum matching. */
export function slugify(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/** Match a raw value to an enum, falling back when it's not a member. */
export function normalizeEnum(value, allowed, fallback) {
  const slug = slugify(value);
  return allowed.includes(slug) ? slug : fallback;
}

/** client_type is nullable — return a valid value or null (never a fallback). */
export function normalizeClientType(value) {
  const slug = slugify(value);
  return CLIENT_TYPES.includes(slug) ? slug : null;
}

/** Split a comma-separated tag cell into a clean string[]. */
export function normalizeTags(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Auto-detect a { header: field } mapping from CSV headers via aliases. */
export function autoDetectMapping(headers) {
  const mapping = {};
  const used = new Set();
  for (const header of headers) {
    const key = String(header ?? '').trim().toLowerCase();
    for (const field of CSV_FIELDS) {
      if (used.has(field)) continue;
      const aliases = CSV_ALIASES[field] || [];
      if (key === field || aliases.includes(key)) {
        mapping[header] = field;
        used.add(field);
        break;
      }
    }
  }
  return mapping;
}
