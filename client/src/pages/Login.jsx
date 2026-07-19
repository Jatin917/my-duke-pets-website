import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiArrowLeft, FiUser } from 'react-icons/fi';
import SEO from '../components/common/SEO';
import BrandLogo from '../components/common/BrandLogo';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { SITE_NAME } from '../utils/constants';

const Login = () => {
  const { requestOtp, loginWithOtp, finishSignup, isAuthenticated, loading } = useCustomerAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('return_url') || '/account';

  const [channel, setChannel] = useState('phone'); // phone | email
  const [step, setStep] = useState('input'); // input | otp | details
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [extraEmail, setExtraEmail] = useState('');
  const [extraPhone, setExtraPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [signupToken, setSignupToken] = useState('');
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (isAuthenticated) navigate(returnUrl, { replace: true });
  }, [isAuthenticated, navigate, returnUrl]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

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

  return (
    <>
      <SEO title="Login" description={`Login or signup to ${SITE_NAME} with email or phone OTP verification.`} />

      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-primary-50/60 to-white">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-hero px-6 py-8 text-center text-white">
            <div className="mb-3 flex justify-center">
              <BrandLogo asLink imgClassName="h-20 w-auto object-contain drop-shadow-sm" />
            </div>
            <h1 className="text-2xl font-display font-bold">{titles[step].h}</h1>
            <p className="text-white/75 text-sm mt-1">{titles[step].p}</p>
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
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl mb-6">
                    <button
                      type="button"
                      onClick={() => setChannel('phone')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
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
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
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
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Mobile Number
                        </label>
                        <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
                          <span className="px-4 py-3 bg-gray-50 text-gray-600 text-sm font-medium border-r border-gray-200">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none text-sm"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-gradient text-white font-semibold py-3.5 rounded-xl shadow-glow disabled:opacity-60"
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
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-4"
                  >
                    <FiArrowLeft /> Change {channel === 'phone' ? 'number' : 'email'}
                  </button>

                  {demoOtp && (
                    <div className="mb-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
                      <strong>Demo OTP:</strong> {demoOtp}
                      <span className="block text-xs text-amber-600 mt-0.5">
                        OTP is stored in DB only (no SMS/email gateway in demo).
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none text-center text-2xl tracking-[0.4em] font-semibold"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full btn-gradient text-white font-semibold py-3.5 rounded-xl shadow-glow disabled:opacity-60"
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
                          className="text-primary-600 font-semibold hover:underline"
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
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-4"
                  >
                    <FiArrowLeft /> Start over
                  </button>

                  <form onSubmit={handleCompleteSignup} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none text-sm"
                          required
                          minLength={2}
                        />
                      </div>
                    </div>

                    {channel === 'phone' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <div className="relative">
                          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={extraEmail}
                            onChange={(e) => setExtraEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Mobile Number <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
                          <span className="px-4 py-3 bg-gray-50 text-gray-600 text-sm font-medium border-r border-gray-200">
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
                      className="w-full btn-gradient text-white font-semibold py-3.5 rounded-xl shadow-glow disabled:opacity-60"
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-xs text-gray-400 mt-6">
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
      </div>
    </>
  );
};

export default Login;
