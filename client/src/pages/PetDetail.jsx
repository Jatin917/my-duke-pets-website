import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShare2, FiBarChart2 } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import Loader from '../components/common/Loader';
import ImageGallery from '../components/pets/ImageGallery';
import PetVerticalVideo from '../components/pets/PetVerticalVideo';
import PetCard from '../components/pets/PetCard';
import PetQuickFacts from '../components/pets/PetQuickFacts';
import PetTrustBadges from '../components/pets/PetTrustBadges';
import PetCareTips from '../components/pets/PetCareTips';
import PetDietSection from '../components/pets/PetDietSection';
import PetFAQ from '../components/pets/PetFAQ';
import EnquiryModal from '../components/modals/EnquiryModal';
import PetPrice from '../components/pets/PetPrice';
import { fetchPetById } from '../services/petService';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { getVideoEmbed } from '../utils/video';

const PetDetail = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enquiryPet, setEnquiryPet] = useState(null);
  const [videoFullscreen, setVideoFullscreen] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isComparing, toggleCompare } = useCompare();

  useEffect(() => {
    setLoading(true);
    fetchPetById(id)
      .then((res) => {
        setPet(res.data);
        setRelated(res.related || []);
      })
      .catch(() => setPet(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader full />;

  if (!pet) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pet not found</h2>
        <p className="text-gray-500 mb-6">This pet may have already found a home.</p>
        <Link to="/pets" className="btn-gradient text-white font-semibold px-6 py-3 rounded-full">
          Browse Other Pets
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(pet._id);
  const comparing = isComparing(pet._id);
  const hasVideo = Boolean(getVideoEmbed(pet.videoUrl));

  return (
    <>
      <SEO
        title={pet.seoTitle || pet.name}
        description={pet.seoDescription || pet.description}
        image={pet.images?.[0]}
      />

      <div className="bg-gray-50 min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Breadcrumb
            items={[
              { label: 'All Pets', to: '/pets' },
              { label: pet.category?.name || 'Pets', to: `/pets?category=${pet.category?.slug}` },
              { label: pet.name },
            ]}
          />

          {/* Header */}
          <div className="mt-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-800">{pet.name}</h1>
                {pet.vaccinationStatus === 'Vaccinated' && (
                  <MdVerified className="text-secondary-500 text-2xl" title="Vaccinated" />
                )}
              </div>
              <p className="text-gray-500 mt-1">{pet.breed}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    pet.availability ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {pet.availability ? 'Available' : 'Adopted'}
                </span>
                {pet.featured && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-100 text-primary-700">
                    Featured
                  </span>
                )}
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-secondary-100 text-secondary-700">
                  {pet.vaccinationStatus}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="mr-2">
                <PetPrice pet={pet} size="lg" returnPath={`/pets/${pet.slug}`} />
              </div>
              <button
                onClick={() => toggleWishlist(pet._id)}
                title="Add to Wishlist"
                className={`w-11 h-11 rounded-full flex items-center justify-center border transition ${
                  wishlisted
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'border-gray-200 text-gray-500 hover:border-primary-300 bg-white'
                }`}
              >
                <FiHeart className={wishlisted ? 'fill-current' : ''} />
              </button>
              <button
                onClick={() => toggleCompare(pet._id)}
                title="Add to Compare"
                className={`w-11 h-11 rounded-full flex items-center justify-center border transition ${
                  comparing
                    ? 'bg-secondary-500 text-white border-secondary-500'
                    : 'border-gray-200 text-gray-500 hover:border-secondary-300 bg-white'
                }`}
              >
                <FiBarChart2 />
              </button>
              <button
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                title="Share"
                className="w-11 h-11 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:border-primary-300 bg-white transition"
              >
                <FiShare2 />
              </button>
            </div>
          </div>

          {pet.description && (
            <p className="text-gray-600 leading-relaxed mt-4 max-w-3xl">{pet.description}</p>
          )}
        </div>

        {/* Media: landscape image + 9:16 vertical video */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div
            className={`grid gap-6 lg:gap-8 items-start ${
              hasVideo ? 'grid-cols-1 lg:grid-cols-[1fr_280px]' : 'grid-cols-1'
            }`}
          >
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <ImageGallery
                images={pet.images}
                name={pet.name}
                videoUrl={pet.videoUrl}
                onWatchVideo={() => setVideoFullscreen(true)}
              />
            </motion.div>

            {hasVideo && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:sticky lg:top-28"
              >
                <PetVerticalVideo
                  videoUrl={pet.videoUrl}
                  name={pet.name}
                  fullscreenOpen={videoFullscreen}
                  onCloseFullscreen={() => setVideoFullscreen(false)}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Quick facts + CTA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div>
            <PetQuickFacts pet={pet} />
            {pet.additionalNotes && (
              <div className="bg-primary-50 rounded-2xl p-5 mt-6 flex items-start gap-3">
                <MdVerified className="text-primary-500 mt-1 shrink-0" />
                <p className="text-sm text-primary-800">{pet.additionalNotes}</p>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-6 lg:sticky lg:top-28">
            <p className="text-sm text-gray-500 mb-1">Ready to bring {pet.name} home?</p>
            <div className="mb-4">
              <PetPrice pet={pet} size="lg" returnPath={`/pets/${pet.slug}`} />
            </div>
            <button
              onClick={() => setEnquiryPet(pet)}
              className="w-full btn-gradient text-white font-bold text-lg py-4 rounded-2xl shadow-glow"
            >
              Buy Now / Enquire
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <h2 className="font-display text-xl font-bold text-gray-800 mb-5">
            Why Buy {pet.name} From Us?
          </h2>
          <PetTrustBadges />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <PetCareTips pet={pet} />
          <PetFAQ pet={pet} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <PetDietSection pet={pet} />
        </div>

        {related.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">Related Pets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((rp, i) => (
                <PetCard key={rp._id} pet={rp} onEnquire={setEnquiryPet} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {enquiryPet && <EnquiryModal pet={enquiryPet} onClose={() => setEnquiryPet(null)} />}
    </>
  );
};

export default PetDetail;
