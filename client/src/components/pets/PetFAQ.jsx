import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import { buildPetFAQs } from '../../utils/petMeta';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

const PetFAQ = ({ pet }) => {
  const { isAuthenticated } = useCustomerAuth();
  const faqs = buildPetFAQs(pet, { showPrice: isAuthenticated });
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <h3 className="font-display font-bold text-gray-800 mb-1">Frequently Asked Questions</h3>
      <p className="text-sm text-gray-500 mb-5">Common questions about adopting {pet.name}</p>

      <div className="space-y-3">
        {faqs.map((item, i) => (
          <div key={item.q} className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="w-full flex items-center justify-between gap-4 p-4 text-left"
            >
              <span className="text-sm font-semibold text-gray-800">{item.q}</span>
              <motion.span
                animate={{ rotate: openIndex === i ? 45 : 0 }}
                className="shrink-0 w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center"
              >
                <FiPlus size={13} />
              </motion.span>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PetFAQ;
