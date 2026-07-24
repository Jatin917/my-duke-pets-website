import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheck, FiSend } from 'react-icons/fi';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';

const steps = [
  {
    num: '01',
    title: 'Submit',
    description: "Share what you're looking for — or what you're listing.",
  },
  {
    num: '02',
    title: 'Verify',
    description: 'Our team checks the details and, for sellers, the health records.',
  },
  {
    num: '03',
    title: 'Match',
    description: 'We connect you with a genuine buyer or seller — no guesswork.',
  },
  {
    num: '04',
    title: 'Handover',
    description: 'Pickup, delivery, and post-handover support, start to finish.',
  },
];

const faqs = [
  {
    question: 'How long does verification take?',
    answer:
      'Most seller listings are verified within 24–48 hours, once health and vaccination documents are submitted.',
  },
  {
    question: 'Is there a fee to list a pet?',
    answer:
      'Basic listings are free. Optional add-ons like featured placement or delivery assistance carry a small fee.',
  },
  {
    question: "What if a seller can't provide health records?",
    answer:
      'We won’t publish the listing until vaccination and health documentation is provided — no exceptions.',
  },
  {
    question: 'Do you help with pet delivery between cities?',
    answer: 'Yes — pickup and delivery support can be requested during the enquiry process.',
  },
];

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100';

const Help = () => {
  const [form, setForm] = useState({
    intent: 'Buy a Pet',
    name: '',
    phone: '',
    email: '',
    petType: '',
    city: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('Enquiry submitted. Our team will contact you soon.');
      setForm({
        intent: 'Buy a Pet',
        name: '',
        phone: '',
        email: '',
        petType: '',
        city: '',
        message: '',
      });
      setSending(false);
    }, 900);
  };

  return (
    <>
      <SEO
        title="Enquiries & Help"
        description="Submit a buyer, seller, or general pet enquiry and learn how the My Duke process works."
      />

      <section className="bg-gradient-hero pt-20 pb-14 sm:pt-28 sm:pb-20 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Breadcrumb items={[{ label: 'Enquiries' }]} />
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-6">Enquiries</h1>
          <p className="text-white/80 max-w-2xl mx-auto mt-3">
            One form for both buyers and sellers, plus process steps and answers.
          </p>
        </div>
      </section>

      <section id="enquiries" className="bg-[#fffaf6] py-16 sm:py-24 scroll-mt-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-primary-600 mb-4">
              Tell Us What You Need
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold italic text-primary-600 mb-4">
              One form, whichever side you&apos;re on.
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Buying, selling, or just have a question about a listing — start here. Our team
              responds to every enquiry within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-start">
            <motion.form
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="rounded-3xl bg-white border border-gray-100 shadow-soft p-6 sm:p-8"
            >
              <h3 className="font-display text-xl font-bold text-gray-900 mb-6">Submit an Enquiry</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="sm:col-span-2 text-sm font-medium text-gray-700">
                  I am looking to
                  <select
                    value={form.intent}
                    onChange={(event) => updateField('intent', event.target.value)}
                    className={`${inputClass} mt-1.5`}
                  >
                    <option>Buy a Pet</option>
                    <option>Sell or List a Pet</option>
                    <option>General Enquiry</option>
                  </select>
                </label>
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
                <select
                  required
                  value={form.petType}
                  onChange={(event) => updateField('petType', event.target.value)}
                  className={inputClass}
                >
                  <option value="">Pet Type</option>
                  {['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Exotic Pet'].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
                <input
                  required
                  value={form.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  placeholder="City"
                  className="sm:col-span-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  placeholder="Tell Us More"
                  className={`${inputClass} sm:col-span-2 resize-y`}
                />
              </div>
              <button
                disabled={sending}
                className="mt-5 w-full btn-gradient text-white font-semibold py-3.5 rounded-xl shadow-glow flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {sending ? 'Submitting...' : (
                  <>
                    Submit Enquiry <FiSend />
                  </>
                )}
              </button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:pt-4"
            >
              <h3 className="font-display text-xl font-bold text-gray-900 mb-7">How It Works</h3>
              <ol className="space-y-6">
                {steps.map((step) => (
                  <li key={step.num} className="grid grid-cols-[2.25rem_1fr] gap-3">
                    <span className="font-display font-extrabold text-primary-600">{step.num}</span>
                    <div>
                      <h4 className="font-display font-bold text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <h3 className="font-display font-bold text-gray-900 flex items-start gap-2">
                  <FiCheck className="text-primary-600 shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mt-2 pl-6">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Help;
