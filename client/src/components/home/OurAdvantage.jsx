import { motion } from 'framer-motion';
import { FiActivity, FiArrowUpRight, FiAward, FiHeadphones, FiShield } from 'react-icons/fi';
import { FaDog, FaSyringe } from 'react-icons/fa';

const advantages = [
  {
    icon: FiShield,
    title: 'Health Guarantee',
    description:
      'Every pet is backed by a clear health guarantee so you can welcome them home with confidence.',
    metric: 'Covered',
    tag: 'Trust',
  },
  {
    icon: FaDog,
    title: 'Ethical Breeders',
    description:
      'We partner only with responsible breeders who put animal welfare and temperament first.',
    metric: '',
    tag: 'Welfare',
  },
  {
    icon: FiActivity,
    title: 'Health Checkup',
    description: 'Pets are examined by trusted vets before listing — no surprises when they arrive.',
    metric: 'Vet-led',
    tag: 'Health',
  },
  {
    icon: FiAward,
    title: 'Expert Guidance',
    description:
      'Our pet-care team helps you choose the right companion and settle them in smoothly.',
    metric: '',
    tag: 'Guidance',
  },
  {
    icon: FaSyringe,
    title: 'Vaccinated Pets',
    description: 'Age-appropriate vaccination and deworming records are shared before handover.',
    metric: '100%',
    tag: 'Records',
  },
  {
    icon: FiHeadphones,
    title: 'Best Support',
    description:
      'Friendly support before and after adoption — questions, care tips, and follow-ups included.',
    metric: '24/7',
    tag: 'Support',
  },
];

const OurAdvantage = () => (
  <section className="relative overflow-hidden bg-[#f3f3f3] py-14 sm:py-20 lg:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 sm:mb-12 max-w-2xl"
      >
        <p className="mb-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
          Trusted Care Across Every Step
        </p>
        <h2 className="font-display text-[1.85rem] sm:text-4xl lg:text-5xl font-extrabold leading-[1.1] text-gray-900">
          Our Advantage
        </h2>
      </motion.div>
    </div>

    {/* Mobile / tablet: horizontal snap carousel (Phenomenon-style) */}
    <div className="lg:hidden">
      <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:px-6">
        {advantages.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04 }}
            className="relative flex h-[300px] w-[78%] max-w-[300px] shrink-0 snap-center flex-col overflow-hidden rounded-xl border border-black/[0.06] bg-[#151222] p-5 sm:h-[340px] sm:w-[46%] sm:p-6"
          >
            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white">
              <FiArrowUpRight size={14} />
            </span>

            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl text-primary-300">
              <item.icon />
            </span>
            <h3 className="font-display text-base font-bold text-white pr-8">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/65">{item.description}</p>
            {item.metric ? (
              <p className="mt-auto pt-6 font-display text-3xl font-extrabold text-white">
                {item.metric}
              </p>
            ) : (
              <div className="mt-auto" />
            )}
            <span className="mt-3 inline-flex w-fit rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
              {item.tag}
            </span>
          </motion.article>
        ))}
        <div className="w-1 shrink-0" aria-hidden="true" />
      </div>
    </div>

    {/* Desktop: equal grid tiles with hover overlay */}
    <div className="mx-auto hidden max-w-7xl px-4 sm:px-6 lg:block lg:px-8">
      <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-black/[0.06]">
        {advantages.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className={`group relative flex min-h-[340px] flex-col overflow-hidden bg-white ${
              index % 3 !== 2 ? 'border-r border-black/[0.06]' : ''
            } ${index < 3 ? 'border-b border-black/[0.06]' : ''}`}
          >
            <span className="absolute right-4 top-4 z-20 text-gray-800 transition-colors duration-300 group-hover:text-white">
              <FiArrowUpRight size={18} />
            </span>

            <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center transition-opacity duration-300 group-hover:opacity-0">
              <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-50 text-4xl text-primary-600">
                <item.icon />
              </span>
              <h3 className="font-display text-xl font-bold text-gray-900">{item.title}</h3>
            </div>

            <div className="absolute inset-0 z-10 flex translate-y-3 flex-col bg-[#151222] p-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <h3 className="font-display text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65">{item.description}</p>
              {item.metric ? (
                <p className="mt-auto pt-8 font-display text-4xl font-extrabold text-white">
                  {item.metric}
                </p>
              ) : (
                <div className="mt-auto" />
              )}
              <span className="mt-4 inline-flex w-fit rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                {item.tag}
              </span>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default OurAdvantage;
