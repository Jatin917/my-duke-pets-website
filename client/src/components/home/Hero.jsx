import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';

const stats = [
  { value: '2,500+', label: 'Happy Pets' },
  { value: '4,800+', label: 'Happy Families' },
  { value: '15+', label: 'Cities Covered' },
];

const Hero = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query ? `/pets?search=${encodeURIComponent(query)}` : '/pets');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-500 rounded-full blur-3xl" />
      </div>

      <motion.div
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden lg:block absolute top-32 right-16 text-6xl opacity-80"
      >
        🐶
      </motion.div>
      <motion.div
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="hidden lg:block absolute bottom-24 left-16 text-5xl opacity-80"
      >
        🐱
      </motion.div>
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="hidden lg:block absolute top-1/2 left-1/4 text-4xl opacity-70"
      >
        🦜
      </motion.div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block bg-white/10 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20"
        >
          🐾 Trusted by 4,800+ pet parents across India
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6"
        >
          Find Your Perfect <span className="text-gradient bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">Furry Friend</span> Today
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-10"
        >
          Browse verified, healthy & vaccinated pets from trusted breeders. Dogs, cats, birds,
          rabbits and more — your new best friend is just a click away.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSearch}
          className="max-w-xl mx-auto flex glass rounded-full p-2 shadow-2xl"
        >
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search by name, breed or category..."
              className="w-full h-full pl-11 pr-3 py-2.5 bg-transparent focus:outline-none text-gray-800 placeholder:text-gray-500 text-sm sm:text-base"
            />
          </div>
          <button
            type="submit"
            className="btn-gradient text-white font-semibold px-6 sm:px-8 py-2.5 rounded-full shrink-0"
          >
            Search
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto mt-14"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-display font-bold text-white">{stat.value}</p>
              <p className="text-xs sm:text-sm text-white/70 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
