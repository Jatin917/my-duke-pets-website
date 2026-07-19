import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import SectionHeading from './SectionHeading';
import PetCard from '../pets/PetCard';
import PetCardSkeleton from '../common/PetCardSkeleton';
import EmptyState from '../common/EmptyState';

const PetsShowcaseSection = ({
  title,
  eyebrow,
  description,
  fetcher,
  onEnquire,
  bgClass = 'bg-gray-50',
}) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher()
      .then((res) => setPets(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetcher]);

  return (
    <section className={`py-20 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} center={false} />
          <Link
            to="/pets"
            className="hidden sm:flex items-center gap-1.5 text-primary-600 font-semibold text-sm hover:gap-2.5 transition-all mb-12"
          >
            View All <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <PetCardSkeleton key={i} />
            ))}
          </div>
        ) : pets.length === 0 ? (
          <EmptyState title="No pets available" message="Check back soon for new arrivals." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pets.map((pet, i) => (
              <PetCard key={pet._id} pet={pet} onEnquire={onEnquire} index={i} />
            ))}
          </div>
        )}

        <div className="sm:hidden text-center mt-8">
          <Link to="/pets" className="inline-flex items-center gap-1.5 text-primary-600 font-semibold text-sm">
            View All Pets <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PetsShowcaseSection;
