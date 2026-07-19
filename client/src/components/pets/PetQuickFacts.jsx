import { motion } from 'framer-motion';
import {
  FiTag,
  FiUser,
  FiDroplet,
  FiFeather,
  FiTruck,
  FiShield,
  FiHeart,
  FiClock,
} from 'react-icons/fi';
import { getLifespan, getSize, getDeliveryEstimate } from '../../utils/petMeta';
import PetPrice from './PetPrice';

const Fact = ({ icon: Icon, label, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
  >
    <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
      <Icon size={15} />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
    </div>
  </motion.div>
);

const PetQuickFacts = ({ pet }) => {
  const facts = [
    { icon: FiTag, label: 'Breed', value: pet.breed },
    { icon: FiUser, label: 'Gender', value: pet.gender },
    { icon: FiClock, label: 'Age', value: pet.age },
    { icon: FiDroplet, label: 'Color', value: pet.color || '-' },
    { icon: FiFeather, label: 'Size', value: getSize(pet.category?.name) },
    { icon: FiHeart, label: 'Lifespan', value: getLifespan(pet.category?.name) },
    { icon: FiShield, label: 'Vaccination', value: pet.vaccinationStatus },
    { icon: FiTruck, label: 'Delivery', value: getDeliveryEstimate() },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-soft p-5">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="font-display font-bold text-gray-800">Quick Facts</h3>
        <PetPrice pet={pet} size="sm" layout="compact" returnPath={`/pets/${pet.slug}`} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        {facts.map((fact, i) => (
          <Fact key={fact.label} {...fact} delay={i * 0.03} />
        ))}
      </div>
    </div>
  );
};

export default PetQuickFacts;
