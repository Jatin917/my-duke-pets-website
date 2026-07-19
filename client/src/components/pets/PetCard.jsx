import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiEye, FiBarChart2 } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import { resolveImageUrl } from '../../services/api';
import { truncate } from '../../utils/formatters';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import PetPrice from './PetPrice';

const PetCard = ({ pet, onEnquire, index = 0 }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isComparing, toggleCompare } = useCompare();
  const images = pet.images?.length ? pet.images : [];
  const wishlisted = isWishlisted(pet._id);
  const comparing = isComparing(pet._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-shadow duration-300 flex flex-col"
    >
      <div
        className="relative h-56 overflow-hidden bg-gray-100"
        onMouseEnter={() => images.length > 1 && setImgIndex(1)}
        onMouseLeave={() => setImgIndex(0)}
      >
        <Link to={`/pets/${pet.slug}`}>
          {images.length > 0 ? (
            <img
              src={resolveImageUrl(images[imgIndex] || images[0])}
              alt={pet.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">🐾</div>
          )}
        </Link>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {pet.featured && (
            <span className="bg-primary-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow">
              Featured
            </span>
          )}
          <span
            className={`text-[11px] font-bold px-3 py-1 rounded-full shadow ${
              pet.availability ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
            }`}
          >
            {pet.availability ? 'Available' : 'Adopted'}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={() => toggleWishlist(pet._id)}
            aria-label="Toggle wishlist"
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition ${
              wishlisted ? 'bg-primary-500 text-white' : 'bg-white/80 text-gray-600 hover:text-primary-500'
            }`}
          >
            <FiHeart className={wishlisted ? 'fill-current' : ''} />
          </button>
          <button
            onClick={() => toggleCompare(pet._id)}
            aria-label="Toggle compare"
            title="Add to Compare"
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition ${
              comparing ? 'bg-secondary-500 text-white' : 'bg-white/80 text-gray-600 hover:text-secondary-500'
            }`}
          >
            <FiBarChart2 />
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-lg font-display font-bold text-gray-800 truncate">{pet.name}</h3>
          {pet.vaccinationStatus === 'Vaccinated' && (
            <span title="Vaccinated" className="text-secondary-500 shrink-0 mt-0.5">
              <MdVerified />
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-3">{pet.breed}</p>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{pet.gender}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{pet.age}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            {pet.vaccinationStatus}
          </span>
        </div>

        {pet.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3">{truncate(pet.description, 80)}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <PetPrice pet={pet} size="md" returnPath={`/pets/${pet.slug}`} />
        </div>

        <div className="flex gap-2 mt-4">
          <Link
            to={`/pets/${pet.slug}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold border-2 border-primary-500 text-primary-600 rounded-xl py-2.5 hover:bg-primary-50 transition"
          >
            <FiEye /> View
          </Link>
          <button
            onClick={() => onEnquire(pet)}
            className="flex-1 text-sm font-semibold btn-gradient text-white rounded-xl py-2.5 shadow-sm"
          >
            Enquire
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PetCard;
