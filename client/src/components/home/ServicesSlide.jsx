import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  FaBone,
  FaCircleCheck,
  FaHandHoldingHeart,
  FaHouseChimney,
  FaSyringe,
  FaTruckFast,
} from 'react-icons/fa6';

// Walk order: 1 → 2 → 3 → Happy Home (4) → Pet Care (5) → Adoption (6)
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

// Smooth curve through arbitrary points (Catmull-Rom → cubic Bezier).
const catmullRomPath = (points) => {
  if (!points || points.length < 2) return '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
};

const buildLengthTable = (pathEl, samples = 100) => {
  const total = pathEl.getTotalLength();
  const table = [];
  for (let i = 0; i <= samples; i += 1) {
    const len = (i / samples) * total;
    const pt = pathEl.getPointAtLength(len);
    table.push({ len, x: pt.x, y: pt.y });
  }
  return { total, table };
};

const nearestFraction = (table, total, x, y) => {
  let bestLen = 0;
  let bestDist = Infinity;
  for (let i = 0; i < table.length; i += 1) {
    const s = table[i];
    const d = (s.x - x) ** 2 + (s.y - y) ** 2;
    if (d < bestDist) {
      bestDist = d;
      bestLen = s.len;
    }
  }
  return total ? bestLen / total : 0;
};

const AUTO_DURATION_MS = 22000; // full lap time
const CHECKPOINT_WINDOW = 0.05;

// Boustrophedon (snake) grid placement so row transitions drop straight down.
const PLACEMENT = [
  'sm:col-start-1 sm:row-start-1 lg:col-start-1 lg:row-start-1',
  'sm:col-start-2 sm:row-start-1 lg:col-start-2 lg:row-start-1',
  'sm:col-start-2 sm:row-start-2 lg:col-start-3 lg:row-start-1',
  'sm:col-start-1 sm:row-start-2 lg:col-start-3 lg:row-start-2',
  'sm:col-start-1 sm:row-start-3 lg:col-start-2 lg:row-start-2',
  'sm:col-start-2 sm:row-start-3 lg:col-start-1 lg:row-start-2',
];

const Box = ({ service, isActive, placement, refCb, onHoverStart, onHoverEnd }) => {
  const Icon = service.icon;
  return (
    <div
      ref={refCb}
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
  const boxRefs = useRef([]);
  const pathRef = useRef(null);
  const dogRef = useRef(null);

  const visibleRef = useRef(false);
  const rafRef = useRef(0);
  const frameSkipRef = useRef(0);

  const progressRef = useRef(0);
  const posRef = useRef({ x: 0, y: 0 });
  const facingRef = useRef('right');
  const activeDogRef = useRef(null);

  const totalLenRef = useRef(0);
  const tableRef = useRef(null);
  const checkpointFractionsRef = useRef([]);
  const centersRef = useRef([]);
  const readyRef = useRef(false);

  const [pathD, setPathD] = useState('');
  const [facing, setFacing] = useState('right');
  const [hoverActive, setHoverActive] = useState(null);
  const [dogActive, setDogActive] = useState(null);

  const displayedActive = hoverActive !== null ? hoverActive : dogActive;

  const measure = useCallback(() => {
    const cont = containerRef.current;
    if (!cont) return;
    const cb = cont.getBoundingClientRect();
    const centers = boxRefs.current
      .filter(Boolean)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left - cb.left + r.width / 2,
          y: r.top - cb.top + r.height / 2,
        };
      });
    if (centers.length < services.length) return;
    centersRef.current = centers;
    setPathD(catmullRomPath(centers));
  }, []);

  useLayoutEffect(() => {
    measure();
    const cont = containerRef.current;
    if (!cont || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(() => measure());
    ro.observe(cont);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  // Rebuild the length lookup whenever the path (layout) changes.
  useEffect(() => {
    if (!pathD || !pathRef.current) return;
    const { total, table } = buildLengthTable(pathRef.current);
    totalLenRef.current = total;
    tableRef.current = table;
    checkpointFractionsRef.current = centersRef.current.map((pt) =>
      nearestFraction(table, total, pt.x, pt.y)
    );
    readyRef.current = true;
    if (centersRef.current[0]) {
      posRef.current = { ...centersRef.current[0] };
    }
  }, [pathD]);

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
    let last = performance.now();
    const tick = (now) => {
      rafRef.current = requestAnimationFrame(tick);
      if (!readyRef.current || !pathRef.current || !visibleRef.current) return;
      if (document.visibilityState !== 'visible') return;
      frameSkipRef.current ^= 1;
      if (frameSkipRef.current === 0) return;

      const delta = Math.min(now - last, 40);
      last = now;
      const total = totalLenRef.current;
      if (!total) return;

      const fractions = checkpointFractionsRef.current;
      let minDist = Infinity;
      let newActive = null;
      for (let i = 0; i < fractions.length; i += 1) {
        const dist = Math.abs(progressRef.current - fractions[i]);
        if (dist < minDist) minDist = dist;
        if (dist < CHECKPOINT_WINDOW) newActive = i;
      }
      // Slow right down at each box so the description stays readable.
      const speedFactor = minDist < CHECKPOINT_WINDOW ? 0.12 : 1;
      let next = progressRef.current + (delta / AUTO_DURATION_MS) * speedFactor;
      if (next >= 1) {
        next = 0;
        facingRef.current = 'right';
        setFacing('right');
      }
      progressRef.current = next;
      if (newActive !== activeDogRef.current) {
        activeDogRef.current = newActive;
        setDogActive(newActive);
      }

      const pt = pathRef.current.getPointAtLength(progressRef.current * total);
      const prev = posRef.current;
      if (Math.abs(pt.x - prev.x) > 0.4) {
        const nextFacing = pt.x > prev.x ? 'right' : 'left';
        if (facingRef.current !== nextFacing) {
          facingRef.current = nextFacing;
          setFacing(nextFacing);
        }
      }
      posRef.current = { x: pt.x, y: pt.y };
      if (dogRef.current) {
        dogRef.current.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) translate(-50%, -50%)`;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto grid w-full max-w-6xl grid-cols-1 gap-x-10 gap-y-8 px-4 sm:grid-cols-2 sm:gap-x-14 lg:grid-cols-3 lg:gap-x-16 lg:gap-y-12"
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        {pathD && (
          <>
            <path d={pathD} fill="none" stroke="#241f34" strokeWidth={16} strokeLinecap="round" />
            <path
              ref={pathRef}
              d={pathD}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={3}
              strokeDasharray="10 12"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      {services.map((service, index) => (
        <Box
          key={service.num}
          service={service}
          placement={PLACEMENT[index]}
          isActive={displayedActive === index}
          refCb={(el) => {
            boxRefs.current[index] = el;
          }}
          onHoverStart={() => setHoverActive(index)}
          onHoverEnd={() => setHoverActive(null)}
        />
      ))}

      <div ref={dogRef} className="pointer-events-none absolute left-0 top-0 z-40 will-change-transform">
        <span
          className="text-4xl drop-shadow-lg sm:text-5xl"
          style={{
            display: 'inline-block',
            lineHeight: 1,
            transform: facing === 'left' ? 'scaleX(-1)' : 'none',
          }}
        >
          🐶
        </span>
      </div>
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
          Follow the pup between the stops — every box opens up as it arrives, or hover any box to
          peek inside.
        </p>
      </div>

      <ServicesTrack />
    </div>
  </section>
);

export default ServicesSlide;
