import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import { FiClock, FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import {
  PHONE_LINK,
  PHONE_NUMBER,
  SITE_NAME,
  WHATSAPP_LINK,
} from '../utils/constants';

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100';

const contactDetails = [
  { icon: FiPhone, label: 'Call Us', value: PHONE_NUMBER, href: PHONE_LINK },
  { icon: FiMail, label: 'Email', value: 'hello@myduke.in', href: 'mailto:hello@myduke.in' },
  { icon: FiMapPin, label: 'Based In', value: 'India' },
  { icon: FiClock, label: 'Support Hours', value: 'Mon – Sat, 9 AM – 7 PM' },
];

const socialLinks = [
  { icon: FaInstagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: FaFacebookF, label: 'Facebook', href: 'https://facebook.com' },
  {
    icon: FaWhatsapp,
    label: 'WhatsApp',
    href: WHATSAPP_LINK('Hello My Duke, I would like to speak with your team.'),
  },
  { icon: FaYoutube, label: 'YouTube', href: 'https://youtube.com' },
];

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 900);
  };

  return (
    <>
      <SEO
        title="Contact Us"
        description={`Contact ${SITE_NAME} about a listing, rehoming a pet, or general support.`}
      />

      <section className="bg-gradient-hero pt-20 pb-14 sm:pt-28 sm:pb-20 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Breadcrumb items={[{ label: 'Contact Us' }]} />
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-6">Contact Us</h1>
          <p className="text-white/80 max-w-2xl mx-auto mt-3">
            Direct contact details and a general message form.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#fffaf6] py-16 sm:py-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 55% 45% at 100% 0%, rgba(251,146,60,0.12), transparent)',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-primary-600 mb-4">
              Get In Touch
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold italic text-primary-600 mb-4">
              Real people, not a ticket queue.
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Whether you&apos;re chasing an update on a listing or want to talk through rehoming a
              pet, reach us directly — we reply within one business day.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="rounded-3xl bg-white border border-gray-100 shadow-soft p-6 sm:p-8">
                <h3 className="font-display text-xl font-bold text-gray-900 mb-6">
                  Contact Details
                </h3>
                <div className="space-y-5">
                  {contactDetails.map(({ icon: Icon, label, value, href }) => {
                    const content = (
                      <>
                        <span className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-lg shrink-0">
                          <Icon />
                        </span>
                        <span>
                          <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                            {label}
                          </span>
                          <span className="block text-sm font-medium text-gray-800 mt-0.5">
                            {value}
                          </span>
                        </span>
                      </>
                    );

                    return href ? (
                      <a key={label} href={href} className="flex items-center gap-3 group">
                        {content}
                      </a>
                    ) : (
                      <div key={label} className="flex items-center gap-3">
                        {content}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-gray-900 mb-4">Social Links</h3>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-11 h-11 rounded-xl border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:border-primary-300 hover:text-primary-600 transition"
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="rounded-3xl bg-white border border-gray-100 shadow-soft p-6 sm:p-8"
            >
              <h3 className="font-display text-xl font-bold text-gray-900 mb-6">Send a Message</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="Full Name"
                  className={inputClass}
                />
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  placeholder="Phone Number"
                  className={inputClass}
                />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="Email Address"
                  className={inputClass}
                />
                <input
                  required
                  value={form.subject}
                  onChange={(event) => updateField('subject', event.target.value)}
                  placeholder="Subject"
                  className={inputClass}
                />
                <textarea
                  required
                  rows={7}
                  value={form.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  placeholder="Message"
                  className={`${inputClass} sm:col-span-2 resize-y`}
                />
              </div>
              <button
                disabled={sending}
                className="mt-5 w-full btn-gradient text-white font-semibold py-3.5 rounded-xl shadow-glow flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {sending ? 'Sending...' : (
                  <>
                    Send Message <FiSend />
                  </>
                )}
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      <section className="bg-gray-900 text-white py-12 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary-400 mb-2">
              Prefer To Talk?
            </p>
            <h2 className="font-display text-2xl font-bold">We&apos;re happy to walk you through it.</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href={PHONE_LINK}
              className="inline-flex items-center justify-center gap-2 btn-gradient text-white font-semibold px-6 py-3.5 rounded-xl"
            >
              <FiPhone /> Call Now
            </a>
            <Link
              to="/help#enquiries"
              className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 font-semibold hover:bg-white/10 transition"
            >
              Start an Enquiry Instead
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
