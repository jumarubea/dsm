/** Format an ISO timestamp for display. */
export const formatDate = (iso) => {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso)
  );
};
