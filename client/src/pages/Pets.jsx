import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import PetCard from '../components/pets/PetCard';
import PetCardSkeleton from '../components/common/PetCardSkeleton';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import PetFilters, { ActiveFilterChips } from '../components/pets/PetFilters';
import EnquiryModal from '../components/modals/EnquiryModal';
import { fetchPets } from '../services/petService';
import { SORT_OPTIONS } from '../utils/constants';
import useDebounce from '../hooks/useDebounce';

const Pets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pets, setPets] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [enquiryPet, setEnquiryPet] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const debouncedSearch = useDebounce(filters.search || '', 400);

  const updateFilters = (next) => {
    const cleaned = Object.fromEntries(
      Object.entries({ ...next, page: 1 }).filter(([, v]) => v !== '' && v !== undefined)
    );
    setSearchParams(cleaned);
  };

  const setPage = (page) => {
    setSearchParams({ ...filters, page });
  };

  const setSort = (sort) => {
    setSearchParams({ ...filters, sort, page: 1 });
  };

  const clearFilters = () => setSearchParams({});

  const removeChip = (chip) => {
    const next = { ...filters };
    if (chip.key === 'category') {
      next.category = filters.category
        .split(',')
        .filter((c) => c !== chip.value)
        .join(',');
      if (!next.category) delete next.category;
    } else if (chip.key === 'gender') {
      next.gender = filters.gender
        .split(',')
        .filter((g) => g !== chip.value)
        .join(',');
      if (!next.gender) delete next.gender;
    } else if (chip.key === 'price') {
      delete next.minPrice;
      delete next.maxPrice;
    } else {
      delete next[chip.key];
    }
    setSearchParams(next);
  };

  useEffect(() => {
    setLoading(true);
    fetchPets({ ...filters, search: debouncedSearch, limit: 12 })
      .then((res) => {
        setPets(res.data || []);
        setMeta({ total: res.total, pages: res.pages });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    filters.category,
    filters.gender,
    filters.breed,
    filters.minPrice,
    filters.maxPrice,
    filters.availability,
    filters.sort,
    filters.page,
  ]);

  return (
    <>
      <SEO title="Browse Pets" description="Browse all available pets for adoption filtered by category, breed, gender, price and more." />

      <div className="bg-gray-50 min-h-screen pb-16">
        <div className="bg-white border-b border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={[{ label: 'All Pets' }]} />
            <h1 className="font-display text-3xl font-bold text-gray-800 mt-3">
              Explore All Pets
            </h1>
            <p className="text-gray-500 mt-1">
              {loading ? 'Loading...' : `${meta.total} pets found`}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex items-center justify-between mb-6 gap-4">
            <input
              type="text"
              placeholder="Search by name, breed..."
              value={filters.search || ''}
              onChange={(e) => setSearchParams({ ...filters, search: e.target.value, page: 1 })}
              className="flex-1 max-w-md px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:outline-none text-sm bg-white"
            />

            <div className="flex items-center gap-3">
              <select
                value={filters.sort || 'newest'}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:border-primary-400 focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium"
              >
                <FiFilter /> Filters
              </button>
            </div>
          </div>

          <ActiveFilterChips filters={filters} onRemove={removeChip} />

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <aside className="hidden lg:block">
              <PetFilters filters={filters} onChange={updateFilters} onClear={clearFilters} />
            </aside>

            <div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <PetCardSkeleton key={i} />
                  ))}
                </div>
              ) : pets.length === 0 ? (
                <EmptyState title="No pets found" message="Try adjusting your filters or search terms." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {pets.map((pet, i) => (
                    <PetCard key={pet._id} pet={pet} onEnquire={setEnquiryPet} index={i} />
                  ))}
                </div>
              )}

              <Pagination page={Number(filters.page) || 1} pages={meta.pages} onChange={setPage} />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/50 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-gray-50 overflow-y-auto p-4"
            >
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center"
                >
                  <FiX />
                </button>
              </div>
              <PetFilters filters={filters} onChange={updateFilters} onClear={clearFilters} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {enquiryPet && <EnquiryModal pet={enquiryPet} onClose={() => setEnquiryPet(null)} />}
    </>
  );
};

export default Pets;
