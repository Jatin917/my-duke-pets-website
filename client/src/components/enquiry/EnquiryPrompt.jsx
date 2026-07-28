import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMessageSquare, FiX } from 'react-icons/fi';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import { fetchCategories } from '../../services/categoryService';
import { fetchBreeds } from '../../services/breedService';
import {
  fetchEnquiryPromptSettings,
  submitPromptEnquiry,
} from '../../services/enquiryPromptService';
import { INDIAN_STATES, citiesForState } from '../../utils/indiaLocations';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export const ENQUIRY_PROMPT_DISMISS_KEY = 'myduke_enquiry_prompt_dismissed';
export const ENQUIRY_PROMPT_OPEN_KEY = 'myduke_enquiry_prompt_open';

const OTHER = '__other__';

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100';

const setPromptOpenFlag = (open) => {
  try {
    if (open) sessionStorage.setItem(ENQUIRY_PROMPT_OPEN_KEY, '1');
    else sessionStorage.removeItem(ENQUIRY_PROMPT_OPEN_KEY);
  } catch {
    /* ignore */
  }
};

const EnquiryPrompt = () => {
  const location = useLocation();
  const { customer, isAuthenticated } = useCustomerAuth();
  const [settings, setSettings] = useState(null);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    category: '',
    breed: '',
    customBreed: '',
    message: '',
  });

  const blockedPaths = ['/login', '/donate', '/contact', '/help'];
  const onBlockedPage = blockedPaths.some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`)
  );
  const visible = Boolean(open && settings && !onBlockedPage);

  useBodyScrollLock(visible);

  const cities = useMemo(() => citiesForState(form.state), [form.state]);
  const isOtherCategory = form.category === OTHER;

  useEffect(() => {
    let cancelled = false;

    fetchEnquiryPromptSettings()
      .then((promptSettings) => {
        if (!cancelled) setSettings(promptSettings);
      })
      .catch(() => {
        if (!cancelled) {
          setSettings({
            promptEnabled: true,
            promptDelaySeconds: 30,
            promptTitle: 'Looking for a pet?',
            promptMessage:
              'Tell us what you need — pick a category and breed, and our team will get back to you.',
            promptCtaText: 'Submit Enquiry',
          });
        }
      });

    fetchCategories()
      .then((cats) => {
        if (!cancelled) setCategories(cats.data || []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !customer) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || customer.name || '',
      email: prev.email || customer.email || '',
      phone: prev.phone || customer.phone || '',
      state: prev.state || customer.state || '',
      city: prev.city || customer.city || '',
    }));
  }, [isAuthenticated, customer]);

  useEffect(() => {
    if (!settings?.promptEnabled) return undefined;
    if (sessionStorage.getItem(ENQUIRY_PROMPT_DISMISS_KEY) === '1') return undefined;

    const delayMs = Math.max(5, Number(settings.promptDelaySeconds) || 30) * 1000;
    const timer = setTimeout(() => {
      if (sessionStorage.getItem(ENQUIRY_PROMPT_DISMISS_KEY) === '1') return;
      setOpen(true);
      setPromptOpenFlag(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [settings]);

  useEffect(() => {
    if (sessionStorage.getItem(ENQUIRY_PROMPT_DISMISS_KEY) === '1') {
      setOpen(false);
      setPromptOpenFlag(false);
    }
    if (onBlockedPage) {
      setOpen(false);
      setPromptOpenFlag(false);
    }
  }, [location.pathname, onBlockedPage]);

  useEffect(() => {
    if (!form.category || form.category === OTHER) {
      setBreeds([]);
      return undefined;
    }
    let cancelled = false;
    fetchBreeds({ category: form.category })
      .then((res) => {
        if (!cancelled) setBreeds(res.data || []);
      })
      .catch(() => {
        if (!cancelled) setBreeds([]);
      });
    return () => {
      cancelled = true;
    };
  }, [form.category]);

  const updateField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'category') {
        next.breed = '';
        next.customBreed = '';
      }
      if (field === 'state') next.city = '';
      return next;
    });
  };

  const dismiss = () => {
    sessionStorage.setItem(ENQUIRY_PROMPT_DISMISS_KEY, '1');
    setPromptOpenFlag(false);
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const breedValue =
      isOtherCategory || form.breed === OTHER
        ? form.customBreed.trim()
        : form.breed.trim();

    if (!breedValue) {
      toast.error('Please select or enter a breed');
      return;
    }

    setSending(true);
    try {
      const categoryName =
        isOtherCategory
          ? 'Other'
          : categories.find((c) => c._id === form.category)?.name || form.category;

      await submitPromptEnquiry({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.replace(/\D/g, '').slice(-10),
        state: form.state,
        city: form.city,
        category: categoryName,
        breed: breedValue,
        message: form.message.trim(),
      });
      toast.success('Enquiry submitted! Our team will contact you soon.');
      dismiss();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not submit enquiry');
    } finally {
      setSending(false);
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[92] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overscroll-none"
        onClick={dismiss}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={dismiss}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 z-10"
            aria-label="Close"
          >
            <FiX />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center text-2xl mb-4">
            <FiMessageSquare />
          </div>
          <h3 className="text-xl font-display font-bold text-gray-800 mb-2 pr-8">
            {settings.promptTitle}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">{settings.promptMessage}</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                required
                className={inputClass}
                placeholder="Name *"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
              <input
                required
                type="email"
                className={inputClass}
                placeholder="Email *"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
              <input
                required
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className={inputClass}
                placeholder="Mobile *"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
              <select
                required
                className={inputClass}
                value={form.state}
                onChange={(e) => updateField('state', e.target.value)}
              >
                <option value="">State *</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                required
                className={inputClass}
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                disabled={!form.state}
              >
                <option value="">City *</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                required
                className={inputClass}
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
              >
                <option value="">Category *</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
                <option value={OTHER}>Other</option>
              </select>
              {isOtherCategory || form.breed === OTHER ? (
                <input
                  required
                  className={`${inputClass} sm:col-span-2`}
                  placeholder="Enter breed *"
                  value={form.customBreed}
                  onChange={(e) => updateField('customBreed', e.target.value)}
                />
              ) : (
                <select
                  required
                  className={inputClass}
                  value={form.breed}
                  onChange={(e) => updateField('breed', e.target.value)}
                  disabled={!form.category}
                >
                  <option value="">
                    {form.category ? 'Select breed *' : 'Select category first'}
                  </option>
                  {breeds.map((b) => (
                    <option key={b._id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                  <option value={OTHER}>Other (type below)</option>
                </select>
              )}
              {form.breed === OTHER && !isOtherCategory && (
                <input
                  required
                  className={`${inputClass} sm:col-span-2`}
                  placeholder="Enter breed *"
                  value={form.customBreed}
                  onChange={(e) => updateField('customBreed', e.target.value)}
                />
              )}
              <textarea
                rows={3}
                className={`${inputClass} sm:col-span-2 resize-y`}
                placeholder="Message (optional)"
                value={form.message}
                onChange={(e) => updateField('message', e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 btn-gradient text-white font-semibold py-3 rounded-xl shadow-glow disabled:opacity-60"
              >
                {sending ? 'Submitting…' : settings.promptCtaText || 'Submit Enquiry'}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
              >
                Maybe later
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnquiryPrompt;
