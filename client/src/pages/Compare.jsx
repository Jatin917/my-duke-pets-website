import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiX, FiPlus } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import EnquiryModal from '../components/modals/EnquiryModal';
import { useCompare, MAX_COMPARE } from '../context/CompareContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { fetchPetById } from '../services/petService';
import { resolveImageUrl } from '../services/api';
import { formatPrice } from '../utils/formatters';
import PetPrice from '../components/pets/PetPrice';

const Compare = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { isAuthenticated } = useCustomerAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enquiryPet, setEnquiryPet] = useState(null);

  const rows = [
    { label: 'Category', render: (p) => p.category?.name || '-' },
    { label: 'Breed', render: (p) => p.breed },
    {
      label: 'Price',
      render: (p) =>
        isAuthenticated ? (
          formatPrice(p.discountPrice || p.price)
        ) : (
          <PetPrice pet={p} size="sm" layout="compact" returnPath="/compare" />
        ),
    },
    { label: 'Age', render: (p) => p.age },
    { label: 'Gender', render: (p) => p.gender },
    { label: 'Color', render: (p) => p.color || '-' },
    { label: 'Weight', render: (p) => p.weight || '-' },
    { label: 'Vaccination', render: (p) => p.vaccinationStatus },
    { label: 'Health Status', render: (p) => p.healthStatus || '-' },
    { label: 'Temperament', render: (p) => p.temperament || '-' },
    { label: 'Food Preference', render: (p) => p.foodPreference || '-' },
    {
      label: 'Availability',
      render: (p) => (p.availability ? 'Available' : 'Adopted'),
    },
  ];

  useEffect(() => {
    if (compareList.length === 0) {
      setPets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      compareList.map((id) =>
        fetchPetById(id)
          .then((res) => res.data)
          .catch(() => null)
      )
    )
      .then((results) => setPets(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [compareList]);

  return (
    <>
      <SEO title="Compare Pets" description="Compare pets side-by-side to make the best choice for your family." />

      <div className="bg-gray-50 min-h-screen pb-16">
        <div className="bg-white border-b border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={[{ label: 'Compare Pets' }]} />
            <div className="flex items-center justify-between flex-wrap gap-4 mt-3">
              <h1 className="font-display text-3xl font-bold text-gray-800">Compare Pets</h1>
              {pets.length > 0 && (
                <button onClick={clearCompare} className="text-sm text-red-500 font-semibold hover:underline">
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {loading ? (
            <Loader full />
          ) : pets.length === 0 ? (
            <EmptyState
              title="No pets to compare"
              message="Add pets to compare by clicking the compare icon on any pet card."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-y-3">
                <thead>
                  <tr>
                    <th className="w-40 text-left" />
                    {pets.map((pet, i) => (
                      <motion.th
                        key={pet._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl shadow-soft p-4 min-w-[220px] align-top"
                      >
                        <div className="relative">
                          <button
                            onClick={() => removeFromCompare(pet._id)}
                            className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-500"
                          >
                            <FiX size={14} />
                          </button>
                          <Link to={`/pets/${pet.slug}`} className="block">
                            <img
                              src={resolveImageUrl(pet.images?.[0])}
                              alt={pet.name}
                              className="w-full h-32 object-cover rounded-xl mb-3"
                            />
                            <div className="flex items-center justify-center gap-1.5">
                              <p className="font-display font-bold text-gray-800">{pet.name}</p>
                              {pet.vaccinationStatus === 'Vaccinated' && (
                                <MdVerified className="text-secondary-500" size={14} />
                              )}
                            </div>
                          </Link>
                          <button
                            onClick={() => setEnquiryPet(pet)}
                            className="mt-3 w-full btn-gradient text-white text-xs font-semibold py-2 rounded-lg"
                          >
                            Enquire
                          </button>
                        </div>
                      </motion.th>
                    ))}
                    {pets.length < MAX_COMPARE && (
                      <th className="min-w-[220px] align-top">
                        <Link
                          to="/pets"
                          className="flex flex-col items-center justify-center h-full min-h-[200px] rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition"
                        >
                          <FiPlus size={22} className="mb-1" />
                          <span className="text-sm font-medium">Add More</span>
                        </Link>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <td className="font-semibold text-gray-600 text-sm pr-4 py-3 whitespace-nowrap">
                        {row.label}
                      </td>
                      {pets.map((pet) => (
                        <td
                          key={pet._id}
                          className="bg-white text-center text-sm text-gray-700 py-3 px-4 rounded-xl shadow-soft"
                        >
                          {row.render(pet)}
                        </td>
                      ))}
                      {pets.length < MAX_COMPARE && <td />}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {enquiryPet && <EnquiryModal pet={enquiryPet} onClose={() => setEnquiryPet(null)} />}
    </>
  );
};

export default Compare;
