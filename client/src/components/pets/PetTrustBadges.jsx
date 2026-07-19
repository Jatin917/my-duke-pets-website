import { motion } from 'framer-motion';
import { FiShield, FiActivity, FiAward, FiTruck } from 'react-icons/fi';

const badges = [
  { icon: FiShield, title: 'Health Guarantee', text: 'Vet-checked & certified healthy' },
  { icon: FiActivity, title: 'Vaccinated & Dewormed', text: 'Up-to-date health records' },
  { icon: FiAward, title: 'Verified Source', text: 'Ethically sourced & documented' },
  { icon: FiTruck, title: 'Pan-India Delivery', text: 'Safe doorstep delivery' },
];

const PetTrustBadges = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
    {badges.map((badge, i) => (
      <motion.div
        key={badge.title}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.08 }}
        className="bg-white rounded-2xl shadow-soft p-4 text-center"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-primary text-white flex items-center justify-center text-lg mx-auto mb-2.5">
          <badge.icon />
        </div>
        <p className="text-sm font-bold text-gray-800">{badge.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{badge.text}</p>
      </motion.div>
    ))}
  </div>
);

export default PetTrustBadges;
