import { useCallback, useState } from 'react';
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
        description="Buy dogs, cats, birds, rabbits, fish & exotic pets online in India. My Duke lists only healthy, vaccinated pets from verified sellers — find your companion or rehome responsibly."
        keywords="buy pets online India, sell pets India, verified dogs for sale, cats for sale, puppies India, kittens India, adopt pets, rehome pets, My Duke pet marketplace"
      />
      <Hero />
      <StatementSlide />
      <BuySellSlide />
      <ServicesSlide />
      <CategoriesSection />
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
