/**
 * MSG91 OTP Widget — server-side access-token verification.
 * Docs: POST https://control.msg91.com/api/v5/widget/verifyAccessToken
 * @see https://docs.msg91.com/otp-widget/verify-access-token
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

const isLikelyMobile = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  // 10-digit local or 91XXXXXXXXXX
  if (/^[6-9]\d{9}$/.test(digits)) return true;
  if (/^91[6-9]\d{9}$/.test(digits)) return true;
  return false;
};

/**
 * Walk MSG91 JWT / API response for any phone-like value.
 * Token shapes vary: mobile, phone, identifier, nested data.user, etc.
 */
const extractPhoneFromUnknown = (value, depth = 0) => {
  if (value == null || depth > 6) return '';

  if (typeof value === 'string' || typeof value === 'number') {
    if (isLikelyMobile(value)) return normalizeIndianMobile(value);
    return '';
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractPhoneFromUnknown(item, depth + 1);
      if (found) return found;
    }
    return '';
  }

  if (typeof value === 'object') {
    const preferredKeys = [
      'mobile',
      'phone',
      'phone_number',
      'phoneNumber',
      'phonenumber',
      'identifier',
      'contact',
      'msisdn',
      'number',
      'sub',
    ];

    for (const key of preferredKeys) {
      if (value[key] != null) {
        const found = extractPhoneFromUnknown(value[key], depth + 1);
        if (found) return found;
      }
    }

    for (const [key, nested] of Object.entries(value)) {
      // Skip JWT metadata that is never a phone
      if (['iat', 'exp', 'nbf', 'iss', 'aud', 'jti', 'widgetId', 'widget_id', 'reqId'].includes(key)) {
        continue;
      }
      const found = extractPhoneFromUnknown(nested, depth + 1);
      if (found) return found;
    }
  }

  return '';
};

/**
 * Verify MSG91 widget JWT and return the verified 10-digit phone.
 * @param {string} accessToken - JWT from widget success callback
 * @param {{ fallbackPhone?: string }} [options] - client-entered phone if token omits mobile claim
 */
export const verifyMsg91AccessToken = async (accessToken, options = {}) => {
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

  const explicitError =
    json?.type === 'error' ||
    json?.hasError === true ||
    (!response.ok && response.status !== 200);

  if (explicitError || !response.ok) {
    const reason =
      json?.message || json?.error || json?.msg || `MSG91 verification failed (${response.status})`;
    throw new Error(typeof reason === 'string' ? reason : 'MSG91 verification failed');
  }

  const payload = decodeJwtPayload(accessToken) || {};

  let phone =
    extractPhoneFromUnknown(payload) ||
    extractPhoneFromUnknown(json) ||
    normalizeIndianMobile(options.fallbackPhone);

  // Token verified with MSG91 — if JWT has no mobile claim, trust client phone
  // only after successful verifyAccessToken (OTP already proved ownership).
  if (!/^[0-9]{10}$/.test(phone) && options.fallbackPhone) {
    phone = normalizeIndianMobile(options.fallbackPhone);
    console.warn(
      '[msg91] Token verified but no mobile claim in JWT; using client phone. JWT keys:',
      Object.keys(payload)
    );
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    console.error(
      '[msg91] Could not extract mobile. JWT keys:',
      Object.keys(payload),
      'API keys:',
      Object.keys(json || {})
    );
    throw new Error('Could not read verified mobile number from MSG91 token');
  }

  return { phone, payload, raw: json };
};
