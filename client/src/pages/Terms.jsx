import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';

const Terms = () => (
  <>
    <SEO title="Terms & Conditions" description="Read the terms and conditions for using PetNest's pet marketplace platform." />

    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <Breadcrumb items={[{ label: 'Terms & Conditions' }]} />
      <h1 className="font-display text-4xl font-bold text-gray-800 mt-6 mb-8">Terms &amp; Conditions</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-gray-600 leading-relaxed">
        <p>Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">1. Acceptance of Terms</h2>
          <p>
            By using the PetNest website, you agree to be bound by these terms and conditions. If
            you do not agree, please discontinue use of our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">2. Enquiries & Adoption Process</h2>
          <p>
            Submitting an enquiry does not constitute a final purchase or adoption. All adoptions
            are subject to verification, availability confirmation, and mutual agreement between
            the buyer and our team.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">3. Pricing</h2>
          <p>
            All prices listed are subject to change without prior notice. Final pricing will be
            confirmed by our team at the time of enquiry follow-up.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">4. Pet Health Disclaimer</h2>
          <p>
            While we make every effort to verify the health of listed pets, PetNest is not liable
            for any health issues that arise after adoption. We recommend consulting a veterinarian
            promptly after bringing your pet home.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">5. Limitation of Liability</h2>
          <p>
            PetNest acts as a marketplace connecting buyers with breeders/shelters and is not
            responsible for disputes arising from individual transactions.
          </p>
        </section>
      </div>
    </div>
  </>
);

export default Terms;
