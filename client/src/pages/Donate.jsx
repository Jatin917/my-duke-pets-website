import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiHeart,
  FiCopy,
  FiCheck,
  FiHelpCircle,
  FiMessageCircle,
} from 'react-icons/fi';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import Loader from '../components/common/Loader';
import BrandLogo from '../components/common/BrandLogo';
import { fetchDonateSettings, acknowledgeDonation } from '../services/donateService';
import { resolveImageUrl } from '../services/api';
import { SITE_NAME, WHATSAPP_LINK } from '../utils/constants';
import { formatPrice } from '../utils/formatters';
import { useCustomerAuth } from '../context/CustomerAuthContext';

const Donate = () => {
  const { customer, isAuthenticated } = useCustomerAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');

  useEffect(() => {
    fetchDonateSettings()
      .then((data) => {
        setSettings(data);
        if (data?.amounts?.length) setSelectedAmount(data.amounts[0]);
      })
      .catch(() => toast.error('Could not load donate page'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !customer) return;
    if (customer.name) setDonorName(customer.name);
    if (customer.email) setDonorEmail(customer.email);
  }, [isAuthenticated, customer]);

  const activeAmount = useMemo(() => {
    if (customAmount) {
      const n = Number(customAmount);
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    return selectedAmount;
  }, [customAmount, selectedAmount]);

  const handleAcknowledge = async () => {
    if (!donorEmail.trim() || !/^\S+@\S+\.\S+$/.test(donorEmail.trim())) {
      toast.error('Enter your email so we can send a thank-you receipt');
      return;
    }
    setSubmitting(true);
    try {
      await acknowledgeDonation({
        name: donorName.trim(),
        email: donorEmail.trim().toLowerCase(),
        amount: activeAmount || undefined,
      });
      setAcknowledged(true);
      toast.success(settings.thankYouTitle || 'Thank you! Check your email.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not send confirmation email');
    } finally {
      setSubmitting(false);
    }
  };

  const copyUpi = async () => {
    if (!settings?.upiId) return;
    try {
      await navigator.clipboard.writeText(settings.upiId);
      setCopied(true);
      toast.success('UPI ID copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy UPI ID');
    }
  };

  if (loading) return <Loader full />;

  if (!settings?.pageEnabled) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Donations paused</h2>
        <p className="text-gray-500 mb-6">Please check back soon.</p>
        <Link to="/" className="btn-gradient text-white font-semibold px-6 py-3 rounded-full">
          Back home
        </Link>
      </div>
    );
  }

  const whatsappHref = WHATSAPP_LINK(
    `Hi ${SITE_NAME}, I just donated${activeAmount ? ` ₹${activeAmount}` : ''} via UPI. Sharing for your records.`
  );

  return (
    <>
      <SEO
        title="Donate"
        description={`Support ${SITE_NAME} — donate via UPI QR to help feed, treat, and rescue pets in need.`}
      />

      <div className="bg-gray-50 min-h-screen pb-16">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-hero text-white">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#fff,transparent_45%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <Breadcrumb items={[{ label: 'Donate' }]} />
            <div className="flex flex-col lg:flex-row lg:items-end gap-8 justify-between">
              <div className="max-w-2xl">
                <div className="mb-4">
                  <BrandLogo asLink={false} imgClassName="h-16 w-auto object-contain drop-shadow" />
                </div>
                <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight">
                  {settings.heroTitle}
                </h1>
                <p className="mt-4 text-white/80 text-base sm:text-lg leading-relaxed">
                  {settings.heroSubtitle}
                </p>
              </div>
              <a
                href="#donate-pay"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-bold px-7 py-3.5 rounded-2xl shadow-lg hover:bg-primary-50 transition shrink-0"
              >
                <FiHeart />
                {settings.heroCtaText}
              </a>
            </div>
          </div>
        </section>

        {/* Stats */}
        {settings.stats?.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {settings.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl shadow-soft p-5 text-center border border-gray-100"
                >
                  <p className="text-2xl font-display font-bold text-primary-600">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div className="space-y-10">
            {/* Impact */}
            <section>
              <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Why donate?</h2>
              <p className="text-gray-500 text-sm mb-6">
                Your support directly helps animals under {SITE_NAME} care.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {settings.impactItems?.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
                      <FiHeart />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Thank yous */}
            {settings.thankYous?.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">Kind words</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {settings.thankYous.map((t) => (
                    <div
                      key={`${t.name}-${t.message}`}
                      className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100"
                    >
                      <p className="text-sm text-gray-600 italic leading-relaxed">“{t.message}”</p>
                      <p className="text-xs font-semibold text-primary-600 mt-3">— {t.name}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            {settings.faqs?.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiHelpCircle className="text-primary-500" /> FAQ
                </h2>
                <div className="space-y-3">
                  {settings.faqs.map((faq, i) => (
                    <div key={faq.question} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                        className="w-full text-left px-5 py-4 font-semibold text-sm text-gray-800"
                      >
                        {faq.question}
                      </button>
                      {openFaq === i && (
                        <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Payment card */}
          <aside id="donate-pay" className="lg:sticky lg:top-28 space-y-4">
            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
              <h2 className="font-display text-xl font-bold text-gray-800 mb-1">Donate via UPI</h2>
              <p className="text-xs text-gray-400 mb-5">{settings.payNote}</p>

              {/* Amounts */}
              {settings.amounts?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Suggested amount</p>
                  <div className="flex flex-wrap gap-2">
                    {settings.amounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition ${
                          !customAmount && selectedAmount === amt
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        {formatPrice(amt)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Custom amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none text-sm"
                />
                {activeAmount && (
                  <p className="text-xs text-primary-600 mt-1.5 font-medium">
                    Selected: {formatPrice(activeAmount)}
                  </p>
                )}
              </div>

              {/* QR */}
              <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/40 p-4 flex flex-col items-center mb-4">
                {settings.qrImage ? (
                  <img
                    src={resolveImageUrl(settings.qrImage)}
                    alt="Donation UPI QR"
                    className="w-52 h-52 object-contain bg-white rounded-xl p-2 shadow-sm"
                  />
                ) : (
                  <div className="w-52 h-52 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-center text-sm text-gray-400 px-4">
                    QR code will appear here once uploaded from admin
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-3 text-center">Scan with GPay / PhonePe / Paytm / any UPI app</p>
              </div>

              {settings.upiId && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-gray-400">UPI ID</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{settings.upiId}</p>
                  </div>
                  <button
                    type="button"
                    onClick={copyUpi}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary-300"
                  >
                    {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}

              {settings.bankDetails && (
                <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-[11px] text-gray-400 mb-1">Bank details</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{settings.bankDetails}</p>
                </div>
              )}

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 border-2 border-green-500 text-green-700 font-semibold py-3 rounded-xl hover:bg-green-50 transition mb-3"
              >
                <FiMessageCircle /> Share on WhatsApp
              </a>

              {!acknowledged ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:outline-none text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email for thank-you receipt *"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:outline-none text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleAcknowledge}
                    disabled={submitting}
                    className="w-full btn-gradient text-white font-semibold py-3.5 rounded-xl shadow-glow disabled:opacity-60"
                  >
                    {submitting ? 'Sending...' : "I've donated — email me"}
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-center">
                  <p className="font-semibold text-green-800">{settings.thankYouTitle}</p>
                  <p className="text-sm text-green-700 mt-1">{settings.thankYouMessage}</p>
                  <p className="text-xs text-green-600 mt-2">A confirmation email was sent to {donorEmail}</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Donate;
