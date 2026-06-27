/**
 * Resolve the tenant slug from the subdomain.
 *   shop.digitalshopmanager.co.tz → 'shop'
 *   app.* / www.* / localhost      → null (Super Admin portal / dev)
 * In dev the backend derives the tenant from the JWT, so null is fine.
 */
export const resolveTenantSlug = () => {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return null;
  const parts = host.split('.');
  if (parts.length >= 3 && !['app', 'www'].includes(parts[0])) return parts[0];
  return null;
};
