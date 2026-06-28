/** Extract a user-facing message from an axios error (backend error shape). */
export const apiMessage = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.error?.message || fallback;

/** Per-field validation errors, if the backend returned any. */
export const apiFields = (err) => err?.response?.data?.error?.fields || null;
