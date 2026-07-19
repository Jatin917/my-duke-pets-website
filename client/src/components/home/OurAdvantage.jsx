import { motion } from 'framer-motion';
import { FiActivity, FiAward, FiHeadphones, FiShield } from 'react-icons/fi';
import { FaDog, FaSyringe } from 'react-icons/fa';

const advantages = [
  {
    icon: FiShield,
    title: 'Health Guarantee',
    description:
      'Every pet is backed by a clear health guarantee so you can welcome them home with confidence.',
  },
  {
    icon: FaDog,
    title: 'Ethical Breeders',
    description:
      'We partner only with responsible breeders who put animal welfare and temperament first.',
  },
  {
    icon: FiActivity,
    title: 'Health Checkup',
    description:
      'Pets are examined by trusted vets before listing — no surprises when they arrive.',
  },
  {
    icon: FiAward,
    title: 'Expert Guidance',
    description:
      'Our pet-care team helps you choose the right companion and settle them in smoothly.',
  },
  {
    icon: FaSyringe,
    title: 'Vaccinated Pets',
    description:
      'Age-appropriate vaccination and deworming records are shared before handover.',
  },
  {
    icon: FiHeadphones,
    title: 'Best Support',
    description:
      'Friendly support before and after adoption — questions, care tips, and follow-ups included.',
  },
];

const OurAdvantage = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto mb-12"
      >
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
          Our Advantage
        </h2>
        <p className="text-gray-500">
          Let the paws fill up your space with love and affection.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {advantages.map((item, i) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-2xl shadow-soft border border-gray-50 p-8 text-center hover:shadow-glow transition-shadow"
          >
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center text-3xl">
              <item.icon />
            </div>
            <h3 className="font-display text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default OurAdvantage;
