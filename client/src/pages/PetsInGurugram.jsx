import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import PetsShowcaseSection from '../components/home/PetsShowcaseSection';
import EnquiryModal from '../components/modals/EnquiryModal';
import { fetchPets } from '../services/petService';
import {
  SITE_NAME,
  SITE_ADDRESS,
  SITE_URL,
  PHONE_NUMBER,
  WHATSAPP_LINK,
  FACEBOOK_URL,
  INSTAGRAM_URL,
} from '../utils/constants';

const PetsInGurugram = () => {
  const [enquiryPet, setEnquiryPet] = useState(null);
  const fetcher = useCallback(() => fetchPets({ limit: 12, sort: 'newest', availability: true }), []);

  const title = 'Pets for Sale in Gurugram & Delhi-NCR';
  const description = `Buy verified dogs, cats, birds and more in Gurugram (Gurgaon) and Delhi-NCR at ${SITE_NAME}. Visit us at ${SITE_ADDRESS}.`;

  return (
    <>
      <SEO
        path="/pets-in-gurugram"
        title={title}
        description={description}
        keywords="pets for sale Gurgaon, buy puppy Gurugram, pet shop Gurgaon, dogs for sale Delhi NCR, birds for sale Gurugram, My Duke pets"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: SITE_NAME,
          description,
          url: `${SITE_URL}/pets-in-gurugram`,
          telephone: PHONE_NUMBER,
          address: {
            '@type': 'PostalAddress',
            streetAddress: SITE_ADDRESS,
            addressLocality: 'Gurugram',
            addressRegion: 'Haryana',
            addressCountry: 'IN',
          },
          areaServed: ['Gurugram', 'Gurgaon', 'Delhi', 'Delhi NCR', 'India'],
        }}
      />

      <div className="bg-gray-50 min-h-screen pb-8">
        <div className="bg-white border-b border-gray-100 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={[{ label: 'Pets in Gurugram' }]} />
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-800 mt-3">
              Pets for Sale in Gurugram
            </h1>
            <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">{description}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <a
                href={WHATSAPP_LINK('Hello My Duke, I want pets available in Gurugram.')}
                className="btn-gradient text-white font-semibold px-5 py-2.5 rounded-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp us
              </a>
              <Link
                to="/contact"
                className="bg-white border border-gray-200 text-gray-800 font-semibold px-5 py-2.5 rounded-full hover:border-primary-300"
              >
                Visit / contact
              </Link>
              <Link to="/pets" className="text-primary-600 font-semibold px-3 py-2.5 hover:underline">
                Browse all pets
              </Link>
            </div>
          </div>
        </div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose-like">
          <h2 className="font-display text-2xl font-bold text-gray-800">Why buy from My Duke in Gurgaon?</h2>
          <ul className="mt-4 space-y-2 text-gray-600 list-disc pl-5">
            <li>Verified listings with clear photos and health details</li>
            <li>Local showroom support at Sector 17C, Sukhrali, Gurugram</li>
            <li>Help with enquiries for dogs, cats, birds and more across Delhi-NCR</li>
            <li>Guidance on vaccination, rehoming, and responsible pet parenting</li>
          </ul>
          <p className="mt-4 text-gray-600">
            Address: <strong>{SITE_ADDRESS}</strong>. Call{' '}
            <a href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`} className="text-primary-600 font-medium">
              {PHONE_NUMBER}
            </a>
            .
          </p>
        </section>

        <PetsShowcaseSection
          eyebrow="Gurugram picks"
          title="Pets available now"
          description="Enquire on any listing — we will confirm availability for Gurugram / Delhi-NCR."
          fetcher={fetcher}
          onEnquire={setEnquiryPet}
          bgClass="bg-white"
        />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-gray-500">
          Follow us on{' '}
          <a href={INSTAGRAM_URL} className="text-primary-600 hover:underline" target="_blank" rel="noreferrer">
            Instagram
          </a>{' '}
          and{' '}
          <a href={FACEBOOK_URL} className="text-primary-600 hover:underline" target="_blank" rel="noreferrer">
            Facebook
          </a>{' '}
          for new arrivals.
        </section>
      </div>

      {enquiryPet && <EnquiryModal pet={enquiryPet} onClose={() => setEnquiryPet(null)} />}
    </>
  );
};

export default PetsInGurugram;
