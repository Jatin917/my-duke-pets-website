import { motion } from 'framer-motion';
import { FiShield, FiTruck, FiHeart, FiHeadphones } from 'react-icons/fi';

const features = [
  {
    num: '01',
    icon: FiShield,
    title: 'Verified & Healthy',
    description:
      'Every pet is health-checked, vaccinated and verified before listing — paperwork included, never promised later.',
    span: 'lg:col-span-2',
    dark: true,
  },
  {
    num: '02',
    icon: FiHeart,
    title: 'Ethical Sourcing',
    description:
      'We partner only with responsible breeders & shelters who prioritize animal welfare.',
    span: '',
  },
  {
    num: '03',
    icon: FiTruck,
    title: 'Safe Delivery',
    description: 'Secure, comfortable transport options available across major cities.',
    span: '',
  },
  {
    num: '04',
    icon: FiHeadphones,
    title: '24/7 Support',
    description:
      'Our pet care experts are always available to guide you before & after adoption — from first question to homecoming day.',
    span: 'lg:col-span-2',
  },
];

const WhyChooseUs = () => (
  <section className="relative overflow-hidden py-20 sm:py-28 bg-white">
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 50% 40% at 0% 10%, rgba(251,146,60,0.09), transparent)',
      }}
    />

    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mb-12 sm:mb-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="h-px w-10 bg-primary-500" />
          <span className="text-[11px] sm:text-xs font-bold tracking-[0.28em] uppercase text-primary-600">
            Why Choose Us
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="font-display text-[1.75rem] sm:text-4xl font-extrabold text-gray-900 leading-[1.18] mb-4"
        >
          A <span className="text-primary-600 italic">trustworthy</span> way to find your pet.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 text-sm sm:text-base leading-relaxed"
        >
          We make pet adoption simple, safe, and transparent — from browsing to bringing them home.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {features.map((feature, index) => (
          <motion.article
            key={feature.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.07 }}
            className={`group relative overflow-hidden rounded-3xl p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 ${
              feature.span
            } ${
              feature.dark
                ? 'bg-[#151222] text-white'
                : 'bg-white border border-gray-100 shadow-soft hover:border-primary-200 hover:shadow-glow'
            }`}
          >
            {feature.dark && (
              <span
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(234,88,12,0.28), transparent)',
                }}
              />
            )}

            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-transform duration-300 group-hover:scale-105 ${
                    feature.dark
                      ? 'bg-white/10 text-primary-300'
                      : 'bg-gradient-primary text-white shadow-glow'
                  }`}
                >
                  <feature.icon />
                </span>
                <span
                  className={`font-display text-2xl font-extrabold ${
                    feature.dark ? 'text-white/15' : 'text-gray-200'
                  }`}
                >
                  {feature.num}
                </span>
              </div>

              <h3
                className={`font-display text-xl font-bold mb-2 ${
                  feature.dark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {feature.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  feature.dark ? 'text-white/65' : 'text-gray-500'
                }`}
              >
                {feature.description}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
