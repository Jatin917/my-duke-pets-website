import { motion } from 'framer-motion';
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import { WHATSAPP_LINK, PHONE_LINK } from '../../utils/constants';

const FloatingContactButtons = () => {
  return (
    <div
      className="fixed z-40 flex flex-col gap-3 sm:gap-4 overflow-visible"
      style={{
        right: 'max(0.75rem, env(safe-area-inset-right))',
        bottom: 'max(5.5rem, calc(5.5rem + env(safe-area-inset-bottom)))',
      }}
    >
      <motion.a
        href={WHATSAPP_LINK()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/40 overflow-visible"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulseRing pointer-events-none" />
        <FaWhatsapp size={22} className="relative z-10 sm:text-[26px]" />
      </motion.a>

      <motion.a
        href={PHONE_LINK}
        aria-label="Call us"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.55 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full btn-gradient text-white flex items-center justify-center shadow-lg shadow-orange-500/40 overflow-visible"
      >
        <span className="absolute inset-0 rounded-full bg-primary-500 animate-pulseRing pointer-events-none" />
        <FaPhoneAlt size={18} className="relative z-10 sm:text-[22px]" />
      </motion.a>
    </div>
  );
};

export default FloatingContactButtons;
