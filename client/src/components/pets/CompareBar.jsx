import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiBarChart2, FiTrash2 } from 'react-icons/fi';
import { useCompare, MAX_COMPARE } from '../../context/CompareContext';
import { fetchPetById } from '../../services/petService';
import { resolveImageUrl } from '../../services/api';

const CompareBar = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [pets, setPets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (compareList.length === 0) {
      setPets([]);
      return;
    }
    Promise.all(
      compareList.map((id) =>
        fetchPetById(id)
          .then((res) => res.data)
          .catch(() => null)
      )
    ).then((results) => setPets(results.filter(Boolean)));
  }, [compareList]);

  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 sm:px-6 sm:pb-4"
        >
          <div className="max-w-4xl mx-auto glass-dark rounded-2xl shadow-2xl px-4 sm:px-6 py-3 flex items-center gap-4 border border-white/10">
            <div className="flex items-center gap-2 shrink-0 text-white">
              <FiBarChart2 className="text-primary-400" />
              <span className="hidden sm:inline text-sm font-semibold">Compare</span>
              <span className="text-xs bg-primary-500 px-2 py-0.5 rounded-full font-bold">
                {compareList.length}/{MAX_COMPARE}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-1 overflow-x-auto py-1">
              {pets.map((pet) => (
                <div
                  key={pet._id}
                  className="relative shrink-0 w-11 h-11 rounded-xl overflow-hidden border-2 border-white/20"
                >
                  <img
                    src={resolveImageUrl(pet.images?.[0])}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFromCompare(pet._id)}
                    aria-label={`Remove ${pet.name} from compare`}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={clearCompare}
              aria-label="Clear compare list"
              className="hidden sm:flex w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center shrink-0"
            >
              <FiTrash2 size={15} />
            </button>

            <button
              onClick={() => navigate('/compare')}
              disabled={compareList.length < 2}
              className="btn-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-xl shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Compare Now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompareBar;
