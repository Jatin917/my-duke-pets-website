import { motion } from 'framer-motion';
import KeywordMarquee from './KeywordMarquee';

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

      <KeywordMarquee items={keywords} dark />
    </div>
  </section>
);

export default BuySellSlide;
