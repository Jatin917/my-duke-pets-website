import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiClipboard,
  FiFlag,
  FiHeart,
  FiHome,
  FiShield,
  FiTruck,
  FiUserCheck,
} from 'react-icons/fi';

// Order along the road: 1 → 2 → 3 → Happy Home (4) → 5 → 6
const services = [
  {
    num: '01',
    icon: FiShield,
    title: 'Verified Listings',
    description:
      'Every seller and pet profile is checked before it goes live — no fake photos, no ghost listings.',
  },
  {
    num: '02',
    icon: FiClipboard,
    title: 'Health & Vaccination Checks',
    description:
      "Vaccination schedules and vet records are verified so you know exactly what you're bringing home.",
  },
  {
    num: '03',
    icon: FiTruck,
    title: 'Pickup & Delivery Support',
    description:
      'Assistance with safe transport and handover, including inter-city moves for the right buyer.',
  },
  {
    num: '04',
    icon: FiHeart,
    title: 'Happy Home',
    description:
      'Your pet settles in with vet consultation support and follow-ups in the first few weeks — a happy home, not just a handover.',
  },
  {
    num: '05',
    icon: FiHome,
    title: 'Pet Care Guidance',
    description: 'Breed-specific feeding, training, and grooming guidance for new pet parents.',
  },
  {
    num: '06',
    icon: FiUserCheck,
    title: 'Adoption Assistance',
    description:
      'Rehoming support for owners who can no longer keep a pet — matched responsibly, never rushed.',
  },
];

// Long landscape rectangle — start top-left → home bottom-right.
const VB = { w: 1680, h: 420 };
const POINTS = [
  { x: 70, y: 55 },
  { x: 380, y: 340 },
  { x: 700, y: 70 },
  { x: 1020, y: 350 },
  { x: 1340, y: 75 },
  { x: 1610, y: 355 },
];

