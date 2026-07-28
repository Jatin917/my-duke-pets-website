import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheck, FiEye, FiEyeOff, FiLoader, FiLock, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import SEO from '../components/common/SEO';
import BrandLogo from '../components/common/BrandLogo';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { SITE_NAME, SITE_TAGLINE } from '../utils/constants';
import StreamVideo from '../components/common/StreamVideo';
import { INDIAN_STATES, citiesForState } from '../utils/indiaLocations';
import {
  clearMsg91OtpSession,
  isMsg91Configured,
  isMsg91CaptchaVerified,
  msg91SendOtp,
  msg91VerifyOtp,
  preloadMsg91,
  watchMsg91Captcha,
  MSG91_CAPTCHA_ID,
} from '../utils/msg91';

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100';

const Login = () => {
  const { requestEmailOtp, confirmEmailOtp, register, login, isAuthenticated, loading } =
    useCustomerAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('return_url');
  const postAuthPath =
    returnUrl && returnUrl !== '/account' && !returnUrl.startsWith('/account?')
      ? returnUrl
      : '/';
  const loginRequired = searchParams.get('reason') === 'required';
  const initialTab = searchParams.get('tab') === 'login' ? 'login' : 'register';

  const [tab, setTab] = useState(initialTab);

  // Register form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Optional verification
  const [verifyTarget, setVerifyTarget] = useState(null); // 'email' | 'phone' | null
  const [otp, setOtp] = useState('');
  const [emailVerifyToken, setEmailVerifyToken] = useState('');
  const [phoneAccessToken, setPhoneAccessToken] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingPhone, setSendingPhone] = useState(false);
  const [confirmingOtp, setConfirmingOtp] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  // Login form
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const cities = useMemo(() => citiesForState(state), [state]);
  const emailCanVerify = captchaVerified && !sendingEmail && !emailVerified;
  const phoneCanVerify = captchaVerified && !sendingPhone && !phoneVerified;

  useEffect(() => {
    if (isAuthenticated) navigate(postAuthPath, { replace: true });
  }, [isAuthenticated, navigate, postAuthPath]);

  useEffect(() => {
    if (tab !== 'register') {
      setCaptchaVerified(false);
      setCaptchaLoading(false);
      return undefined;
    }

    let stopWatch = () => {};
    let pollId = null;
    let readyTimeout = null;
    let cancelled = false;
    setCaptchaLoading(true);

    const markReady = () => {
      if (cancelled) return;
      setCaptchaLoading(false);
      if (pollId) clearInterval(pollId);
      if (readyTimeout) clearTimeout(readyTimeout);
    };

    const t = setTimeout(() => {
      preloadMsg91().finally(() => {
        if (cancelled) return;
        setCaptchaVerified(isMsg91CaptchaVerified());
        stopWatch = watchMsg91Captcha(setCaptchaVerified);

        pollId = setInterval(() => {
          const el = document.getElementById(MSG91_CAPTCHA_ID);
          if (el && el.childElementCount > 0) {
            markReady();
          }
        }, 250);

        readyTimeout = setTimeout(markReady, 10000);
      });
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(t);
      if (pollId) clearInterval(pollId);
      if (readyTimeout) clearTimeout(readyTimeout);
      stopWatch();
    };
  }, [tab]);

  useEffect(() => {
    setCity('');
  }, [state]);

  useEffect(() => {
    setEmailVerified(false);
    setEmailVerifyToken('');
    setSendingEmail(false);
    setConfirmingOtp(false);
    setOtp('');
    setVerifyTarget((t) => (t === 'email' ? null : t));
    setCaptchaVerified(isMsg91CaptchaVerified());
  }, [email]);

  useEffect(() => {
    setPhoneVerified(false);
    setPhoneAccessToken('');
    setSendingPhone(false);
    setConfirmingOtp(false);
    setOtp('');
    setVerifyTarget((t) => (t === 'phone' ? null : t));
    clearMsg91OtpSession();
    setCaptchaVerified(isMsg91CaptchaVerified());
  }, [phone]);

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const phoneValid = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10));

  const handleSendEmailVerify = async () => {
    if (!emailValid) {
      toast.error('Enter a valid email first');
      return;
    }
    if (!isMsg91CaptchaVerified()) {
      toast.error('Please complete the captcha before verifying');
      setCaptchaVerified(false);
      return;
    }
    setSendingEmail(true);
    const toastId = toast.loading('Sending email OTP…');
    try {
      await requestEmailOtp(email.trim().toLowerCase());
      setVerifyTarget('email');
      setOtp('');
      toast.success('OTP sent to email', { id: toastId });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to send OTP', {
        id: toastId,
      });
    } finally {
      setSendingEmail(false);
      setCaptchaVerified(isMsg91CaptchaVerified());
    }
  };

  const handleSendPhoneVerify = async () => {
    if (!phoneValid) {
      toast.error('Enter a valid 10-digit mobile first');
      return;
    }
    if (!isMsg91Configured()) {
      toast.error('Mobile OTP is not configured yet');
      return;
    }
    if (!isMsg91CaptchaVerified()) {
      toast.error('Please complete the captcha before verifying');
      setCaptchaVerified(false);
      return;
    }
    setSendingPhone(true);
    const toastId = toast.loading('Sending SMS OTP…');
    try {
      await msg91SendOtp(phone.replace(/\D/g, '').slice(-10));
      setVerifyTarget('phone');
      setOtp('');
      toast.success('OTP sent to phone', { id: toastId });
    } catch (err) {
      toast.error(err?.message || 'Failed to send SMS OTP', { id: toastId });
    } finally {
      setSendingPhone(false);
      setCaptchaVerified(isMsg91CaptchaVerified());
    }
  };

  const handleConfirmOtp = async () => {
    if (verifyTarget === 'email') {
      if (otp.length !== 6) {
        toast.error('Enter the 6-digit email OTP');
        return;
      }
      setConfirmingOtp(true);
      const toastId = toast.loading('Verifying email…');
      try {
        const data = await confirmEmailOtp({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        });
        setEmailVerifyToken(data.emailVerifyToken);
        setEmailVerified(true);
        setVerifyTarget(null);
        setOtp('');
        toast.success('Email verified', { id: toastId });
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || 'Invalid OTP', { id: toastId });
      } finally {
        setConfirmingOtp(false);
      }
      return;
    }

    if (verifyTarget === 'phone') {
      if (otp.length !== 4) {
        toast.error('Enter the 4-digit mobile OTP');
        return;
      }
      setConfirmingOtp(true);
      const toastId = toast.loading('Verifying mobile…');
      try {
        const accessToken = await msg91VerifyOtp(otp.trim());
        setPhoneAccessToken(accessToken);
        setPhoneVerified(true);
        setVerifyTarget(null);
        setOtp('');
        toast.success('Mobile verified', { id: toastId });
      } catch (err) {
        toast.error(err?.message || 'Invalid OTP', { id: toastId });
      } finally {
        setConfirmingOtp(false);
        setCaptchaVerified(isMsg91CaptchaVerified());
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setBusy(true);
    const toastId = toast.loading('Creating account…');
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, '').slice(-10),
        state,
        city: city === 'Other' ? city : city,
        password,
        confirmPassword,
        emailVerifyToken: emailVerified ? emailVerifyToken : undefined,
        phoneAccessToken: phoneVerified ? phoneAccessToken : undefined,
      });
      toast.success(`Welcome to ${SITE_NAME}!`, { id: toastId });
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Registration failed', {
        id: toastId,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    const toastId = toast.loading('Signing in…');
    try {
      await login({
        identifier: identifier.trim(),
        password: loginPassword,
      });
      toast.success('Welcome back!', { id: toastId });
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Login failed', { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SEO
        title="Login / Register"
        description={`Login or register on ${SITE_NAME} with email or phone.`}
        noindex
        path="/login"
      />

      <div className="relative min-h-[calc(100vh-5rem)] bg-[#1a1510]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-900/40 via-transparent to-[#0c0a08]/70" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] lg:min-h-[calc(100vh-5rem)]">
          <section className="relative flex flex-col justify-center gap-5 px-5 pt-6 pb-4 sm:gap-8 sm:px-8 sm:py-10 lg:px-12 lg:py-16">
            <div className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-200 backdrop-blur-sm">
              {SITE_NAME} · {SITE_TAGLINE}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold leading-[1.1] text-white sm:text-5xl">
                Join the pack that{' '}
                <span className="text-primary-400">cares</span>
                <span className="text-white">.</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-lg">
                Create an account or login to unlock prices, enquire about pets, and save your
                details for a smoother experience.
              </p>
            </div>
            <div className="relative aspect-[16/10] max-h-[220px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl sm:max-h-[300px]">
              <StreamVideo
                src="/videos/loginPageVideo.mp4"
                mobileSrc="/videos/loginPageVideo-mobile.mp4"
                poster="/videos/loginPageVideo-poster.jpg"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1510]/80 via-transparent to-transparent" />
            </div>
          </section>

          <section className="relative flex items-start justify-center px-4 pb-10 pt-1 sm:items-center sm:px-8 sm:pb-12 lg:px-10 lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft"
            >
              <div className="px-6 pt-6 text-center">
                <div className="mb-3 flex justify-center">
                  <BrandLogo asLink imgClassName="h-12 w-auto object-contain" />
                </div>
                <h2 className="font-display text-2xl font-bold text-gray-800">
                  {tab === 'register' ? 'Register Now' : 'Welcome Back'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {tab === 'register'
                    ? `Join ${SITE_NAME} in a minute`
                    : 'Sign in to continue'}
                </p>
              </div>

              <div className="mx-6 mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-primary-100 bg-primary-50/40 p-1">
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                    tab === 'register'
                      ? 'bg-gradient-primary text-white shadow-glow'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                    tab === 'login'
                      ? 'bg-gradient-primary text-white shadow-glow'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  Login
                </button>
              </div>

              <div className="p-6">
                {loginRequired && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Please login or register to continue. Your contact details stay secure with us.
                  </div>
                )}

                {tab === 'register' ? (
                  <form onSubmit={handleRegister} className="space-y-3">
                    <div className="relative">
                      <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        className={`${inputClass} pl-10`}
                        placeholder="Enter Name *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        minLength={2}
                      />
                    </div>

                    <div>
                      <div className="relative">
                        <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          className={`${inputClass} pl-10 ${emailValid ? 'pr-24' : ''}`}
                          placeholder="Enter Email Address *"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        {emailValid && (
                          <button
                            type="button"
                            onClick={handleSendEmailVerify}
                            disabled={!emailCanVerify}
                            title={
                              emailVerified
                                ? 'Email verified'
                                : captchaVerified
                                  ? verifyTarget === 'email'
                                    ? 'Resend email OTP'
                                    : 'Send email OTP'
                                  : 'Complete captcha first'
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {emailVerified ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600">
                                <FiCheck /> Verified
                              </span>
                            ) : sendingEmail ? (
                              'Sending…'
                            ) : verifyTarget === 'email' ? (
                              'Resend'
                            ) : (
                              'Verify'
                            )}
                          </button>
                        )}
                      </div>
                      {verifyTarget === 'email' && (
                        <div className="mt-2 rounded-xl border border-primary-100 bg-primary-50/80 p-3">
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary-700">
                            Enter 6-digit email OTP
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              className={inputClass}
                              placeholder="Enter OTP"
                              value={otp}
                              onChange={(e) =>
                                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                              }
                            />
                            <button
                              type="button"
                              onClick={handleConfirmOtp}
                              disabled={confirmingOtp || sendingEmail}
                              className="shrink-0 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                            >
                              {confirmingOtp ? 'Checking…' : 'Confirm'}
                            </button>
                          </div>
                          <p className="mt-1.5 text-[11px] text-gray-500">
                            Verification is optional — you can register without it.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="relative flex overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
                        <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-600">
                          +91
                        </span>
                        <div className="relative flex-1">
                          <FiPhone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            className={`w-full border-0 bg-transparent py-3 pl-10 text-sm focus:outline-none ${
                              phoneValid ? 'pr-24' : 'pr-4'
                            }`}
                            placeholder="Enter Mobile Number *"
                            value={phone}
                            onChange={(e) =>
                              setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                            }
                            required
                          />
                          {phoneValid && (
                            <button
                              type="button"
                              onClick={handleSendPhoneVerify}
                              disabled={!phoneCanVerify}
                              title={
                                phoneVerified
                                  ? 'Mobile verified'
                                  : captchaVerified
                                    ? verifyTarget === 'phone'
                                      ? 'Resend mobile OTP'
                                      : 'Send mobile OTP'
                                    : 'Complete captcha first'
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {phoneVerified ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600">
                                  <FiCheck /> Verified
                                </span>
                              ) : sendingPhone ? (
                                'Sending…'
                              ) : verifyTarget === 'phone' ? (
                                'Resend'
                              ) : (
                                'Verify'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      {verifyTarget === 'phone' && (
                        <div className="mt-2 rounded-xl border border-primary-100 bg-primary-50/80 p-3">
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary-700">
                            Enter 4-digit mobile OTP
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={4}
                              className={inputClass}
                              placeholder="Enter OTP"
                              value={otp}
                              onChange={(e) =>
                                setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))
                              }
                            />
                            <button
                              type="button"
                              onClick={handleConfirmOtp}
                              disabled={confirmingOtp || sendingPhone}
                              className="shrink-0 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                            >
                              {confirmingOtp ? 'Checking…' : 'Confirm'}
                            </button>
                          </div>
                          <p className="mt-1.5 text-[11px] text-gray-500">
                            Verification is optional — you can register without it.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <select
                        className={inputClass}
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      >
                        <option value="">Select State *</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <select
                        className={inputClass}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        disabled={!state}
                      >
                        <option value="">Select City *</option>
                        {cities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`${inputClass} pl-10 pr-11`}
                        placeholder="Password * (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>

                    <div className="relative">
                      <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        className={`${inputClass} pl-10 pr-11`}
                        placeholder="Confirm Password *"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirm ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>

                    <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-700">
                        Complete captcha to unlock Verify
                      </p>
                      <div className="relative flex min-h-[78px] items-center justify-center overflow-hidden rounded-lg bg-white">
                        {captchaLoading && (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/90">
                            <FiLoader className="animate-spin text-2xl text-primary-500" />
                            <span className="text-xs font-medium text-gray-500">
                              Loading captcha…
                            </span>
                          </div>
                        )}
                        <div
                          id={MSG91_CAPTCHA_ID}
                          className="flex min-h-[78px] w-full items-center justify-center"
                        />
                      </div>
                      <p
                        className={`mt-2 text-center text-xs font-medium ${
                          captchaLoading
                            ? 'text-gray-400'
                            : captchaVerified
                              ? 'text-emerald-600'
                              : 'text-amber-700'
                        }`}
                      >
                        {captchaLoading
                          ? 'Please wait while captcha loads'
                          : captchaVerified
                            ? 'Captcha verified — you can verify email/mobile now'
                            : 'Verify buttons stay disabled until captcha is completed'}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || busy}
                      className="btn-gradient mt-1 w-full rounded-xl py-3.5 font-semibold text-white shadow-glow disabled:opacity-60"
                    >
                      {busy ? 'Creating account…' : 'Register'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div className="relative">
                      <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        className={`${inputClass} pl-10`}
                        placeholder="Email or Mobile Number *"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                      />
                    </div>
                    <div className="relative">
                      <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        className={`${inputClass} pl-10 pr-11`}
                        placeholder="Password *"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Toggle password visibility"
                      >
                        {showLoginPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={loading || busy}
                      className="btn-gradient mt-2 w-full rounded-xl py-3.5 font-semibold text-white shadow-glow disabled:opacity-60"
                    >
                      {busy ? 'Signing in…' : 'Login'}
                    </button>
                    <p className="text-center text-sm text-gray-500">
                      New here?{' '}
                      <button
                        type="button"
                        onClick={() => setTab('register')}
                        className="font-semibold text-primary-600 hover:underline"
                      >
                        Create an account
                      </button>
                    </p>
                  </form>
                )}

                <p className="mt-5 text-center text-xs text-gray-400">
                  By continuing, you agree to our{' '}
                  <Link to="/terms-and-conditions" className="text-primary-600 hover:underline">
                    Terms
                  </Link>{' '}
                  &amp;{' '}
                  <Link to="/privacy-policy" className="text-primary-600 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Login;
