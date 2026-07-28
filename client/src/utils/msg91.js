const SCRIPT_URLS = [
  'https://verify.msg91.com/otp-provider.js',
  'https://verify.phone91.com/otp-provider.js',
];

export const MSG91_CAPTCHA_ID = 'myduke-msg91-captcha';

let loadPromise = null;
let initPromise = null;
let lastReqId = '';
let lastAccessToken = '';

/** Resolvers waiting for verify success (widget may deliver JWT via config.success). */
let pendingVerify = null;

const WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID || '';
const TOKEN_AUTH = import.meta.env.VITE_MSG91_TOKEN_AUTH || '';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = (promise, ms, message) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });

const formatMsg91Error = (error) => {
  if (!error) return 'MSG91 request failed';
  if (typeof error === 'string') return error;
  return (
    error?.message ||
    error?.msg ||
    error?.error ||
    error?.type ||
    (typeof error === 'object' ? JSON.stringify(error) : String(error)) ||
    'MSG91 request failed'
  );
};

const looksLikeJwt = (value) => {
  if (typeof value !== 'string') return false;
  const parts = value.trim().split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
};

/** Prefer the in-page captcha host; avoid orphan body hosts that break later sends. */
const ensureCaptchaHost = () => {
  if (typeof document === 'undefined') return null;

  let el = document.getElementById(MSG91_CAPTCHA_ID);
  if (el) return el;

  el = document.createElement('div');
  el.id = MSG91_CAPTCHA_ID;
  el.setAttribute('aria-live', 'polite');
  el.style.minHeight = '0';
  el.className = 'flex justify-center';
  document.body.appendChild(el);
  return el;
};

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (typeof window.initSendOTP === 'function') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

const loadOtpProvider = async () => {
  if (typeof window.initSendOTP === 'function') return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    let lastError;
    for (const url of SCRIPT_URLS) {
      try {
        await loadScript(url);
        for (let i = 0; i < 40; i += 1) {
          if (typeof window.initSendOTP === 'function') return;
          await sleep(50);
        }
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error('MSG91 OTP provider script failed to load');
  })();

  try {
    await loadPromise;
  } catch (err) {
    loadPromise = null;
    throw err;
  }
};

const waitForMethod = async (name, timeoutMs = 8000) => {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (typeof window[name] === 'function') return window[name];
    await sleep(40);
  }
  return null;
};

/** Walk MSG91 payloads for a JWT access token (docs: success returns verified token). */
export const extractMsg91AccessToken = (data) => {
  if (!data) return '';
  if (typeof data === 'string') return looksLikeJwt(data) ? data.trim() : '';

  const candidates = [
    data.message,
    data.accessToken,
    data.access_token,
    data['access-token'],
    data.token,
    data.data,
    data?.data?.message,
    data?.data?.accessToken,
    data?.data?.token,
    data?.data?.['access-token'],
  ];

  for (const c of candidates) {
    if (typeof c === 'string' && looksLikeJwt(c)) return c.trim();
  }

  // Deep-ish scan for any JWT-shaped string
  try {
    const raw = JSON.stringify(data);
    const match = raw.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
    if (match?.[0]) return match[0];
  } catch {
    /* ignore */
  }

  return '';
};

/**
 * reqId comes from Send OTP success (docs: required for verify/retry).
 * Often returned as `message` when it is NOT a JWT.
 */
const extractReqId = (data) => {
  if (!data) return '';
  if (typeof data === 'string') {
    return looksLikeJwt(data) ? '' : data.trim();
  }
  if (typeof data !== 'object') return '';

  const candidates = [
    data.reqId,
    data.requestId,
    data.request_id,
    data?.data?.reqId,
    data?.data?.requestId,
    data?.data?.request_id,
    typeof data.message === 'string' && !looksLikeJwt(data.message) ? data.message : '',
  ];

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim() && !looksLikeJwt(c)) return c.trim();
  }
  return '';
};

const normalizePhoneIdentifier = (phone10) => {
  const digits = String(phone10 || '').replace(/\D/g, '');
  const local = digits.slice(-10);
  if (!/^[6-9]\d{9}$/.test(local)) {
    throw new Error('Enter a valid 10-digit Indian mobile number');
  }
  return `91${local}`;
};

const settlePendingVerifySuccess = (data) => {
  const token = extractMsg91AccessToken(data);
  if (token) {
    lastAccessToken = token;
  }
  if (pendingVerify) {
    const { resolve } = pendingVerify;
    pendingVerify = null;
    resolve(data);
  }
};

const settlePendingVerifyFailure = (error) => {
  if (pendingVerify) {
    const { reject } = pendingVerify;
    pendingVerify = null;
    reject(error instanceof Error ? error : new Error(formatMsg91Error(error)));
  }
};

/** Clear in-flight OTP session so a new number/email can request a fresh OTP. */
export const clearMsg91OtpSession = () => {
  lastReqId = '';
  lastAccessToken = '';
  pendingVerify = null;
};

