import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaStar, FaQuoteLeft, FaPaw } from 'react-icons/fa';
import { SITE_NAME } from '../../utils/constants';

const testimonials = [
  {
    name: 'Ananya Sharma',
    location: 'Bengaluru',
    pet: 'Indie pup · Rocky',
    avatar: 'https://i.pravatar.cc/100?img=47',
    rating: 5,
    text: `The listing photos matched Rocky exactly — healthy, vaccinated, and full of energy. ${SITE_NAME} followed up after we brought him home, which made the whole process feel trustworthy.`,
  },
  {
    name: 'Rohan Mehta',
    location: 'Mumbai',
    pet: 'Beagle · Bruno',
    avatar: 'https://i.pravatar.cc/100?img=12',
    rating: 5,
    text: `I was hesitant to buy a pup online, but verified seller details and clear health records on ${SITE_NAME} gave me confidence. Bruno settled in within days.`,
  },
  {
    name: 'Priya Nair',
    location: 'Chennai',
    pet: 'Persian kitten · Coco',
    avatar: 'https://i.pravatar.cc/100?img=32',
    rating: 5,
    text: 'Coco arrived with her vaccination card and diet notes. The team answered every question about litter training and food — patient, clear, and kind.',
  },
  {
    name: 'Vikram Singh',
    location: 'Jaipur',
    pet: 'Lab mix · Moti',
    avatar: 'https://i.pravatar.cc/100?img=68',
    rating: 5,
    text: `Rehoming Moti through ${SITE_NAME} felt responsible. Screening was thorough, and we met a family who clearly wanted him for life — not impulse.`,
  },
  {
    name: 'Sneha Reddy',
    location: 'Hyderabad',
    pet: 'Budgies · Mira & Kiwi',
    avatar: 'https://i.pravatar.cc/100?img=25',
    rating: 5,
    text: 'Found a healthy pair with proper cage setup advice included. Communication was fast on WhatsApp, and delivery between cities was smoother than expected.',
  },
  {
    name: 'Arjun Kapoor',
    location: 'Pune',
    pet: 'Golden Retriever · Leo',
    avatar: 'https://i.pravatar.cc/100?img=15',
    rating: 5,
    text: `Leo’s profile had temperament notes and vet history upfront. No surprises, no middlemen — just a genuine handover. Grateful we chose ${SITE_NAME}.`,
  },
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 6500);
    return () => clearInterval(id);
  }, []);

  const current = testimonials[index];

  return (
    <section className="relative overflow-hidden py-20 sm:py-24 bg-[#fffaf6]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 55% 40% at 0% 0%, rgba(251,146,60,0.12), transparent), radial-gradient(ellipse 45% 35% at 100% 100%, rgba(234,88,12,0.08), transparent)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-primary-600 bg-primary-50 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
            <FaPaw size={10} /> Testimonials
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Loved by pet parents across India
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">
            Real families who found — or rehomed — companions through {SITE_NAME}.
          </p>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="rounded-3xl border border-primary-100 bg-white shadow-soft p-8 sm:p-10"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                <div className="shrink-0 flex sm:flex-col items-center gap-3 sm:gap-4">
                  <img
                    src={current.avatar}
                    alt={current.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-200 shadow-sm"
                  />
                  <div className="flex gap-0.5 text-primary-500 sm:justify-center">
                    {Array.from({ length: current.rating }).map((_, i) => (
                      <FaStar key={i} size={13} />
                    ))}
                  </div>
                </div>

                <div className="min-w-0 flex-1 text-left">
                  <FaQuoteLeft className="text-primary-300 text-2xl mb-3" />
                  <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-5">
                    {current.text}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="font-semibold text-gray-900">{current.name}</p>
                    <span className="text-gray-300 hidden sm:inline">·</span>
                    <p className="text-sm text-gray-500">{current.location}</p>
                    <span className="inline-flex items-center rounded-full bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-1">
                      {current.pet}
                    </span>
                  </div>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous testimonial"
            className="w-11 h-11 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:text-primary-600 flex items-center justify-center transition shadow-sm"
          >
            <FiChevronLeft />
          </button>
          <div className="flex gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show review by ${t.name}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-8 bg-primary-500' : 'w-2 bg-primary-200 hover:bg-primary-300'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Next testimonial"
            className="w-11 h-11 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:text-primary-600 flex items-center justify-center transition shadow-sm"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
