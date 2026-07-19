import { motion } from 'framer-motion';

const SectionHeading = ({ eyebrow, title, description, center = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`max-w-2xl mb-12 ${center ? 'mx-auto text-center' : ''}`}
  >
    {eyebrow && (
      <span className="inline-block text-primary-600 bg-primary-50 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
        {eyebrow}
      </span>
    )}
    <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-800 mb-3">{title}</h2>
    {description && <p className="text-gray-500">{description}</p>}
  </motion.div>
);

export default SectionHeading;
