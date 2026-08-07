import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import PetCard from '../components/pets/PetCard';
import PetCardSkeleton from '../components/common/PetCardSkeleton';
import EmptyState from '../components/common/EmptyState';
import EnquiryModal from '../components/modals/EnquiryModal';
import { fetchPets } from '../services/petService';
import { SITE_NAME, SITE_URL, SITE_ADDRESS } from '../utils/constants';

const unslug = (slug = '') =>
  String(slug)
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const BreedLanding = () => {
  const { slug } = useParams();
  const breedGuess = useMemo(() => unslug(slug), [slug]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enquiryPet, setEnquiryPet] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Search matches breed/name; then refine client-side by slug
    fetchPets({ search: breedGuess, limit: 50, availability: true })
      .then((res) => {
        if (cancelled) return;
        const all = res.data || [];
        const matched = all.filter((p) => {
          const b = String(p.breed || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          return b === slug || String(p.breed || '').toLowerCase() === breedGuess.toLowerCase();
        });
        setPets(matched.length ? matched : all.slice(0, 12));
      })
      .catch(() => {
        if (!cancelled) setPets([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, breedGuess]);

  const sample = pets[0];
  const breedName = sample?.breed || breedGuess;
  const categoryName = sample?.category?.name || 'Pets';
  const categorySlug = sample?.category?.slug;
  const prices = pets.map((p) => p.price).filter((n) => typeof n === 'number' && n > 0);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  const title = `Buy ${breedName} in India`;
  const description =
    sample?.seoDescription ||
    `Buy ${breedName} pets in India on ${SITE_NAME}. Verified listings with photos, care tips, and support from our team.`;

  const paragraphs = [
    `Looking to buy a ${breedName} in India? ${SITE_NAME} lists verified ${breedName} companions with clear photos, pricing, and health details so you can enquire with confidence.`,
    sample?.temperament
      ? `Temperament: ${sample.temperament}. ${sample.description ? String(sample.description).slice(0, 280) : ''}`
      : `${breedName} pets are popular with Indian families. Browse live listings below or contact us for current availability and delivery options.`,
    minPrice != null
      ? `Typical listed prices for ${breedName} on ${SITE_NAME} currently range from ₹${minPrice.toLocaleString('en-IN')} to ₹${maxPrice.toLocaleString('en-IN')}. Final price depends on age, lineage, and vaccination status.`
      : `Contact ${SITE_NAME} for current ${breedName} pricing and vaccination status.`,
    `We are based at ${SITE_ADDRESS}. Visit our shop, message on WhatsApp, or use the enquiry form on any listing.`,
  ].filter(Boolean);

  const faqs = sample?.faqs?.length
    ? sample.faqs
    : [
        {
          question: `Is the ${breedName} good for Indian homes?`,
          answer: `Many families successfully keep ${breedName} pets in India. Check temperament, space, and climate notes on each listing, and ask our team for advice.`,
        },
        {
          question: `How do I buy a ${breedName} on ${SITE_NAME}?`,
          answer: `Open a listing, review photos and details, then enquire via WhatsApp or the contact form. We help with verification and next steps.`,
        },
      ];

  const careTips = sample?.careTips?.length
    ? sample.careTips
    : [
        {
          title: 'Daily care',
          text: `Provide clean water, balanced food, exercise/enrichment suited to ${breedName}, and regular vet check-ups.`,
        },
      ];

  return (
    <>
      <SEO
        path={`/pets/breed/${slug}`}
        title={title}
        description={description.slice(0, 160)}
        image={sample?.images?.[0]}
        keywords={`buy ${breedName} India, ${breedName} for sale, ${breedName} price India, ${breedName} Gurugram, ${SITE_NAME}`}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Pets', item: `${SITE_URL}/pets` },
              {
                '@type': 'ListItem',
                position: 3,
                name: breedName,
                item: `${SITE_URL}/pets/breed/${slug}`,
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.question || f.title,
              acceptedAnswer: { '@type': 'Answer', text: f.answer || f.text },
            })),
          },
        ]}
      />

      <div className="bg-gray-50 min-h-screen pb-16">
        <div className="bg-white border-b border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb
              items={[
                { label: 'All Pets', to: '/pets' },
                ...(categorySlug
                  ? [{ label: categoryName, to: `/pets/category/${categorySlug}` }]
                  : []),
                { label: breedName },
              ]}
            />
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-800 mt-3">
              Buy {breedName} in India
            </h1>
            <p className="text-gray-500 mt-2 max-w-3xl">{description}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid lg:grid-cols-3 gap-10">
          <article className="lg:col-span-2 space-y-5 text-gray-700 leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            <h2 className="font-display text-xl font-bold text-gray-800 pt-4">Care tips</h2>
            <ul className="space-y-3">
              {careTips.map((tip, i) => (
                <li key={i} className="bg-white rounded-xl p-4 shadow-soft">
                  <h3 className="font-semibold text-gray-800">{tip.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{tip.text}</p>
                </li>
              ))}
            </ul>

            <h2 className="font-display text-xl font-bold text-gray-800 pt-4">FAQs</h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-soft">
                  <h3 className="font-semibold text-gray-800">{f.question || f.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{f.answer || f.text}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 pt-2">
              Related:{' '}
              <Link to="/contact" className="text-primary-600 hover:underline">
                Contact us
              </Link>
              {' · '}
              <Link to="/sell" className="text-primary-600 hover:underline">
                Sell a pet
              </Link>
            </p>
          </article>

          <aside>
            <h2 className="font-display text-lg font-bold text-gray-800 mb-4">
              Live {breedName} listings
            </h2>
            {loading ? (
              <div className="space-y-4">
                <PetCardSkeleton />
                <PetCardSkeleton />
              </div>
            ) : pets.length === 0 ? (
              <EmptyState title="No listings yet" message="Enquire and we will help you find one." />
            ) : (
              <div className="space-y-4">
                {pets.slice(0, 6).map((pet) => (
                  <PetCard key={pet._id} pet={pet} onEnquire={setEnquiryPet} />
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      {enquiryPet && <EnquiryModal pet={enquiryPet} onClose={() => setEnquiryPet(null)} />}
    </>
  );
};

export default BreedLanding;
