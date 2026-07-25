import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';

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
    description: 'Breed-specific feeding, training, and grooming guidance for new pet parents.',
  },
  {
    num: '06',
    title: 'Adoption Assistance',
    description:
      'Rehoming support for owners who can no longer keep a pet — matched responsibly, never rushed.',
  },
];

const ServicesSlide = () => (
  <section className="relative overflow-hidden py-12 sm:py-20 lg:py-28 bg-white">
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          'linear-gradient(180deg, #ffffff 0%, #fffaf6 45%, #ffffff 100%), radial-gradient(ellipse 45% 35% at 100% 15%, rgba(251,146,60,0.1), transparent)',
      }}
    />

    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 sm:gap-10 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-32">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-3 sm:mb-6"
          >
            <span className="h-px w-8 sm:w-10 bg-primary-500" />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.28em] uppercase text-primary-600">
              What We Handle
            </span>
            <span className="ml-auto lg:hidden font-display text-sm font-extrabold text-primary-600">
              06
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="font-display text-xl sm:text-4xl font-extrabold text-gray-900 leading-snug sm:leading-[1.18] mb-2.5 sm:mb-5"
          >
            Everything between{' '}
            <span className="text-primary-600 italic">&lsquo;I want a pet&rsquo;</span> and{' '}
            <span className="text-primary-600 italic">&lsquo;welcome home.&rsquo;</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-xs sm:text-base leading-relaxed"
          >
            Buying or selling a pet is more than one transaction. My Duke supports the whole journey
            — before, during, and after.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="mt-8 hidden lg:inline-flex items-baseline gap-3 rounded-2xl bg-white shadow-soft border border-primary-100/70 px-5 py-4"
          >
            <span className="font-display text-3xl font-extrabold text-primary-600">06</span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Services
              <br />
              End To End
            </span>
          </motion.div>
        </div>

        {/* Mobile / tablet: compact 2-col grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:hidden">
          {services.map((service, index) => (
            <motion.article
              key={service.num}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl border border-primary-100/80 bg-white p-3 sm:p-4"
            >
              <span className="font-display text-sm font-extrabold text-primary-500 tabular-nums">
                {service.num}
              </span>
              <h3 className="font-display text-[13px] sm:text-sm font-bold text-gray-900 mt-1 leading-snug">
                {service.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 leading-snug mt-1.5">
                {service.description}
              </p>
            </motion.article>
          ))}
        </div>

        {/* Desktop: editorial list */}
        <ol className="hidden lg:block border-t border-gray-200/80">
          {services.map((service, index) => (
            <motion.li
              key={service.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative border-b border-gray-200/80"
            >
              <span className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-primary-50 via-primary-50/60 to-transparent transition-transform duration-500 ease-out group-hover:scale-x-100" />

              <div className="relative flex items-start gap-7 px-4 py-7">
                <span className="font-display text-2xl font-extrabold tabular-nums leading-none pt-1 text-primary-500/70 transition-colors duration-300 group-hover:text-primary-600">
                  {service.num}
                </span>

                <div className="min-w-0 flex-1 transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-1.5">
                    {service.title}
                  </h3>
                  <p className="text-[15px] text-gray-500 leading-relaxed">{service.description}</p>
                </div>

                <FiArrowUpRight className="mt-1 shrink-0 text-xl text-primary-500 opacity-0 transition-all duration-300 group-hover:opacity-100" />
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  </section>
);

export default ServicesSlide;
