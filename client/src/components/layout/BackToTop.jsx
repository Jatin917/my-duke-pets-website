import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowUp } from 'react-icons/fi';
import { useCompare } from '../../context/CompareContext';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const { compareList } = useCompare();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className={`fixed z-40 w-11 h-11 rounded-full bg-dark-900 text-white flex items-center justify-center shadow-lg hover:bg-primary-600 transition-all ${
            compareList.length > 0
              ? 'left-4 sm:left-6 bottom-36 sm:bottom-28'
              : 'left-4 sm:right-6 sm:left-auto bottom-24 sm:bottom-6'
          }`}
        >
          <FiArrowUp />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
