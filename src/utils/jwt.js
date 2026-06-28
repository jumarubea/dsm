/** Decode a JWT payload (no verification) — used to read impersonation claims. */
export const decodeJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};
