import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import SectionHeading from './SectionHeading';

const faqs = [
  {
    q: 'How do I know the pets are healthy?',
    a: 'Every pet listed goes through a health check by certified veterinarians, and vaccination records are shared with you before adoption.',
  },
  {
    q: 'What is the enquiry & buying process?',
    a: 'Simply click "Enquire" or "Buy Now" on any pet listing, fill in your details, and our team will contact you within 24 hours to guide you through the next steps.',
  },
  {
    q: 'Do you offer delivery across India?',
    a: 'Yes, we offer safe and comfortable pet transport services to most major cities. Delivery charges may vary based on location.',
  },
  {
    q: 'Can I visit the pet before adopting?',
    a: 'Absolutely. We encourage in-person or video visits before finalizing any adoption to ensure the right match for your family.',
  },
  {
    q: 'What if the pet doesn\u2019t adjust well at home?',
    a: 'Our support team provides post-adoption guidance and behavioral tips. We are always here to help you and your new pet settle in.',
  },
];

const FAQItem = ({ item, isOpen, onClick }) => (
  <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-4 p-5 text-left"
    >
      <span className="font-semibold text-gray-800">{item.q}</span>
      <motion.span
        animate={{ rotate: isOpen ? 45 : 0 }}
        className="shrink-0 w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center"
      >
        <FiPlus />
      </motion.span>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{item.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          description="Everything you need to know before adopting your new best friend."
        />
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <FAQItem
              key={item.q}
              item={item}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
