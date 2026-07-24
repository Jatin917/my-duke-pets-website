import { motion } from 'framer-motion';

const services = [
  {
    num: '01',
    title: 'Verified Listings',
    description:
      'Every seller and pet profile is checked before it goes live — no fake photos, no ghost listings.',
  },
  {
    num: '02',
    title: 'Health & Vaccination Checks',
    description:
      "Vaccination schedules and vet records are verified so you know exactly what you're bringing home.",
  },
  {
    num: '03',
    title: 'Pickup & Delivery Support',
    description:
      'Assistance with safe transport and handover, including inter-city moves for the right buyer.',
  },
  {
    num: '04',
    title: 'Post-Purchase Vet Guidance',
    description:
      'Access to vet consultation support in the first few weeks after your pet comes home.',
  },
  {
    num: '05',
    title: 'Pet Care Guidance',
    description:
      'Breed-specific feeding, training, and grooming guidance for new pet parents.',
  },
  {
    num: '06',
    title: 'Adoption Assistance',
    description:
      'Rehoming support for owners who can no longer keep a pet — matched responsibly, never rushed.',
  },
];

const ServicesSlide = () => (
  <section className="relative overflow-hidden py-20 sm:py-28 bg-white">
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          'linear-gradient(180deg, #ffffff 0%, #fffaf6 40%, #ffffff 100%), radial-gradient(ellipse 50% 40% at 100% 20%, rgba(251,146,60,0.08), transparent)',
      }}
    />

    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-12 sm:mb-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-primary-600 mb-5"
        >
          What We Handle
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="font-display text-2xl sm:text-3xl lg:text-[2.35rem] font-bold text-primary-600 leading-snug italic mb-5"
        >
          Everything between &lsquo;I want a pet&rsquo; and &lsquo;welcome home.&rsquo;
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 text-sm sm:text-base leading-relaxed"
        >
          Buying or selling a pet is more than one transaction. My Duke supports the whole journey —
          before, during, and after.
        </motion.p>
      </div>

      <ol className="divide-y divide-gray-100 border-t border-b border-gray-100">
        {services.map((service, i) => (
          <motion.li
            key={service.num}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06 + i * 0.05 }}
            className="grid grid-cols-[3.25rem_1fr] sm:grid-cols-[4.5rem_1fr] gap-3 sm:gap-6 py-6 sm:py-7"
          >
            <span className="font-display text-xl sm:text-2xl font-extrabold text-primary-500 tabular-nums leading-none pt-0.5">
              {service.num}
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-1.5">
                {service.title}
              </h3>
              <p className="text-sm sm:text-[15px] text-gray-500 leading-relaxed">
                {service.description}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  </section>
);

export default ServicesSlide;
