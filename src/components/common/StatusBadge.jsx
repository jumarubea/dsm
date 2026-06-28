import { Badge } from './Badge.jsx';

const SALE_TONE = {
  COMPLETED: 'ok',
  VOIDED: 'danger',
  PENDING: 'warn',
  PREPARED: 'default',
  DELIVERED: 'ok',
};
const PAY_TONE = { COMPLETED: 'ok', PENDING: 'warn', FAILED: 'danger', TIMEOUT: 'danger' };
const TENANT_TONE = {
  active: 'ok',
  trialing: 'default',
  past_due: 'warn',
  suspended: 'danger',
  cancelled: 'danger',
};

export const TenantStatusBadge = ({ status }) => (
  <Badge tone={TENANT_TONE[status] || 'default'}>{status}</Badge>
);

export const SaleStatusBadge = ({ status }) => (
  <Badge tone={SALE_TONE[status] || 'default'}>{status}</Badge>
);
export const PaymentStatusBadge = ({ status }) => (
  <Badge tone={PAY_TONE[status] || 'default'}>{status}</Badge>
);
