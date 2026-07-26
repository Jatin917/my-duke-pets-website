const SCRIPT_URLS = [
  'https://verify.msg91.com/otp-provider.js',
  'https://verify.phone91.com/otp-provider.js',
];

const CAPTCHA_ID = 'myduke-msg91-captcha';

let loadPromise = null;
let initPromise = null;
let lastReqId = '';

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

const ensureCaptchaHost = () => {
  if (typeof document === 'undefined') return null;
  let el = document.getElementById(CAPTCHA_ID);
  if (el) return el;
  el = document.createElement('div');
  el.id = CAPTCHA_ID;
  el.setAttribute('aria-live', 'polite');
  el.className = 'mt-3 flex min-h-0 justify-center';
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
        // Script may define initSendOTP a tick later.
        for (let i = 0; i < 20; i += 1) {
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

const waitForMethod = async (name, timeoutMs = 5000) => {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (typeof window[name] === 'function') return window[name];
    await sleep(40);
  }
  return null;
};

/** Extract JWT string from MSG91 success callback payload. */
export const extractMsg91AccessToken = (data) => {
  if (!data) return '';
  if (typeof data === 'string') {
    // JWT or plain reqId — JWT has 3 segments
    return data.trim();
  }
  if (typeof data.message === 'string' && data.message.split('.').length === 3) {
    return data.message.trim();
  }
  if (typeof data.accessToken === 'string') return data.accessToken.trim();
  if (typeof data.token === 'string') return data.token.trim();
  if (typeof data.data === 'string' && data.data.split('.').length === 3) return data.data.trim();
  if (data.data && typeof data.data.message === 'string' && data.data.message.split('.').length === 3) {
    return data.data.message.trim();
  }
  return '';
};

const extractReqId = (data) => {
  if (!data || typeof data !== 'object') return '';
  return (
    data.reqId ||
    data.requestId ||
    data.request_id ||
    data?.data?.reqId ||
    data?.data?.requestId ||
    ''
  );
};

export const ensureMsg91Ready = async () => {
  if (!WIDGET_ID || !TOKEN_AUTH) {
    throw new Error(
      'MSG91 is not configured. Set VITE_MSG91_WIDGET_ID and VITE_MSG91_TOKEN_AUTH in client/.env'
    );
  }

  await loadOtpProvider();
  ensureCaptchaHost();

  if (window.__myDukeMsg91Ready && typeof window.sendOtp === 'function') {
    return;
  }

  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    // Reset so a failed init can be retried.
    window.__myDukeMsg91Ready = false;

    window.initSendOTP({
      widgetId: WIDGET_ID,
      tokenAuth: TOKEN_AUTH,
      exposeMethods: true,
      captchaRenderId: CAPTCHA_ID,
      success: () => {},
      failure: () => {},
    });

    const sendOtp = await waitForMethod('sendOtp');
    if (!sendOtp) {
      throw new Error(
        'MSG91 sendOtp is unavailable. In MSG91 widget settings, turn OFF “Mobile Integration” (web only), keep SMS channel enabled, and use a Widget Token Auth (not the account Auth Key). Then hard-refresh the page.'
      );
    }

    // verify/retry usually appear with sendOtp
    await waitForMethod('verifyOtp', 1500);
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
    fn(
      ...args,
      (data) => resolve(data),
      (error) => {
        const message =
          typeof error === 'string'
            ? error
            : error?.message ||
              error?.msg ||
              error?.error ||
              (error ? JSON.stringify(error) : '') ||
              'MSG91 request failed';
        reject(new Error(message));
      }
    );
  });

/** Send SMS OTP via MSG91 for a 10-digit Indian mobile. */
export const msg91SendOtp = async (phone10) => {
  await withTimeout(
    ensureMsg91Ready(),
    12000,
    'OTP service is taking too long to load. Please retry.'
  );
  const identifier = `91${String(phone10).replace(/\D/g, '').slice(-10)}`;
  if (typeof window.sendOtp !== 'function') {
    throw new Error('MSG91 sendOtp is unavailable. Check widget configuration.');
  }
  const data = await withTimeout(
    asPromise(window.sendOtp, identifier),
    20000,
    'OTP request timed out. Please tap Resend OTP.'
  );
  lastReqId = extractReqId(data) || lastReqId;
  return data;
};

/** Verify OTP digits via MSG91; returns access token JWT. */
export const msg91VerifyOtp = async (otpCode) => {
  await withTimeout(ensureMsg91Ready(), 12000, 'OTP service is not ready. Please retry.');
  if (typeof window.verifyOtp !== 'function') {
    throw new Error('MSG91 verifyOtp is unavailable. Check widget configuration.');
  }

  // verifyOtp(otp, success, failure, reqId?)
  const data = await withTimeout(
    new Promise((resolve, reject) => {
      window.verifyOtp(
        String(otpCode).trim(),
        (successData) => resolve(successData),
        (error) => {
          const message =
            typeof error === 'string'
              ? error
              : error?.message || error?.msg || JSON.stringify(error) || 'MSG91 verify failed';
          reject(new Error(message));
        },
        lastReqId || undefined
      );
    }),
    20000,
    'Verification timed out. Please try again.'
  );

  const accessToken = extractMsg91AccessToken(data);
  if (!accessToken) {
    throw new Error('MSG91 did not return an access token');
  }
  return accessToken;
};

/** Resend OTP over SMS (MSG91 channel code 11). */
export const msg91RetryOtp = async () => {
  await withTimeout(ensureMsg91Ready(), 12000, 'OTP service is not ready. Please retry.');
  if (typeof window.retryOtp !== 'function') {
    throw new Error('MSG91 retryOtp is unavailable. Check widget configuration.');
  }
  const data = await withTimeout(
    new Promise((resolve, reject) => {
      window.retryOtp(
        '11',
        (successData) => resolve(successData),
        (error) => {
          const message =
            typeof error === 'string'
              ? error
              : error?.message || error?.msg || JSON.stringify(error) || 'MSG91 retry failed';
          reject(new Error(message));
        },
        lastReqId || undefined
      );
    }),
    20000,
    'Resend timed out. Please try again.'
  );
  lastReqId = extractReqId(data) || lastReqId;
  return data;
};

export const isMsg91Configured = () => Boolean(WIDGET_ID && TOKEN_AUTH);

/** Warm up MSG91 script + widget in the background (call on Login mount). */
export const preloadMsg91 = () => {
  if (!isMsg91Configured()) return Promise.resolve();
  return ensureMsg91Ready().catch(() => {
    // Keep silent — real errors surface when the user taps Get OTP.
  });
};
