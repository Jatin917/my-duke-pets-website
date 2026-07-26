/**
 * MSG91 OTP Widget — server-side access-token verification.
 * Docs: POST https://control.msg91.com/api/v5/widget/verifyAccessToken
 */

const VERIFY_URL = 'https://control.msg91.com/api/v5/widget/verifyAccessToken';

const decodeJwtPayload = (token) => {
  try {
    const part = String(token || '').split('.')[1];
    if (!part) return null;
    const json = Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/** Normalize to 10-digit Indian mobile. */
export const normalizeIndianMobile = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return '';
};

/**
 * Verify MSG91 widget JWT and return the verified 10-digit phone.
 * @param {string} accessToken - JWT from widget success callback
 */
export const verifyMsg91AccessToken = async (accessToken) => {
  const authkey = process.env.MSG91_AUTH_KEY;
  if (!authkey) {
    throw new Error('MSG91_AUTH_KEY is not configured on the server');
  }
  if (!accessToken) {
    throw new Error('MSG91 access token is required');
  }

  const response = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      authkey,
      'access-token': accessToken,
    }),
  });

  const json = await response.json().catch(() => ({}));

  const ok =
    response.ok &&
    (json?.type === 'success' ||
      String(json?.message || '')
        .toLowerCase()
        .includes('success') ||
      json?.hasError === false);

  if (!ok) {
    const reason =
      json?.message || json?.error || json?.msg || `MSG91 verification failed (${response.status})`;
    throw new Error(typeof reason === 'string' ? reason : 'MSG91 verification failed');
  }

  const payload = decodeJwtPayload(accessToken) || {};
  const phone = normalizeIndianMobile(
    payload.mobile ||
      payload.phone ||
      payload.phone_number ||
      payload.identifier ||
      payload.sub ||
      json?.mobile ||
      json?.phone ||
      json?.data?.mobile
  );

  if (!/^[0-9]{10}$/.test(phone)) {
    throw new Error('Could not read verified mobile number from MSG91 token');
  }

  return { phone, payload, raw: json };
};
