import { Link } from 'react-router-dom';
import { FaHeadset, FaWhatsapp } from 'react-icons/fa';
import { FiBookOpen, FiMessageCircle, FiPhone, FiShield } from 'react-icons/fi';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import { PHONE_LINK, PHONE_NUMBER, WHATSAPP_LINK } from '../utils/constants';

const helpTopics = [
  {
    icon: FiBookOpen,
    title: 'Finding the right pet',
    text: 'Learn how to compare breeds, understand care needs, and shortlist a suitable companion.',
  },
  {
    icon: FiShield,
    title: 'Health and verification',
    text: 'Get help understanding vaccination status, health records, delivery, and handover checks.',
  },
  {
    icon: FiMessageCircle,
    title: 'Enquiries and account',
    text: 'Need help with OTP login, viewing prices, an enquiry, or its current status? We can guide you.',
  },
];

const Help = () => (
  <>
    <SEO
      title="Help & Support"
      description="Get help with pet listings, accounts, enquiries, health records, and delivery."
    />

    <section className="bg-gradient-hero py-14 sm:py-20 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: 'Help & Support' }]} />
        <div className="mt-6 flex flex-col items-center text-center">
          <span className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-3xl mb-4">
            <FaHeadset />
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">How can we help?</h1>
          <p className="text-white/80 max-w-2xl mt-3">
            Find quick guidance or speak directly with our pet support team.
          </p>
        </div>
      </div>
    </section>

    <section className="bg-gray-50 py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {helpTopics.map(({ icon: Icon, title, text }) => (
            <article key={title} className="bg-white rounded-2xl shadow-soft p-6">
              <span className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl">
                <Icon />
              </span>
              <h2 className="font-display font-bold text-xl text-gray-800 mt-4">{title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mt-2">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-3xl shadow-soft p-6 sm:p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-gray-800">Still need assistance?</h2>
          <p className="text-gray-500 mt-2">Our support team can help you choose the best next step.</p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <a
              href={WHATSAPP_LINK('Hello, I need help with the My Duke website.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white font-semibold px-6 py-3"
            >
              <FaWhatsapp /> WhatsApp Support
            </a>
            <a
              href={PHONE_LINK}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-200 text-primary-600 font-semibold px-6 py-3"
            >
              <FiPhone /> Call {PHONE_NUMBER}
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 text-gray-600 font-semibold px-6 py-3"
            >
              <FiMessageCircle /> Contact Form
            </Link>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default Help;
