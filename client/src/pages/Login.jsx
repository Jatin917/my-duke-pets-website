import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiArrowLeft, FiUser, FiCheck } from 'react-icons/fi';
import SEO from '../components/common/SEO';
import BrandLogo from '../components/common/BrandLogo';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { SITE_NAME, SITE_TAGLINE } from '../utils/constants';
import StreamVideo from '../components/common/StreamVideo';

const PET_THOUGHTS = [
  {
    title: 'Every pet has a tempo',
    text: 'Some need a quiet apartment; others thrive with a daily adventure. Login unlocks matches that fit your life.',
  },
  {
    title: 'Personality before pedigree',
    text: 'Temperament, energy, and care needs matter more than a label — we help you read the whole story.',
  },
  {
    title: 'A living companion, not a listing',
    text: 'Behind every profile is a routine, a preferred lap, and a set of habits waiting for the right home.',
  },
  {
    title: 'Dynamic care, dynamic bonds',
    text: 'Pets change as they grow. Seeing real care tips and health notes helps you prepare for the journey.',
  },
];

const HIGHLIGHTS = [
  { title: 'Live listings', text: 'Browse pets with photos, video, and clear care details.' },
  { title: 'Price on login', text: 'Unlock pricing and enquire with your verified contact.' },
  { title: 'Guided handover', text: 'Vaccination status, diet notes, and FAQs before you decide.' },
];

