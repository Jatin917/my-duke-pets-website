import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiCheck } from 'react-icons/fi';
import KeywordMarquee from './KeywordMarquee';

const paths = [
  {
    num: '01',
    eyebrow: 'For Buyers',
    title: 'Buy with Confidence',
    description:
      'Browse verified dogs, cats, birds, rabbits, fish, and exotic pets — every listing backed by health and vaccination records, not just photos.',
    features: [
      'Vaccination & health certificates on every listing',
      'Verified seller badge before you message',
      'Breed, age, and location filters that actually help',
      'Direct chat with sellers — no middlemen',
    ],
    cta: 'Browse Pets',
    to: '/pets',
    primary: true,
  },
  {
    num: '02',
    eyebrow: 'For Sellers',
    title: 'Sell & Rehome Responsibly',
    description:
      'List a litter or rehome a pet to genuine buyers — people who are actually looking, not just scrolling. Reach the right home, faster.',
    features: [
      'Free listing with photo & video support',
      'Buyer enquiries pre-checked for intent',
      'Guidance on fair, ethical pricing',
      'Support until the pet reaches its new home',
    ],
    cta: 'List Your Pet',
    to: '/sell',
    primary: false,
  },
];

const keywords = [
  'Verified Sellers',
  'Health Records',
  'No Middlemen',
  'Ethical Breeders',
  'Real Buyers',
  'Safe Handover',
];

const BuySellSlide = () => (
  <section
    id="buy-sell"
    className="relative overflow-hidden bg-[#151222] py-20 sm:py-28 scroll-mt-28 sm:scroll-mt-32"
  >
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 70% 50% at 12% 0%, rgba(234,88,12,0.22), transparent), radial-gradient(ellipse 55% 45% at 95% 100%, rgba(30,58,138,0.28), transparent)',
      }}
    />

    <div className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-14 items-end mb-12 sm:mb-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="h-px w-10 bg-primary-400" />
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.28em] uppercase text-primary-400">
                Why My Duke Exists
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="font-display text-[1.75rem] sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-[1.15]"
            >
              India&apos;s pet trade runs on{' '}
              <span className="text-primary-400 italic">trust</span> that mostly doesn&apos;t exist
              yet.
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="lg:border-l lg:border-white/10 lg:pl-10"
          >
            <p className="text-white/65 text-sm sm:text-base leading-relaxed">
              Unverified sellers, unhealthy litters, and buyers with no way to check any of it —
              that&apos;s the gap My Duke was built to close. One platform, two honest sides: people
              looking for a pet, and people rehoming one responsibly.
            </p>
          </motion.div>
        </div>
      </div>

      <KeywordMarquee items={keywords} dark className="mb-12 sm:mb-16" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          {paths.map((path, index) => (
            <motion.article
              key={path.eyebrow}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-7 sm:p-9 transition-colors duration-300 hover:border-primary-400/45"
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(251,146,60,0.14), transparent)',
                }}
              />
              <span className="pointer-events-none absolute -right-2 top-2 font-display text-[5.5rem] font-extrabold leading-none text-white/[0.05] transition-colors duration-300 group-hover:text-primary-400/15">
                {path.num}
              </span>

              <div className="relative flex flex-col flex-1">
                <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/45 mb-3">
                  {path.eyebrow}
                </p>
                <h3 className="font-display text-2xl sm:text-[1.75rem] font-extrabold text-white mb-3.5">
                  {path.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-7">{path.description}</p>

                <ul className="space-y-3.5 mb-9 flex-1">
                  {path.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-white/80">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-300">
                        <FiCheck size={12} strokeWidth={3} />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={path.to}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm sm:text-base font-semibold transition ${
                    path.primary
                      ? 'btn-gradient text-white shadow-glow'
                      : 'border border-white/25 text-white hover:bg-white/10'
                  }`}
                >
                  {path.cta}
                  <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default BuySellSlide;
