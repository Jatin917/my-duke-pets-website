import { motion } from 'framer-motion';

const stats = [
  { value: '12,000+', label: 'Pets Rehomed' },
  { value: '4,800+', label: 'Verified Sellers' },
  { value: '60+', label: 'Cities Covered' },
  { value: '9', label: 'Species Categories' },
];

const StatementSlide = () => (
  <section className="relative overflow-hidden py-20 sm:py-28 bg-white">
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 70% 55% at 50% -10%, rgba(251,146,60,0.14), transparent), linear-gradient(180deg, #fffaf6 0%, #ffffff 55%, #fff7ed 100%)',
      }}
    />

    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-primary-600 mb-6"
      >
        Our Belief
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.06 }}
        className="font-display text-2xl sm:text-3xl lg:text-[2.5rem] font-bold text-primary-600 leading-snug italic mb-7"
      >
        A pet is not a purchase. It&apos;s a promise that outlives the sale.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.12 }}
        className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-14 sm:mb-16"
      >
        My Duke was built on one idea — that buying, selling, or rehoming a pet should carry the
        same care as owning one. We stand between impulse and regret, verifying every seller,
        checking every health record, and staying with you long after the listing closes.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.18 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.06 }}
            className="min-w-0"
          >
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default StatementSlide;