const Login = () => {
  const { requestOtp, loginWithOtp, finishSignup, isAuthenticated, loading } = useCustomerAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('return_url') || '/account';

  const [channel, setChannel] = useState('phone');
  const [step, setStep] = useState('input');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [extraEmail, setExtraEmail] = useState('');
  const [extraPhone, setExtraPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [signupToken, setSignupToken] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [thoughtIndex, setThoughtIndex] = useState(0);

  useEffect(() => {
    if (isAuthenticated) navigate(returnUrl, { replace: true });
  }, [isAuthenticated, navigate, returnUrl]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    const t = setInterval(() => {
      setThoughtIndex((i) => (i + 1) % PET_THOUGHTS.length);
    }, 5200);
    return () => clearInterval(t);
  }, []);

  const contactPayload = () =>
    channel === 'phone'
      ? { channel: 'phone', phone: phone.replace(/\D/g, '').slice(-10) }
      : { channel: 'email', email: email.trim().toLowerCase() };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    try {
      const payload = contactPayload();

      if (channel === 'phone' && !/^[0-9]{10}$/.test(payload.phone)) {
        toast.error('Enter a valid 10-digit phone number');
        return;
      }
      if (channel === 'email' && !/^\S+@\S+\.\S+$/.test(payload.email)) {
        toast.error('Enter a valid email address');
        return;
      }

      const data = await requestOtp(payload);
      setDemoOtp(data.otp || '');
      setStep('otp');
      setResendIn(60);
      toast.success(data.otp ? `OTP sent (demo): ${data.otp}` : 'OTP sent successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const data = await loginWithOtp({
        ...contactPayload(),
        otp: otp.trim(),
      });

      if (data.isNewUser) {
        setSignupToken(data.signupToken);
        setStep('details');
        toast.success('OTP verified — complete your profile');
        return;
      }

      toast.success(`Welcome back${data.customer?.name ? `, ${data.customer.name}` : ''}!`);
      navigate(returnUrl, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Please enter your full name');
      return;
    }

    try {
      await finishSignup({
        signupToken,
        name: name.trim(),
        email: channel === 'phone' ? extraEmail.trim().toLowerCase() : undefined,
        phone: channel === 'email' ? extraPhone.replace(/\D/g, '').slice(-10) : undefined,
      });
      toast.success(`Welcome to ${SITE_NAME}!`);
      navigate(returnUrl, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not create account');
    }
  };

  const goBackToInput = () => {
    setStep('input');
    setOtp('');
    setDemoOtp('');
    setSignupToken('');
    setName('');
    setExtraEmail('');
    setExtraPhone('');
  };

  const masked =
    channel === 'phone'
      ? `+91 ******${phone.slice(-4)}`
      : email.replace(/(.{2}).+(@.+)/, '$1***$2');

  const titles = {
    input: { h: 'Login or Signup', p: 'Verify with phone or email to continue' },
    otp: { h: 'Verify OTP', p: `Enter the 6-digit OTP sent to ${masked}` },
    details: { h: 'Complete your profile', p: 'Tell us a bit about yourself to finish signup' },
  };

  const thought = PET_THOUGHTS[thoughtIndex];

  return (
    <>
      <SEO title="Login" description={`Login or signup to ${SITE_NAME} with email or phone OTP verification.`} />

      <div className="relative min-h-[calc(100vh-5rem)] bg-[#1a1510]">
        {/* Ambient grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-900/40 via-transparent to-[#0c0a08]/70" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] lg:min-h-[calc(100vh-5rem)]">
          {/* LEFT — video + thoughts */}
          <section className="relative flex flex-col justify-center gap-5 px-5 pt-6 pb-4 sm:gap-8 sm:px-8 sm:py-10 lg:px-12 lg:py-16">
            <div className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-200 backdrop-blur-sm">
              {SITE_NAME} · {SITE_TAGLINE}
            </div>

            <div>
              <h1 className="font-display text-3xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-[3.25rem]">
                Meet pets that{' '}
                <span className="text-primary-400">move you</span>
                <span className="text-white">.</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:mt-4 sm:text-lg">
                Login to unlock prices, enquire, and find a companion that fits your home&apos;s rhythm.
              </p>
            </div>

            {/* Video panel */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 aspect-[16/10] max-h-[180px] sm:max-h-[320px] w-full bg-black/40">
              <StreamVideo
                src="/videos/loginPageVideo.mp4"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1510]/85 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={thoughtIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45 }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary-300">
                      Thought {thoughtIndex + 1}/{PET_THOUGHTS.length}
                    </p>
                    <p className="mt-1 font-display text-base font-bold text-white sm:text-xl">{thought.title}</p>
                    <p className="mt-1 hidden text-sm leading-relaxed text-white/75 sm:block">{thought.text}</p>
                  </motion.div>
                </AnimatePresence>
                <div className="mt-3 flex gap-1.5">
                  {PET_THOUGHTS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Show thought ${i + 1}`}
                      onClick={() => setThoughtIndex(i)}
                      className={`h-1 rounded-full transition-all ${
                        i === thoughtIndex ? 'w-6 bg-primary-400' : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <ul className="hidden space-y-3 sm:block">
              {HIGHLIGHTS.map((item, i) => (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
                    <FiCheck size={12} strokeWidth={3} />
                  </span>
                  <p className="text-sm text-white/80">
                    <span className="font-semibold text-white">{item.title}</span>
                    <span className="text-white/50"> — </span>
                    {item.text}
                  </p>
                </motion.li>
              ))}
            </ul>
          </section>

          {/* RIGHT — form card */}
          <section className="relative flex items-start justify-center px-4 pb-10 pt-1 sm:items-center sm:px-8 sm:pb-12 sm:pt-2 lg:px-10 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl shadow-black/30"
            >
              <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-800 px-6 py-7 text-white">
                <div className="mb-3 flex justify-center sm:justify-start">
                  <BrandLogo asLink imgClassName="h-14 w-auto object-contain drop-shadow-sm" />
                </div>
                <h2 className="font-display text-2xl font-bold">{titles[step].h}</h2>
                <p className="mt-1 text-sm text-white/80">{titles[step].p}</p>
              </div>

              <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {step === 'input' && (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                    >
                      <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1">
                        <button
                          type="button"
                          onClick={() => setChannel('phone')}
                          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                            channel === 'phone'
                              ? 'bg-white text-primary-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <FiPhone /> Phone
                        </button>
                        <button
                          type="button"
                          onClick={() => setChannel('email')}
                          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                            channel === 'email'
                              ? 'bg-white text-primary-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <FiMail /> Email
                        </button>
                      </div>

                      <form onSubmit={handleSendOtp} className="space-y-4">
                        {channel === 'phone' ? (
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                              Mobile Number
                            </label>
                            <div className="flex overflow-hidden rounded-xl border border-gray-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
                              <span className="border-r border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600">
                                +91
                              </span>
                              <input
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder="Enter 10-digit number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="flex-1 px-4 py-3 text-sm focus:outline-none"
                                required
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                              Email Address
                            </label>
                            <div className="relative">
                              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                                required
                              />
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-gradient w-full rounded-xl py-3.5 font-semibold text-white shadow-glow disabled:opacity-60"
                        >
                          {loading ? 'Sending OTP...' : 'Get OTP'}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {step === 'otp' && (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                    >
                      <button
                        type="button"
                        onClick={goBackToInput}
                        className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600"
                      >
                        <FiArrowLeft /> Change {channel === 'phone' ? 'number' : 'email'}
                      </button>

                      {demoOtp && (
                        <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                          <strong>Demo OTP:</strong> {demoOtp}
                          <span className="mt-0.5 block text-xs text-amber-600">
                            OTP is stored in DB only (no SMS/email gateway in demo).
                          </span>
                        </div>
                      )}

                      <form onSubmit={handleVerify} className="space-y-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">Enter OTP</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-2xl font-semibold tracking-[0.4em] focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading || otp.length !== 6}
                          className="btn-gradient w-full rounded-xl py-3.5 font-semibold text-white shadow-glow disabled:opacity-60"
                        >
                          {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                          Didn&apos;t get OTP?{' '}
                          {resendIn > 0 ? (
                            <span className="text-gray-400">Resend in {resendIn}s</span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              className="font-semibold text-primary-600 hover:underline"
                            >
                              Resend OTP
                            </button>
                          )}
                        </p>
                      </form>
                    </motion.div>
                  )}

                  {step === 'details' && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                    >
                      <button
                        type="button"
                        onClick={goBackToInput}
                        className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600"
                      >
                        <FiArrowLeft /> Start over
                      </button>

                      <form onSubmit={handleCompleteSignup} className="space-y-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Enter your full name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                              required
                              minLength={2}
                            />
                          </div>
                        </div>

                        {channel === 'phone' ? (
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                              Email <span className="font-normal text-gray-400">(optional)</span>
                            </label>
                            <div className="relative">
                              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="email"
                                placeholder="you@example.com"
                                value={extraEmail}
                                onChange={(e) => setExtraEmail(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                              Mobile Number <span className="font-normal text-gray-400">(optional)</span>
                            </label>
                            <div className="flex overflow-hidden rounded-xl border border-gray-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
                              <span className="border-r border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600">
                                +91
                              </span>
                              <input
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder="10-digit number"
                                value={extraPhone}
                                onChange={(e) =>
                                  setExtraPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                                }
                                className="flex-1 px-4 py-3 text-sm focus:outline-none"
                              />
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-gray-400">
                          Verified {channel === 'phone' ? 'phone' : 'email'}: {masked}
                        </p>

                        <button
                          type="submit"
                          disabled={loading || name.trim().length < 2}
                          className="btn-gradient w-full rounded-xl py-3.5 font-semibold text-white shadow-glow disabled:opacity-60"
                        >
                          {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="mt-6 text-center text-xs text-gray-400">
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
