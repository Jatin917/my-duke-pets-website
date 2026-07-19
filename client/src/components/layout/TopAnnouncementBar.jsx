import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaAmbulance, FaPaw } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

const MESSAGE =
  '🚑 Safe & Comfortable Pet Transport   •   ✅ Vet-Checked & Vaccinated   •   🏥 Health Guaranteed   •   🚚 Doorstep Delivery Across India';

const PawTrail = () => (
  <div className="hidden sm:flex items-center gap-1 mr-2">
    {[0, 0.25, 0.5].map((delay) => (
      <FaPaw
        key={delay}
        size={9}
        className="text-white/70 animate-pawTrail"
        style={{ animationDelay: `${delay}s` }}
      />
    ))}
  </div>
);

const TopAnnouncementBar = ({ onDismiss }) => {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative z-50 overflow-hidden bg-gradient-hero text-white"
        >
          <div className="flex items-center h-9 sm:h-10 px-3 sm:px-6">
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-1.5 shrink-0 mr-3"
            >
              <FaAmbulance className="text-primary-300" size={16} />
              <PawTrail />
            </motion.div>

            <div className="flex-1 overflow-hidden">
              <div className="flex whitespace-nowrap animate-marquee w-max text-xs sm:text-[13px] font-medium tracking-wide">
                <span className="pr-10">{MESSAGE}</span>
                <span className="pr-10">{MESSAGE}</span>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              aria-label="Dismiss announcement"
              className="shrink-0 ml-3 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <FiX size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopAnnouncementBar;
