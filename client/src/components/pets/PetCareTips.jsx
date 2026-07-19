import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import { getCareTips } from '../../utils/petMeta';

const PetCareTips = ({ pet }) => {
  const tips =
    Array.isArray(pet.careTips) && pet.careTips.length > 0 ? pet.careTips : getCareTips(pet);

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <h3 className="font-display font-bold text-gray-800 mb-1">Care Tips for {pet.name}</h3>
      <p className="text-sm text-gray-500 mb-5">
        A steady routine keeps {pet.name} happy and healthy in their new home.
      </p>
      <div className="space-y-4">
        {tips.map((tip, i) => (
          <motion.div
            key={`${tip.title}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-3"
          >
            <FiCheckCircle className="text-primary-500 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{tip.title}: </span>
              {tip.text}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PetCareTips;
