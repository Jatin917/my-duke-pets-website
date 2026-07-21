import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';

const Privacy = () => (
  <>
    <SEO title="Privacy Policy" description="Read PetNest's privacy policy to understand how we collect, use, and protect your data." />

    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <Breadcrumb items={[{ label: 'Privacy Policy' }]} />
      <h1 className="font-display text-4xl font-bold text-gray-800 mt-6 mb-8">Privacy Policy</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-gray-600 leading-relaxed">
        <p>Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">1. Information We Collect</h2>
          <p>
            When you submit an enquiry, we collect your name, phone number, email address, city,
            state, and address to help our team connect with you regarding your pet enquiry.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">2. How We Use Your Information</h2>
          <p>
            We use your information solely to process your enquiry, contact you about pet
            availability, and improve our services. We do not sell your personal data to third
            parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">3. Data Security</h2>
          <p>
            We implement industry-standard security measures including encryption, secure
            authentication, and access controls to protect your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">4. Cookies</h2>
          <p>
            We use local storage to remember your compare list preferences. We do not use tracking
            cookies for advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">5. Contact Us</h2>
          <p>
            For any privacy-related questions, please reach out to us at hello@petnest.com.
          </p>
        </section>
      </div>
    </div>
  </>
);

export default Privacy;
