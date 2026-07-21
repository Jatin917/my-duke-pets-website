import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiBarChart2, FiTag } from 'react-icons/fi';

const MobileQuickFooter = () => {
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY || 0;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY || 0;
        const delta = currentY - lastY.current;

        if (currentY < 24) {
          setHidden(false);
        } else if (delta > 8) {
          setHidden(true);
        } else if (delta < -8) {
          setHidden(false);
        }

        lastY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  if (['/login', '/sell', '/compare'].includes(location.pathname)) return null;

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:hidden"
        >
          <div className="mx-auto max-w-md grid grid-cols-2 gap-2 rounded-2xl bg-white/95 backdrop-blur-md border border-gray-100 shadow-2xl p-2">
            <Link
              to="/sell"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 text-white font-semibold py-3 text-sm shadow-glow"
            >
              <FiTag size={16} /> Sell
            </Link>
            <Link
              to="/compare"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary-500 text-white font-semibold py-3 text-sm"
            >
              <FiBarChart2 size={16} /> Compare
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileQuickFooter;
