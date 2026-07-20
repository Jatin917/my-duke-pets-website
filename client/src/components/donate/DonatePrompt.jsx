import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiHeart, FiX } from 'react-icons/fi';
import { fetchDonateSettings } from '../../services/donateService';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const DISMISS_KEY = 'myduke_donate_prompt_dismissed';

const DonatePrompt = () => {
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [open, setOpen] = useState(false);
  const timerStarted = useRef(false);

  const onDonatePage = location.pathname === '/donate' || location.pathname === '/login';
  const visible = Boolean(open && settings && !onDonatePage);

  useBodyScrollLock(visible);

  useEffect(() => {
    let cancelled = false;
    fetchDonateSettings()
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!settings?.promptEnabled || !settings?.pageEnabled) return undefined;
    if (sessionStorage.getItem(DISMISS_KEY) === '1') return undefined;
    if (timerStarted.current) return undefined;

    timerStarted.current = true;
    const delayMs = Math.max(5, Number(settings.promptDelaySeconds) || 30) * 1000;
    const timer = setTimeout(() => {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return;
      setOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [settings]);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === '1') setOpen(false);
    if (location.pathname === '/donate' || location.pathname === '/login') setOpen(false);
  }, [location.pathname]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setOpen(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 overscroll-none"
        onClick={dismiss}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-100/80 blur-2xl pointer-events-none" />
          <button
            type="button"
            onClick={dismiss}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 z-10"
            aria-label="Close"
          >
            <FiX />
          </button>

          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center text-2xl mb-4">
              <FiHeart />
            </div>
            <h3 className="text-xl font-display font-bold text-gray-800 mb-2">
              {settings.promptTitle}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">{settings.promptMessage}</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/donate"
                onClick={dismiss}
                className="flex-1 text-center btn-gradient text-white font-semibold py-3 rounded-xl shadow-glow"
              >
                {settings.promptCtaText || 'Donate Now'}
              </Link>
              <button
                type="button"
                onClick={dismiss}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DonatePrompt;