/** Force a fresh widget init (after captcha/DOM races or stuck state). */
export const resetMsg91 = () => {
  initPromise = null;
  window.__myDukeMsg91Ready = false;
  lastReqId = '';
  lastAccessToken = '';
  pendingVerify = null;
  try {
    delete window.sendOtp;
    delete window.verifyOtp;
    delete window.retryOtp;
  } catch {
    window.sendOtp = undefined;
    window.verifyOtp = undefined;
    window.retryOtp = undefined;
  }
};

export const ensureMsg91Ready = async ({ force = false } = {}) => {
  if (!WIDGET_ID || !TOKEN_AUTH) {
    throw new Error(
      'MSG91 is not configured. Set VITE_MSG91_WIDGET_ID and VITE_MSG91_TOKEN_AUTH in client/.env'
    );
  }

  if (force) resetMsg91();

  await loadOtpProvider();
  ensureCaptchaHost();

  if (
    !force &&
    window.__myDukeMsg91Ready &&
    typeof window.sendOtp === 'function' &&
    typeof window.verifyOtp === 'function'
  ) {
    return;
  }

  if (window.__myDukeMsg91Ready && typeof window.sendOtp !== 'function') {
    resetMsg91();
  }

  if (initPromise) {
    await initPromise;
    if (typeof window.sendOtp === 'function') return;
    resetMsg91();
  }

  initPromise = (async () => {
    window.__myDukeMsg91Ready = false;
    ensureCaptchaHost();

    // Docs: config success receives the verified access token after OTP verify.
    // We must capture it — verifyOtp callback alone is not always enough.
    window.initSendOTP({
      widgetId: WIDGET_ID,
      tokenAuth: TOKEN_AUTH,
      exposeMethods: true,
      captchaRenderId: MSG91_CAPTCHA_ID,
      success: (data) => {
        console.log('[msg91] widget success');
        settlePendingVerifySuccess(data);
      },
      failure: (error) => {
        console.warn('[msg91] widget failure:', formatMsg91Error(error));
        settlePendingVerifyFailure(error);
      },
    });

    const sendOtp = await waitForMethod('sendOtp', 10000);
    if (!sendOtp) {
      throw new Error(
        'MSG91 sendOtp is unavailable. In MSG91 widget settings, turn OFF “Mobile Integration” (web only), keep SMS enabled, and use Widget Token Auth. Then hard-refresh.'
      );
    }

    await waitForMethod('verifyOtp', 3000);
    await waitForMethod('retryOtp', 1500);
    window.__myDukeMsg91Ready = true;
  })();

  try {
    await initPromise;
  } catch (err) {
    initPromise = null;
    window.__myDukeMsg91Ready = false;
    throw err;
  }
};

const asPromise = (fn, ...args) =>
  new Promise((resolve, reject) => {
    try {
      fn(
        ...args,
        (data) => resolve(data),
        (error) => reject(new Error(formatMsg91Error(error)))
      );
    } catch (err) {
      reject(err instanceof Error ? err : new Error(formatMsg91Error(err)));
    }
  });

const sendOtpOnce = async (identifier) => {
  if (typeof window.sendOtp !== 'function') {
    throw new Error('MSG91 sendOtp is unavailable. Check widget configuration.');
  }
  lastAccessToken = '';
  const data = await withTimeout(
    asPromise(window.sendOtp, identifier),
    25000,
    'OTP request timed out. Please tap Resend OTP.'
  );
  const reqId = extractReqId(data);
  if (!reqId) {
    console.warn('[msg91] sendOtp response missing reqId:', data);
    throw new Error('OTP sent but request id was missing. Please tap Get OTP again.');
  }
  lastReqId = reqId;
  console.log('[msg91] OTP sent, reqId captured');
  return data;
};

/** Send SMS OTP via MSG91 for a 10-digit Indian mobile. Retries once after re-init. */
export const msg91SendOtp = async (phone10) => {
  const identifier = normalizePhoneIdentifier(phone10);

  await withTimeout(
    ensureMsg91Ready(),
    15000,
    'OTP service is taking too long to load. Please retry.'
  );

  try {
    return await sendOtpOnce(identifier);
  } catch (firstErr) {
    console.warn('[msg91] send failed, retrying after re-init:', firstErr?.message);
    await withTimeout(
      ensureMsg91Ready({ force: true }),
      15000,
      'OTP service is taking too long to load. Please retry.'
    );
    try {
      return await sendOtpOnce(identifier);
    } catch (secondErr) {
      throw new Error(secondErr?.message || firstErr?.message || 'Failed to send OTP');
    }
  }
};

/**
 * Verify OTP via MSG91 widget (docs: otp + optional reqId).
 * Captures JWT from verifyOtp callback AND widget config.success — OTP can be
 * consumed on MSG91 even when only one of those fires.
 * @see https://docs.msg91.com/otp-widget
 * @see https://msg91.com/help/sendotp/how-to-integrate-the-new-login-with-otp-widget
 */
