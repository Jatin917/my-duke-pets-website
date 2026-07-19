import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color = 'from-primary-500 to-primary-600', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl shadow-soft p-6 flex items-center gap-4"
  >
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center text-2xl shrink-0`}>
      <Icon />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </motion.div>
);

export default StatCard;