// Smooth curve through arbitrary points (Catmull-Rom → cubic Bezier).
const catmullRomPath = (points) => {
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
const ROAD_PATH = catmullRomPath(POINTS);

const AUTO_DURATION_MS = 16000; // one-way travel time
const CHECKPOINT_WINDOW = 0.03;

const buildLengthTable = (pathEl, samples = 120) => {
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

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const ROTATION_DEG = 10;

const clientToLocal = (el, clientX, clientY) => {
  const ow = el.offsetWidth;
  const oh = el.offsetHeight;
  if (!ow || !oh) return { x: 0, y: 0 };
  const br = el.getBoundingClientRect();
  const dx = clientX - (br.left + br.width / 2);
  const dy = clientY - (br.top + br.height / 2);
  const theta = (ROTATION_DEG * Math.PI) / 180;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  // Inverse of rotate(theta) around center
  const lx = dx * c + dy * s;
  const ly = -dx * s + dy * c;
  return {
    x: clamp((lx + ow / 2) / ow, 0, 1) * VB.w,
    y: clamp((ly + oh / 2) / oh, 0, 1) * VB.h,
  };
};

const RoadFlag = ({ point, label, tone, side }) => (
  <div
    className="absolute z-10 -translate-x-1/2"
    style={{
      left: `${(point.x / VB.w) * 100}%`,
      top: `${(point.y / VB.h) * 100}%`,
      transform: `translate(-50%, ${side === 'top' ? '-2.4rem' : '1.9rem'})`,
    }}
  >
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white ${
        tone === 'start' ? 'bg-primary-500' : 'bg-[#1a1528]'
      }`}
    >
      {tone === 'start' ? <FiFlag size={10} /> : <span className="text-[13px] leading-none">🐶</span>}
      {label}
    </span>
  </div>
);

const Checkpoint = ({ service, index, point, isActive, onHoverStart, onHoverEnd }) => {
  const Icon = service.icon;
  // Top checkpoints put labels below; bottom ones put labels above — into open space.
  const placeAbove = point.y >= VB.h / 2;
  const isFirst = index === 0;
  const isLast = index === services.length - 1;
  const tooltipAlign = isFirst
    ? 'left-0'
    : isLast
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${
        isActive ? 'z-50' : 'z-10'
      }`}
      style={{ left: `${(point.x / VB.w) * 100}%`, top: `${(point.y / VB.h) * 100}%` }}
    >
      <div className="relative flex items-center justify-center">
        <button
          type="button"
          aria-expanded={isActive}
          aria-describedby={isActive ? `svc-desc-${service.num}` : undefined}
          onMouseEnter={() => onHoverStart(index)}
          onMouseLeave={onHoverEnd}
          onFocus={() => onHoverStart(index)}
          onBlur={onHoverEnd}
          className="relative flex focus:outline-none"
        >
          {isActive && (
            <span className="pointer-events-none absolute inset-[-6px] rounded-full bg-primary-400/25 ring-2 ring-primary-300/40" />
          )}
          <span
            className={`relative flex h-12 w-12 items-center justify-center rounded-full border-[3px] text-lg shadow-soft transition-transform duration-200 sm:h-14 sm:w-14 sm:text-xl ${
              isActive
                ? 'scale-110 border-[#f4f4f4] bg-gradient-primary text-white'
                : 'border-[#f4f4f4] bg-white text-primary-600 hover:scale-105 hover:bg-gradient-primary hover:text-white'
            }`}
          >
            <Icon />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1528] font-display text-[9px] font-bold text-white sm:h-6 sm:w-6 sm:text-[10px]">
              {service.num}
            </span>
          </span>
        </button>

        <div
          className={`pointer-events-none absolute left-1/2 w-[8.5rem] -translate-x-1/2 text-center sm:w-[10.5rem] ${
            placeAbove ? 'bottom-[calc(100%+0.65rem)]' : 'top-[calc(100%+0.65rem)]'
          }`}
        >
          <span className="inline-block rounded-md bg-white/95 px-1.5 py-0.5 text-[11px] font-bold leading-snug text-gray-900 shadow-sm ring-1 ring-black/[0.04] sm:text-sm">
            {service.title}
          </span>
        </div>

        <AnimatePresence>
          {isActive && (
            <motion.div
              id={`svc-desc-${service.num}`}
              role="tooltip"
              initial={{ opacity: 0, y: placeAbove ? 6 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`absolute z-[60] w-[min(14rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#1a1528] px-4 py-3 text-left text-[11.5px] leading-relaxed text-white/90 shadow-soft sm:text-[12px] ${tooltipAlign} ${
                placeAbove
                  ? 'bottom-[calc(100%+2.85rem)]'
                  : 'top-[calc(100%+2.85rem)]'
              }`}
            >
              {service.description}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

﻿const RoadTrack = () => {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const dogRef = useRef(null);
  const visibleRef = useRef(false);
  const rafRef = useRef(0);
  const frameSkipRef = useRef(0);
  const mouseThrottleRef = useRef(0);

  const modeRef = useRef('auto');
  const progressRef = useRef(0);
  const posRef = useRef({ ...POINTS[0] });
  const mouseRef = useRef({ ...POINTS[0] });
  const facingRef = useRef('right');
  const activeDogRef = useRef(null);
  const totalLenRef = useRef(0);
  const tableRef = useRef(null);
  const checkpointFractionsRef = useRef([]);
  const readyRef = useRef(false);

  const [facing, setFacing] = useState('right');
  const [hoverActive, setHoverActive] = useState(null);
  const [dogActive, setDogActive] = useState(null);

  const displayedActive = hoverActive !== null ? hoverActive : dogActive;

  useEffect(() => {
    if (!pathRef.current) return;
    const { total, table } = buildLengthTable(pathRef.current);
    totalLenRef.current = total;
    tableRef.current = table;
    checkpointFractionsRef.current = POINTS.map((pt) => nearestFraction(table, total, pt.x, pt.y));
    readyRef.current = true;
    if (dogRef.current) {
      const x = (POINTS[0].x / VB.w) * containerRef.current.offsetWidth;
      const y = (POINTS[0].y / VB.h) * containerRef.current.offsetHeight;
      dogRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    }
  }, []);

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
      const table = tableRef.current;

      if (modeRef.current === 'auto') {
        const fractions = checkpointFractionsRef.current;
        let minDist = Infinity;
        let newActive = null;
        for (let i = 0; i < fractions.length; i += 1) {
          const dist = Math.abs(progressRef.current - fractions[i]);
          if (dist < minDist) minDist = dist;
          if (dist < CHECKPOINT_WINDOW) newActive = i;
        }
        const speedFactor = minDist < CHECKPOINT_WINDOW ? 0.08 : 1;
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
      } else {
        const targetFrac = nearestFraction(table, total, mouseRef.current.x, mouseRef.current.y);
        progressRef.current += (targetFrac - progressRef.current) * Math.min(1, delta * 0.012);
        let nearestIndex = null;
        let nearestDist = Infinity;
        const fractions = checkpointFractionsRef.current;
        for (let i = 0; i < fractions.length; i += 1) {
          const dist = Math.abs(progressRef.current - fractions[i]);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestIndex = i;
          }
        }
        const finalActive = nearestDist < CHECKPOINT_WINDOW * 1.6 ? nearestIndex : null;
        if (finalActive !== activeDogRef.current) {
          activeDogRef.current = finalActive;
          setDogActive(finalActive);
        }
      }

      const pt = pathRef.current.getPointAtLength(progressRef.current * total);
      const prev = posRef.current;
      if (Math.abs(pt.x - prev.x) > 0.5) {
        const nextFacing = pt.x > prev.x ? 'right' : 'left';
        if (facingRef.current !== nextFacing) {
          facingRef.current = nextFacing;
          setFacing(nextFacing);
        }
      }
      posRef.current = { x: pt.x, y: pt.y };
      if (dogRef.current && containerRef.current) {
        const x = (pt.x / VB.w) * containerRef.current.offsetWidth;
        const y = (pt.y / VB.h) * containerRef.current.offsetHeight;
        dogRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const now = performance.now();
    if (now - mouseThrottleRef.current < 32) return;
    mouseThrottleRef.current = now;
    modeRef.current = 'follow';
    mouseRef.current = clientToLocal(containerRef.current, e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    modeRef.current = 'auto';
    if (tableRef.current) {
      progressRef.current = nearestFraction(
        tableRef.current,
        totalLenRef.current,
        posRef.current.x,
        posRef.current.y
      );
    }
    setDogActive(null);
    activeDogRef.current = null;
  };

  return (
    <div
      className="relative mx-auto flex w-full items-center justify-center overflow-visible py-24 sm:py-32 lg:py-40"
      style={{ minHeight: 'min(68vw, 34rem)' }}
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-[98%] max-w-7xl origin-center sm:w-[96%]"
        style={{
          aspectRatio: `${VB.w} / ${VB.h}`,
          transform: `rotate(${ROTATION_DEG}deg)`,
          contain: 'layout style',
        }}
      >
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path d={ROAD_PATH} fill="none" stroke="#241f34" strokeWidth={136} strokeLinecap="round" />
          <path
            ref={pathRef}
            d={ROAD_PATH}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={6.5}
            strokeDasharray="20 22"
            strokeLinecap="round"
          />
        </svg>

        <RoadFlag point={POINTS[0]} label="Start" tone="start" side="top" />

        {services.map((service, index) => (
          <Checkpoint
            key={service.num}
            service={service}
            index={index}
            point={POINTS[index]}
            isActive={displayedActive === index}
            onHoverStart={setHoverActive}
            onHoverEnd={() => setHoverActive(null)}
          />
        ))}

        <div
          ref={dogRef}
          className="pointer-events-none absolute left-0 top-0 z-20 will-change-transform"
        >
          <span
            className="text-5xl drop-shadow-md sm:text-6xl lg:text-7xl"
            style={{
              display: 'inline-block',
              lineHeight: 1,
              transform: `rotate(${-ROTATION_DEG}deg) ${facing === 'left' ? 'scaleX(-1)' : ''}`,
            }}
          >
            🐶
          </span>
        </div>
      </div>
    </div>
  );
};

const ServicesSlide = () => (
  <section className="relative overflow-visible bg-[#f4f4f4] py-14 sm:py-20 lg:py-24">
    <div
      className="pointer-events-none absolute inset-0 opacity-40"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(249,115,22,0.12), transparent)',
      }}
    />

    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
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
          Watch the pup walk the road — move your cursor into the box and it will follow you to any
          checkpoint.
        </p>
      </div>
    </div>

    <RoadTrack />

    <p className="mt-6 px-4 text-center text-[11px] text-gray-400 sm:hidden">
      Move your finger over the road to explore
    </p>
  </section>
);

export default ServicesSlide;
