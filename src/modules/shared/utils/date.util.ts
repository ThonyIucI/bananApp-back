import dayjs from 'dayjs';

/** Formats an ISO 8601 string as `DD/MM/YYYY HH:mm`. Returns the raw value if unparseable. */
export const formatDateTime = (iso: string): string => {
  const d = dayjs(iso);
  return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : iso;
};
