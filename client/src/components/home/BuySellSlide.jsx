import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const paths = [
  {
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

const BuySellSlide = () => (
  <section id="buy-sell" className="relative overflow-hidden py-20 sm:py-28 bg-gray-50 scroll-mt-28 sm:scroll-mt-32">
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 60% 40% at 0% 0%, rgba(251,146,60,0.1), transparent), radial-gradient(ellipse 50% 35% at 100% 100%, rgba(59,130,246,0.06), transparent)',
      }}
    />

    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-primary-600 mb-5"
        >
          Why My Duke Exists
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="font-display text-2xl sm:text-3xl lg:text-[2.35rem] font-bold text-primary-600 leading-snug italic mb-5"
        >
          India&apos;s pet trade runs on trust that mostly doesn&apos;t exist yet.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 text-sm sm:text-base leading-relaxed"
        >
          Unverified sellers, unhealthy litters, and buyers with no way to check any of it — that&apos;s
          the gap My Duke was built to close. One platform, two honest sides: people looking for a
          pet, and people rehoming one responsibly.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {paths.map((path, i) => (
          <motion.article
            key={path.eyebrow}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 + i * 0.08 }}
            className="flex flex-col bg-white border border-gray-100/80 shadow-soft rounded-3xl p-7 sm:p-9"
          >
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-3">
              {path.eyebrow}
            </p>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-primary-600 italic mb-3">
              {path.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">{path.description}</p>

            <ul className="space-y-3 mb-8 flex-1">
              {path.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                    <FiCheck size={12} strokeWidth={3} />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to={path.to}
              className={
                path.primary
                  ? 'inline-flex justify-center items-center btn-gradient text-white font-semibold px-6 py-3.5 rounded-xl shadow-glow text-sm sm:text-base'
                  : 'inline-flex justify-center items-center font-semibold px-6 py-3.5 rounded-xl text-sm sm:text-base text-primary-700 border border-primary-200 bg-primary-50/60 hover:bg-primary-50 transition'
              }
            >
              {path.cta}
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default BuySellSlide;
