import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import Hero from '../components/home/Hero';
import StatementSlide from '../components/home/StatementSlide';
import BuySellSlide from '../components/home/BuySellSlide';
import ServicesSlide from '../components/home/ServicesSlide';
import CategoriesSection from '../components/home/CategoriesSection';
import PetsShowcaseSection from '../components/home/PetsShowcaseSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import OurAdvantage from '../components/home/OurAdvantage';
import Testimonials from '../components/home/Testimonials';
import FAQSection from '../components/home/FAQSection';
import EnquiryModal from '../components/modals/EnquiryModal';
import { fetchFeaturedPets } from '../services/petService';

const Home = () => {
  const [enquiryPet, setEnquiryPet] = useState(null);

  const featuredFetcher = useCallback(() => fetchFeaturedPets(), []);

  return (
    <>
      <SEO
        path="/"
        title="Buy & Sell Verified Pets in India"
        description="Buy dogs, cats, birds, rabbits, fish & exotic pets online in India. My Duke lists only healthy, vaccinated pets from verified sellers — find your companion or rehome responsibly. Pet shop in Gurugram / Delhi-NCR."
        keywords="buy pets online India, sell pets India, verified dogs for sale, cats for sale, puppies India, kittens India, adopt pets, rehome pets, My Duke pet marketplace, pet shop Gurgaon"
      />
      <Hero />
      <StatementSlide />
      <BuySellSlide />
      <ServicesSlide />
      <CategoriesSection />
      <section className="bg-white py-8 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-800">Serving Gurugram &amp; Delhi-NCR</h2>
            <p className="text-sm text-gray-500 mt-1">
              Visit our Sukhrali, Sector 17C location or enquire for pan-India delivery.
            </p>
          </div>
          <Link
            to="/pets-in-gurugram"
            className="inline-flex items-center justify-center btn-gradient text-white font-semibold px-5 py-2.5 rounded-full shrink-0"
          >
            Pets in Gurugram
          </Link>
        </div>
      </section>
      <PetsShowcaseSection
        eyebrow="Featured Pets"
        title="Our Featured Companions"
        description="Hand-picked pets loved by our community."
        fetcher={featuredFetcher}
        onEnquire={setEnquiryPet}
        bgClass="bg-gray-50"
      />
      <WhyChooseUs />
      <OurAdvantage />
      <Testimonials />
      <FAQSection />

      {enquiryPet && <EnquiryModal pet={enquiryPet} onClose={() => setEnquiryPet(null)} />}
    </>
  );
};

export default Home;
