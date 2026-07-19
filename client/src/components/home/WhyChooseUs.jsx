import { motion } from 'framer-motion';
import { FiShield, FiTruck, FiHeart, FiHeadphones } from 'react-icons/fi';
import SectionHeading from './SectionHeading';

const features = [
  {
    icon: FiShield,
    title: 'Verified & Healthy',
    description: 'Every pet is health-checked, vaccinated and verified before listing.',
  },
  {
    icon: FiHeart,
    title: 'Ethical Sourcing',
    description: 'We partner only with responsible breeders & shelters who prioritize animal welfare.',
  },
  {
    icon: FiTruck,
    title: 'Safe Delivery',
    description: 'Secure, comfortable transport options available across major cities.',
  },
  {
    icon: FiHeadphones,
    title: '24/7 Support',
    description: 'Our pet care experts are always available to guide you before & after adoption.',
  },
];

const WhyChooseUs = () => (
  <section className="py-20 bg-white relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Why Choose Us"
        title="A Trustworthy Way To Find Your Pet"
        description="We make pet adoption simple, safe, and transparent — from browsing to bringing them home."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -6 }}
            className="p-6 rounded-2xl border border-gray-100 shadow-soft hover:shadow-glow transition-shadow bg-white"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-2xl mb-5">
              <feature.icon />
            </div>
            <h3 className="font-display text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
