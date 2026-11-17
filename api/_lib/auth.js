import { createHash, timingSafeEqual } from 'node:crypto';

/** True when the request carries `Authorization: Bearer <ADMIN_PASSWORD>`. Constant-time comparison. */
export function isAdmin(req) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  if (!m) return false;
  const a = createHash('sha256').update(m[1]).digest();
  const b = createHash('sha256').update(pw).digest();
  return timingSafeEqual(a, b);
}
