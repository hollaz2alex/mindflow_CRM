import {
  formatDistanceToNow,
  isToday,
  isYesterday,
  format,
  parseISO,
} from 'date-fns';

/** Safely coerce a timestamptz string (or Date) into a Date. */
function toDate(value) {
  if (!value) return null;
  return typeof value === 'string' ? parseISO(value) : value;
}

/** Gradient-friendly initials, e.g. "Ada Lovelace" → "AL". */
export function getInitials(firstName, lastName) {
  const a = (firstName || '').trim();
  const b = (lastName || '').trim();
  const initials = `${a.charAt(0)}${b.charAt(0)}`.toUpperCase();
  return initials || '?';
}

export function fullName(contact) {
  if (!contact) return '';
  return [contact.first_name, contact.last_name].filter(Boolean).join(' ');
}

/** "3 hours ago" style relative time. */
export function relativeTime(value) {
  const d = toDate(value);
  if (!d) return '';
  return formatDistanceToNow(d, { addSuffix: true });
}

/** Absolute date, e.g. "Jul 23, 2026". */
export function formatDate(value) {
  const d = toDate(value);
  if (!d) return '';
  return format(d, 'MMM d, yyyy');
}

/** Date + time, e.g. "Jul 23, 2026 · 2:14 PM". */
export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return '';
  return format(d, 'MMM d, yyyy · h:mm a');
}

/** Group heading for the activity feed: Today / Yesterday / weekday / date. */
export function dateGroupLabel(value) {
  const d = toDate(value);
  if (!d) return 'Unknown';
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  // Within the last week → weekday name; otherwise full date.
  const daysAgo = (Date.now() - d.getTime()) / 86_400_000;
  if (daysAgo < 7) return format(d, 'EEEE');
  return format(d, 'MMMM d, yyyy');
}

/** Bucket key so items on the same calendar day group together, newest first. */
export function dateGroupKey(value) {
  const d = toDate(value);
  if (!d) return 'unknown';
  return format(d, 'yyyy-MM-dd');
}
