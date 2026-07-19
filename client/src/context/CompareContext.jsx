import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const COMPARE_KEY = 'petnest_compare';
export const MAX_COMPARE = 4;

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    try {
      const stored = localStorage.getItem(COMPARE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(compareList));
  }, [compareList]);

  const isComparing = (petId) => compareList.includes(petId);

  const toggleCompare = (petId) => {
    setCompareList((prev) => {
      if (prev.includes(petId)) {
        return prev.filter((id) => id !== petId);
      }
      if (prev.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} pets at a time`);
        return prev;
      }
      return [...prev, petId];
    });
  };

  const removeFromCompare = (petId) => setCompareList((prev) => prev.filter((id) => id !== petId));
  const clearCompare = () => setCompareList([]);

  return (
    <CompareContext.Provider
      value={{ compareList, isComparing, toggleCompare, removeFromCompare, clearCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
};
