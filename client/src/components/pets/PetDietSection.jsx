import { motion } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';
import { RECOMMENDED_DIET, FOODS_TO_AVOID } from '../../utils/petMeta';

const DietCard = ({ title, subtitle, items, tone, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="bg-white rounded-2xl shadow-soft p-6"
  >
    <h4 className="font-display font-bold text-gray-800 mb-1">{title}</h4>
    <p className="text-xs text-gray-500 mb-4">{subtitle}</p>
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.title} className="flex items-start gap-3">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              tone === 'good' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
            }`}
          >
            {tone === 'good' ? <FiCheck size={13} /> : <FiX size={13} />}
          </span>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">{item.title}: </span>
            {item.text}
          </p>
        </div>
      ))}
    </div>
  </motion.div>
);

const PetDietSection = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
    <DietCard
      title="Recommended Diet"
      subtitle="Best foods to keep your new pet healthy and strong"
      items={RECOMMENDED_DIET}
      tone="good"
      delay={0}
    />
    <DietCard
      title="Foods to Avoid"
      subtitle="Keep these away to prevent health complications"
      items={FOODS_TO_AVOID}
      tone="bad"
      delay={0.1}
    />
  </div>
);

export default PetDietSection;
