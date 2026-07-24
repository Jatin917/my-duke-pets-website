import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMapPin, FiPhone, FiMail, FiSend } from 'react-icons/fi';
import SectionHeading from './SectionHeading';

const ContactSection = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', message: '' });
      setSending(false);
    }, 900);
  };

  return (
    <section id="enquiries" className="py-20 bg-white scroll-mt-28 sm:scroll-mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Enquiries"
          title="We'd Love To Hear From You"
          description="Have a question about a pet, adoption process, or partnership? Reach out to us anytime."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            {[
              { icon: FiMapPin, title: 'Visit Us', text: '123 Pet Street, Bengaluru, Karnataka, India' },
              { icon: FiPhone, title: 'Call Us', text: '+91 99999 99999' },
              { icon: FiMail, title: 'Email Us', text: 'hello@petnest.com' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary text-white flex items-center justify-center text-xl shrink-0">
                  <item.icon />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-0.5">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.text}</p>
                </div>
              </div>
            ))}
            <div className="rounded-2xl overflow-hidden h-56 border border-gray-100">
              <iframe
                title="map"
                className="w-full h-full"
                loading="lazy"
                src="https://maps.google.com/maps?q=Bengaluru&t=&z=11&ie=UTF8&iwloc=&output=embed"
              />
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="bg-gray-50 rounded-3xl p-6 sm:p-8 space-y-4"
          >
            <input
              required
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none transition text-sm bg-white"
            />
            <input
              required
              type="email"
              placeholder="Your Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none transition text-sm bg-white"
            />
            <textarea
              required
              rows={5}
              placeholder="Your Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none transition text-sm bg-white"
            />
            <button
              disabled={sending}
              className="w-full btn-gradient text-white font-semibold py-3.5 rounded-xl shadow-glow flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {sending ? 'Sending...' : <>Send Message <FiSend /></>}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
