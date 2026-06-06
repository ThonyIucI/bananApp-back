import dayjs from 'dayjs';

/** Formats an ISO 8601 string as `DD/MM/YYYY HH:mm`. Returns the raw value if unparseable. */
export const formatDateTime = (iso: string): string => {
  const d = dayjs(iso);
  return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : iso;
};

/** Returns the ISO 8601 week-of-year (1–53) for the given date. */
export const getWeekOfYear = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dow = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dow);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};
