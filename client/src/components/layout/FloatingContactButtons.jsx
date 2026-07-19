import { motion } from 'framer-motion';
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import { WHATSAPP_LINK, PHONE_LINK } from '../../utils/constants';

const FloatingContactButtons = () => {
  return (
    <div className="fixed right-4 sm:right-6 bottom-24 sm:bottom-28 z-40 flex flex-col gap-4">
      <motion.a
        href={WHATSAPP_LINK()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/40"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulseRing" />
        <FaWhatsapp size={26} className="relative z-10" />
      </motion.a>

      <motion.a
        href={PHONE_LINK}
        aria-label="Call us"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.55 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full btn-gradient text-white flex items-center justify-center shadow-lg shadow-orange-500/40"
      >
        <span className="absolute inset-0 rounded-full bg-primary-500 animate-pulseRing" />
        <FaPhoneAlt size={22} className="relative z-10" />
      </motion.a>
    </div>
  );
};

export default FloatingContactButtons;
