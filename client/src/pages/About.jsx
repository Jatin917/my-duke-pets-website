import { motion } from 'framer-motion';
import { FiCheckCircle, FiShield } from 'react-icons/fi';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import { SITE_NAME } from '../utils/constants';

const values = [
  {
    num: '01',
    title: 'Verification First',
    description:
      "Every seller is checked before they can list. Every pet's health record is confirmed before it's shown to a buyer.",
  },
  {
    num: '02',
    title: 'No Impulse Sales',
    description:
      "We design the journey to slow buyers down just enough to make a decision they won't regret.",
  },
  {
    num: '03',
    title: 'Honest Pricing',
    description:
      'We guide sellers toward fair, ethical pricing instead of what the market will bear.',
  },
  {
    num: '04',
    title: 'Support That Continues',
    description:
      "Our involvement doesn't end at the sale — vet guidance and care support continue after handover.",
  },
];

const About = () => (
  <>
    <SEO
      title="About Us"
      description={`Who we are, our core values, and the story behind ${SITE_NAME}.`}
    />

    <div className="bg-gradient-hero pt-28 pb-16 sm:pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Breadcrumb items={[{ label: 'About Us' }]} />
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mt-6 mb-4">
          About Us
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto">
          Who we are, our core values, and the story behind {SITE_NAME}.
        </p>
      </div>
    </div>

    <section className="relative overflow-hidden py-20 sm:py-28 bg-[#fffaf6]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 55% 45% at 100% 0%, rgba(251,146,60,0.12), transparent), radial-gradient(ellipse 45% 35% at 0% 100%, rgba(59,130,246,0.05), transparent)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12 sm:mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-primary-600 mb-5"
          >
            Who We Are
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="font-display text-2xl sm:text-3xl lg:text-[2.35rem] font-bold text-primary-600 leading-snug italic mb-5"
          >
            We didn&apos;t set out to build a marketplace. We set out to close a trust gap.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-sm sm:text-base leading-relaxed"
          >
            My Duke is India&apos;s pet buy &amp; sell platform — built for the people on both ends of
            a pet&apos;s next chapter: the family looking for the right companion, and the seller who
            wants that companion to land somewhere good.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-gray-100 shadow-soft p-7 sm:p-9"
          >
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-gray-900 mb-7">
              Our Values
            </p>
            <ol className="space-y-6">
              {values.map((value) => (
                <li key={value.num} className="grid grid-cols-[2rem_1fr] gap-3">
                  <span className="font-display text-sm font-extrabold text-primary-600">
                    {value.num}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-gray-900 mb-1">
                      {value.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="space-y-6"
          >
            <div className="p-1 sm:p-3">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-gray-900 mb-4">
                Our Story
              </p>
              <h3 className="font-display text-xl sm:text-2xl font-bold italic text-primary-600 mb-4">
                Started because a good home shouldn&apos;t depend on luck.
              </h3>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  My Duke began with a simple, frustrating observation — anyone looking to buy or
                  rehome a pet in India was stuck choosing between word-of-mouth, unmoderated groups,
                  and listings with no way to check if anything claimed was true.
                </p>
                <p>
                  We built My Duke to be the layer of accountability that was missing — verifying
                  sellers, checking health records, and giving both sides of a pet transaction a
                  reason to trust the process.
                </p>
                <p>
                  Today, that same principle guides every part of the platform: a pet&apos;s wellbeing
                  comes before a completed sale.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-900 text-white p-6 sm:p-7">
              <div className="flex items-start gap-3">
                <FiShield className="text-primary-400 text-2xl shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/55 mb-2">
                    Our Promise
                  </p>
                  <h3 className="font-display text-lg font-bold mb-2">Every listing, checked twice.</h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Once by our verification team, once by the seller&apos;s vaccination and health
                    paperwork. If either is missing, the listing doesn&apos;t go live.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs sm:text-sm font-semibold tracking-wide text-gray-600"
        >
          {['Founded — India', 'Pet-first by design', 'Vet-advised'].map((item) => (
            <span key={item} className="inline-flex items-center gap-2">
              <FiCheckCircle className="text-primary-600" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  </>
);

export default About;
