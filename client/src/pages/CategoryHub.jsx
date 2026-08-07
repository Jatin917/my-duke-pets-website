import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import PetCard from '../components/pets/PetCard';
import PetCardSkeleton from '../components/common/PetCardSkeleton';
import EmptyState from '../components/common/EmptyState';
import EnquiryModal from '../components/modals/EnquiryModal';
import { fetchPets } from '../services/petService';
import { fetchCategories } from '../services/categoryService';
import { SITE_NAME, SITE_URL } from '../utils/constants';

const CategoryHub = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enquiryPet, setEnquiryPet] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchCategories(), fetchPets({ category: slug, limit: 24, availability: true })])
      .then(([catRes, petRes]) => {
        if (cancelled) return;
        const list = catRes.data || catRes || [];
        setCategory(list.find((c) => c.slug === slug) || { name: slug, slug, description: '' });
        setPets(petRes.data || []);
      })
      .catch(() => {
        if (!cancelled) {
          setCategory({ name: slug, slug });
          setPets([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const name = category?.name || slug;
  const title = `${name} for Sale in India`;
  const description =
    category?.description ||
    `Browse verified ${String(name).toLowerCase()} for sale across India on ${SITE_NAME}. Healthy, vaccinated pets from genuine sellers — enquire on WhatsApp.`;

  return (
    <>
      <SEO
        path={`/pets/category/${slug}`}
        title={title}
        description={description}
        keywords={`${name} for sale India, buy ${name} India, ${name} Gurugram, verified ${name}, ${SITE_NAME}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          description,
          url: `${SITE_URL}/pets/category/${slug}`,
          isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
        }}
      />

      <div className="bg-gray-50 min-h-screen pb-16">
        <div className="bg-white border-b border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb
              items={[
                { label: 'All Pets', to: '/pets' },
                { label: name },
              ]}
            />
            <h1 className="font-display text-3xl font-bold text-gray-800 mt-3">{name} for Sale</h1>
            <p className="text-gray-500 mt-2 max-w-3xl">{description}</p>
            <p className="text-sm text-gray-400 mt-3">
              Need help choosing?{' '}
              <Link to="/contact" className="text-primary-600 font-medium hover:underline">
                Contact us
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <PetCardSkeleton key={i} />
              ))}
            </div>
          ) : pets.length === 0 ? (
            <EmptyState
              title={`No ${name} listed right now`}
              message="Check back soon or browse all pets."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <PetCard key={pet._id} pet={pet} onEnquire={setEnquiryPet} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link to="/pets" className="text-primary-600 font-semibold hover:underline">
              Browse all pets
            </Link>
          </div>
        </div>
      </div>

      {enquiryPet && <EnquiryModal pet={enquiryPet} onClose={() => setEnquiryPet(null)} />}
    </>
  );
};

export default CategoryHub;
