import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import ContactSection from '../components/home/ContactSection';

const Contact = () => (
  <>
    <SEO title="Contact Us" description="Get in touch with the PetNest team for any questions about pets, adoption, or partnerships." />

    <div className="bg-gradient-hero pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Breadcrumb items={[{ label: 'Contact' }]} />
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mt-6 mb-4">
          Contact Us
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto">
          Our team is here to help with any questions about adoption, our pets, or your enquiry.
        </p>
      </div>
    </div>

    <ContactSection />
  </>
);

export default Contact;
