import { motion } from 'framer-motion';
import { FiHeart, FiUsers, FiAward, FiShield } from 'react-icons/fi';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import WhyChooseUs from '../components/home/WhyChooseUs';

const stats = [
  { icon: FiHeart, value: '2,500+', label: 'Pets Rehomed' },
  { icon: FiUsers, value: '4,800+', label: 'Happy Families' },
  { icon: FiAward, value: '15+', label: 'Cities Served' },
  { icon: FiShield, value: '100%', label: 'Verified Listings' },
];

const About = () => (
  <>
    <SEO title="About Us" description="Learn about PetNest's mission to connect loving families with healthy, happy pets." />

    <div className="bg-gradient-hero pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Breadcrumb items={[{ label: 'About Us' }]} />
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mt-6 mb-4">
          About PetNest
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto">
          We're on a mission to make pet adoption safe, transparent, and joyful — connecting
          responsible breeders and shelters with loving families across India.
        </p>
      </div>
    </div>

    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <img
            src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=900&q=80"
            alt="Happy pets"
            className="rounded-3xl shadow-soft w-full h-[380px] object-cover"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="inline-block text-primary-600 bg-primary-50 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
            Our Story
          </span>
          <h2 className="font-display text-3xl font-bold text-gray-800 mb-4">
            Built By Pet Lovers, For Pet Lovers
          </h2>
          <p className="text-gray-500 leading-relaxed mb-4">
            PetNest was founded with a simple idea — finding a pet should be joyful, not stressful.
            We carefully vet every breeder and shelter partner, verify health records, and guide
            every family through the adoption journey from first click to homecoming day.
          </p>
          <p className="text-gray-500 leading-relaxed">
            Today, thousands of families trust us to help them find their next best friend —
            healthy, happy, and ready for a loving home.
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center p-6 rounded-2xl bg-gray-50">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary text-white flex items-center justify-center text-2xl mx-auto mb-3">
              <stat.icon />
            </div>
            <p className="text-2xl font-display font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>

    <WhyChooseUs />
  </>
);

export default About;