export const msg91VerifyOtp = async (otpCode) => {
  await withTimeout(ensureMsg91Ready(), 12000, 'OTP service is not ready. Please retry.');
  if (typeof window.verifyOtp !== 'function') {
    throw new Error('MSG91 verifyOtp is unavailable. Check widget configuration.');
  }

  const otp = String(otpCode || '').trim();
  if (!otp) throw new Error('Please enter the OTP');

  // Docs: reqId is required for verify — without it verification is unreliable.
  if (!lastReqId) {
    throw new Error('OTP session expired. Please tap Resend OTP and try again.');
  }

  // If a previous verify already produced a token we missed in UI, reuse it.
  if (lastAccessToken) {
    console.log('[msg91] reusing access token from earlier verify success');
    return lastAccessToken;
  }

  const verifyPromise = new Promise((resolve, reject) => {
    pendingVerify = { resolve, reject };

    try {
      // Signature from MSG91 docs: verifyOtp(otp, success?, failure?, reqId?)
      window.verifyOtp(
        otp,
        (successData) => {
          console.log('[msg91] verifyOtp success callback');
          settlePendingVerifySuccess(successData);
        },
        (error) => {
          const message = formatMsg91Error(error);
          console.warn('[msg91] verifyOtp failure callback:', message);

          // OTP already verified on MSG91 but we still have a token from config.success
          const already =
            /already|verified|consumed|used|invalid request/i.test(message) && lastAccessToken;
          if (already) {
            settlePendingVerifySuccess({ message: lastAccessToken });
            return;
          }

          settlePendingVerifyFailure(new Error(message));
        },
        lastReqId
      );
    } catch (err) {
      settlePendingVerifyFailure(err instanceof Error ? err : new Error(formatMsg91Error(err)));
    }
  });

  let data;
  try {
    data = await withTimeout(verifyPromise, 25000, 'Verification timed out. Please try again.');
  } catch (err) {
    // Race: config.success may have stored token just after timeout/reject
    if (lastAccessToken) {
      console.log('[msg91] recovered access token after verify error');
      return lastAccessToken;
    }
    const message = err?.message || 'Verification failed';
    if (/already|verified|consumed|used/i.test(message)) {
      throw new Error('This OTP was already used. Please tap Resend OTP for a new code.');
    }
    throw err;
  } finally {
    pendingVerify = null;
  }

  const accessToken = extractMsg91AccessToken(data) || lastAccessToken;
  if (!accessToken) {
    // Brief wait — config.success sometimes arrives a tick after verifyOtp success
    await sleep(300);
    if (lastAccessToken) return lastAccessToken;
    console.error('[msg91] verify response without JWT:', data);
    throw new Error(
      'OTP was verified but no access token was returned. Please tap Resend OTP and verify once.'
    );
  }

  lastAccessToken = accessToken;
  return accessToken;
};

/** Resend OTP over SMS (MSG91 channel code 11). Falls back to fresh send. */
export const msg91RetryOtp = async (phone10) => {
  await withTimeout(ensureMsg91Ready(), 12000, 'OTP service is not ready. Please retry.');
  lastAccessToken = '';

  if (typeof window.retryOtp === 'function' && lastReqId) {
    try {
      const data = await withTimeout(
        new Promise((resolve, reject) => {
          try {
            window.retryOtp(
              '11',
              (successData) => resolve(successData),
              (error) => reject(new Error(formatMsg91Error(error))),
              lastReqId
            );
          } catch (err) {
            reject(err instanceof Error ? err : new Error(formatMsg91Error(err)));
          }
        }),
        20000,
        'Resend timed out. Please try again.'
      );
      const reqId = extractReqId(data);
      if (reqId) lastReqId = reqId;
      return data;
    } catch (err) {
      console.warn('[msg91] retryOtp failed, falling back to sendOtp:', err?.message);
    }
  }

  if (!phone10) {
    throw new Error('Could not resend OTP. Please go back and request a new OTP.');
  }
  return msg91SendOtp(phone10);
};

export const isMsg91Configured = () => Boolean(WIDGET_ID && TOKEN_AUTH);

/** MSG91 widget helper — true after the user completes captcha. */
export const isMsg91CaptchaVerified = () => {
  try {
    if (typeof window.isCaptchaVerified === 'function') {
      return Boolean(window.isCaptchaVerified());
    }
  } catch {
    /* ignore */
  }
  return false;
};

/**
 * Poll captcha status. Returns a cleanup function.
 * Call when register form is visible so Verify stays disabled until captcha passes.
 */
export const watchMsg91Captcha = (onChange, intervalMs = 500) => {
  if (typeof onChange !== 'function') return () => {};
  let last = null;
  const tick = () => {
    const next = isMsg91CaptchaVerified();
    if (next !== last) {
      last = next;
      onChange(next);
    }
  };
  tick();
  const id = setInterval(tick, intervalMs);
  return () => clearInterval(id);
};

/** Warm up MSG91 script + widget in the background (call on Login mount). */
export const preloadMsg91 = () => {
  if (!isMsg91Configured()) return Promise.resolve();
  return sleep(50)
    .then(() => ensureMsg91Ready())
    .catch((err) => {
      console.warn('[msg91] preload failed (will retry on Get OTP):', err?.message);
    });
};
