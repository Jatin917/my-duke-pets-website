import { motion } from 'framer-motion';
import {
  FiArrowUpRight,
  FiClipboard,
  FiHeart,
  FiHome,
  FiShield,
  FiTruck,
  FiUserCheck,
} from 'react-icons/fi';

const services = [
  {
    num: '01',
    icon: FiShield,
    title: 'Verified Listings',
    description:
      'Every seller and pet profile is checked before it goes live — no fake photos, no ghost listings.',
  },
  {
    num: '02',
    icon: FiClipboard,
    title: 'Health & Vaccination Checks',
    description:
      "Vaccination schedules and vet records are verified so you know exactly what you're bringing home.",
  },
  {
    num: '03',
    icon: FiTruck,
    title: 'Pickup & Delivery Support',
    description:
      'Assistance with safe transport and handover, including inter-city moves for the right buyer.',
  },
  {
    num: '04',
    icon: FiHeart,
    title: 'Post-Purchase Vet Guidance',
    description:
      'Access to vet consultation support in the first few weeks after your pet comes home.',
  },
  {
    num: '05',
    icon: FiHome,
    title: 'Pet Care Guidance',
    description: 'Breed-specific feeding, training, and grooming guidance for new pet parents.',
  },
  {
    num: '06',
    icon: FiUserCheck,
    title: 'Adoption Assistance',
    description:
      'Rehoming support for owners who can no longer keep a pet — matched responsibly, never rushed.',
  },
];

const ServicesSlide = () => (
  <section className="relative overflow-hidden bg-[#f4f4f4] py-14 sm:py-20 lg:py-24">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl"
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400 sm:mb-3 sm:text-[11px]">
            What We Handle
          </p>
          <h2 className="font-display text-xl font-extrabold leading-[1.15] text-gray-900 sm:text-4xl">
            Everything between{' '}
            <span className="text-primary-600 italic">&lsquo;I want a pet&rsquo;</span> and{' '}
            <span className="text-primary-600 italic">&lsquo;welcome home.&rsquo;</span>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="hidden max-w-sm text-sm leading-relaxed text-gray-500 sm:block sm:text-right sm:text-[15px]"
        >
          Buying or selling a pet is more than one transaction. My Duke supports the whole journey —
          before, during, and after.
        </motion.p>
      </div>

      <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-black/[0.06] sm:rounded-2xl">
        <div className="grid grid-cols-2 gap-px lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.article
              key={service.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="group relative flex flex-col bg-white p-3.5 sm:min-h-[190px] sm:p-7"
            >
              <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-4 sm:items-start">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-base text-primary-600 transition-colors duration-300 group-hover:bg-gradient-primary group-hover:text-white sm:h-11 sm:w-11 sm:rounded-xl sm:text-xl">
                  <service.icon />
                </span>
                <span className="font-display text-lg font-extrabold tabular-nums leading-none text-gray-200 transition-colors duration-300 group-hover:text-primary-200 sm:text-3xl">
                  {service.num}
                </span>
              </div>

              <h3 className="font-display text-[13px] font-bold leading-snug text-gray-900 sm:text-lg">
                {service.title}
              </h3>
              <p className="mt-1 text-[11px] leading-snug text-gray-500 sm:mt-2 sm:flex-1 sm:text-sm sm:leading-relaxed">
                {service.description}
              </p>

              <span className="mt-4 hidden items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-600 opacity-0 transition-all duration-300 group-hover:opacity-100 sm:mt-5 sm:inline-flex">
                Covered end to end
                <FiArrowUpRight className="text-sm" />
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default ServicesSlide;
