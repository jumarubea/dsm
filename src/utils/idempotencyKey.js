/**
 * Generate an Idempotency-Key (UUID v4). Generate ONCE when a form opens and
 * reuse it on retry — do not regenerate per attempt.
 */
export const generateIdempotencyKey = () => crypto.randomUUID();
