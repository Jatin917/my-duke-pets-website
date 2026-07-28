import { useEffect, useRef, useState } from 'react';
import {
  FaBone,
  FaCircleCheck,
  FaHandHoldingHeart,
  FaHouseChimney,
  FaSyringe,
  FaTruckFast,
} from 'react-icons/fa6';

// Highlight order: 1 → 2 → 3 → Happy Home (4) → Pet Care (5) → Adoption (6)
const services = [
  {
    num: '01',
    icon: FaCircleCheck,
    title: 'Verified Listings',
    description:
      'Every seller and pet profile is checked before it goes live — no fake photos, no ghost listings.',
  },
  {
    num: '02',
    icon: FaSyringe,
    title: 'Health & Vaccination',
    description:
      "Vaccination schedules and vet records are verified so you know exactly what you're bringing home.",
  },
  {
    num: '03',
    icon: FaTruckFast,
    title: 'Pickup & Delivery',
    description:
      'Assistance with safe transport and handover, including inter-city moves for the right buyer.',
  },
  {
    num: '04',
    icon: FaHouseChimney,
    title: 'Happy Home',
    description:
      'Vet consultation support and follow-ups in the first few weeks — a happy home, not just a handover.',
  },
  {
    num: '05',
    icon: FaBone,
    title: 'Pet Care Guidance',
    description: 'Breed-specific feeding, training, and grooming guidance for new pet parents.',
  },
  {
    num: '06',
    icon: FaHandHoldingHeart,
    title: 'Adoption Assistance',
    description:
      'Rehoming support for owners who can no longer keep a pet — matched responsibly, never rushed.',
  },
];

const HIGHLIGHT_MS = 3200;

// Boustrophedon (snake) grid placement so row transitions drop straight down.
const PLACEMENT = [
  'sm:col-start-1 sm:row-start-1 lg:col-start-1 lg:row-start-1',
  'sm:col-start-2 sm:row-start-1 lg:col-start-2 lg:row-start-1',
  'sm:col-start-2 sm:row-start-2 lg:col-start-3 lg:row-start-1',
  'sm:col-start-1 sm:row-start-2 lg:col-start-3 lg:row-start-2',
  'sm:col-start-1 sm:row-start-3 lg:col-start-2 lg:row-start-2',
  'sm:col-start-2 sm:row-start-3 lg:col-start-1 lg:row-start-2',
];

const Box = ({ service, isActive, placement, onHoverStart, onHoverEnd }) => {
  const Icon = service.icon;
  return (
    <div
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={`group relative flex h-40 flex-col overflow-hidden rounded-2xl border p-4 transition-all duration-300 sm:h-44 sm:p-5 lg:h-48 ${placement} ${
        isActive
          ? 'z-30 scale-[1.03] border-primary-400/60 bg-[#1b1530] shadow-glow'
          : 'z-20 border-white/5 bg-[#120f1e] shadow-soft'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg transition-colors duration-300 sm:h-12 sm:w-12 sm:text-xl ${
            isActive
              ? 'bg-gradient-primary text-white'
              : 'bg-white/10 text-primary-300 group-hover:bg-gradient-primary group-hover:text-white'
          }`}
        >
          <Icon />
        </span>
        <span className="font-display text-2xl font-bold text-white/15 sm:text-3xl">
          {service.num}
        </span>
      </div>

      <h3 className="mt-3 font-display text-[15px] font-bold leading-tight text-white sm:text-base">
        {service.title}
      </h3>

      <p
        className={`mt-1.5 text-[11.5px] leading-relaxed text-white/60 transition-all duration-300 sm:text-xs ${
          isActive ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
        }`}
      >
        {service.description}
      </p>
    </div>
  );
};

const ServicesTrack = () => {
  const containerRef = useRef(null);
  const visibleRef = useRef(false);
  const [hoverActive, setHoverActive] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayedActive = hoverActive !== null ? hoverActive : activeIndex;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { rootMargin: '80px', threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (!visibleRef.current) return;
      if (document.visibilityState !== 'visible') return;
      setActiveIndex((i) => (i + 1) % services.length);
    }, HIGHLIGHT_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto grid w-full max-w-6xl grid-cols-1 gap-x-10 gap-y-8 px-4 sm:grid-cols-2 sm:gap-x-14 lg:grid-cols-3 lg:gap-x-16 lg:gap-y-12"
    >
      {services.map((service, index) => (
        <Box
          key={service.num}
          service={service}
          placement={PLACEMENT[index]}
          isActive={displayedActive === index}
          onHoverStart={() => setHoverActive(index)}
          onHoverEnd={() => setHoverActive(null)}
        />
      ))}
    </div>
  );
};

const ServicesSlide = () => (
  <section className="relative overflow-hidden bg-[#f4f4f4] py-14 sm:py-20 lg:py-24">
    <div
      className="pointer-events-none absolute inset-0 opacity-40"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(249,115,22,0.12), transparent)',
      }}
    />

    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-3 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400 sm:mb-3 sm:text-[11px]">
            What We Handle
          </p>
          <h2 className="font-display text-xl font-extrabold leading-[1.15] text-gray-900 sm:text-4xl">
            Everything between{' '}
            <span className="text-primary-600 italic">&lsquo;I want a pet&rsquo;</span> and{' '}
            <span className="text-primary-600 italic">&lsquo;welcome home.&rsquo;</span>
          </h2>
        </div>
        <p className="hidden max-w-sm text-sm leading-relaxed text-gray-500 sm:block sm:text-right sm:text-[15px]">
          Each stop lights up in turn — hover any card to peek inside.
        </p>
      </div>

      <ServicesTrack />
    </div>
  </section>
);

export default ServicesSlide;
