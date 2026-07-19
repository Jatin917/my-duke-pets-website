import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import SectionHeading from './SectionHeading';

const testimonials = [
  {
    name: 'Ananya Sharma',
    location: 'Bengaluru',
    avatar: 'https://i.pravatar.cc/100?img=47',
    rating: 5,
    text: 'The entire process was so smooth! Rocky was exactly as described — healthy, vaccinated, and full of energy. The team followed up even after adoption.',
  },
  {
    name: 'Rohan Mehta',
    location: 'Mumbai',
    avatar: 'https://i.pravatar.cc/100?img=12',
    rating: 5,
    text: 'I was nervous about adopting online, but the verification process and detailed pet profiles gave me full confidence. Highly recommend PetNest!',
  },
  {
    name: 'Priya Nair',
    location: 'Chennai',
    avatar: 'https://i.pravatar.cc/100?img=32',
    rating: 4,
    text: 'Our Persian kitten Coco has settled in beautifully. The support team answered every question we had about her diet and care.',
  },
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          eyebrow="Testimonials"
          title="What Our Pet Parents Say"
          description=""
        />
        <div className="text-center -mt-16 mb-8">
          <p className="text-white/70 max-w-lg mx-auto">
            Real stories from families who found their new best friends through us.
          </p>
        </div>

        <div className="relative min-h-[280px] sm:min-h-[240px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="glass rounded-3xl p-8 sm:p-10 text-center"
            >
              <FaQuoteLeft className="text-primary-400 text-3xl mx-auto mb-4" />
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
                {testimonials[index].text}
              </p>
              <div className="flex items-center justify-center gap-3">
                <img
                  src={testimonials[index].avatar}
                  alt={testimonials[index].name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary-400"
                />
                <div className="text-left">
                  <p className="font-semibold text-gray-800">{testimonials[index].name}</p>
                  <p className="text-xs text-gray-500">{testimonials[index].location}</p>
                </div>
              </div>
              <div className="flex justify-center gap-1 mt-3 text-primary-500">
                {Array.from({ length: testimonials[index].rating }).map((_, i) => (
                  <FaStar key={i} size={14} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <FiChevronLeft />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-8 bg-primary-500' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
