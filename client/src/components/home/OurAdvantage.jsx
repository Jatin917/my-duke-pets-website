import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiActivity,
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiAward,
  FiHeadphones,
  FiShield,
} from 'react-icons/fi';
import { FaDog, FaSyringe } from 'react-icons/fa';

const advantages = [
  {
    icon: FiShield,
    title: 'Health Guarantee',
    description:
      'Every pet is backed by a clear health guarantee so you can welcome them home with confidence.',
    metric: 'Covered',
    tag: 'Trust',
  },
  {
    icon: FaDog,
    title: 'Ethical Breeders',
    description:
      'We partner only with responsible breeders who put animal welfare and temperament first.',
    metric: '',
    tag: 'Welfare',
  },
  {
    icon: FiActivity,
    title: 'Health Checkup',
    description: 'Pets are examined by trusted vets before listing — no surprises when they arrive.',
    metric: 'Vet-led',
    tag: 'Health',
  },
  {
    icon: FiAward,
    title: 'Expert Guidance',
    description:
      'Our pet-care team helps you choose the right companion and settle them in smoothly.',
    metric: '',
    tag: 'Guidance',
  },
  {
    icon: FaSyringe,
    title: 'Vaccinated Pets',
    description: 'Age-appropriate vaccination and deworming records are shared before handover.',
    metric: '100%',
    tag: 'Records',
  },
  {
    icon: FiHeadphones,
    title: 'Best Support',
    description:
      'Friendly support before and after adoption — questions, care tips, and follow-ups included.',
    metric: '24/7',
    tag: 'Support',
  },
];

const COUNT = advantages.length;
const loopedAdvantages = [...advantages, ...advantages];
const AUTOPLAY_MS = 4200;

const AdvantageCard = ({ item }) => (
  <article className="group relative flex h-[300px] w-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-[#151222] p-5 sm:h-[340px] sm:p-7">
    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white transition-colors group-hover:border-primary-400/50 group-hover:text-primary-300 sm:right-4 sm:top-4 sm:h-9 sm:w-9">
      <FiArrowUpRight size={14} />
    </span>

    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl text-primary-300 transition-colors group-hover:bg-primary-500/20 sm:mb-5 sm:h-14 sm:w-14 sm:text-3xl">
      <item.icon />
    </span>
    <h3 className="font-display text-base font-bold text-white pr-8 sm:text-lg">{item.title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-white/65 sm:mt-3 sm:text-[15px]">
      {item.description}
    </p>
    {item.metric ? (
      <p className="mt-auto pt-6 font-display text-3xl font-extrabold text-white sm:text-4xl">
        {item.metric}
      </p>
    ) : (
      <div className="mt-auto" />
    )}
    <span className="mt-3 inline-flex w-fit rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
      {item.tag}
    </span>
  </article>
);

const OurAdvantage = () => {
  const scrollerRef = useRef(null);
  const setWidthRef = useRef(0);
  const pausedRef = useRef(false);
  const scrollRafRef = useRef(0);
  const visibleRef = useRef(false);
  const [active, setActive] = useState(0);

  const getCards = useCallback(() => {
    const el = scrollerRef.current;
    return el ? Array.from(el.querySelectorAll('[data-advantage-card]')) : [];
  }, []);

  const measure = useCallback(() => {
    const cards = getCards();
    if (cards.length > COUNT) {
      setWidthRef.current = cards[COUNT].offsetLeft - cards[0].offsetLeft;
    }
  }, [getCards]);

  const updateActive = useCallback(() => {
    const el = scrollerRef.current;
    const cards = getCards();
    if (!el || !cards.length) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let nearest = 0;
    let nearestDist = Infinity;
    for (let index = 0; index < cards.length; index += 1) {
      const card = cards[index];
      const center = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = index;
      }
    }
    setActive(nearest % COUNT);
  }, [getCards]);

  const normalize = useCallback(() => {
    const el = scrollerRef.current;
    const w = setWidthRef.current;
    if (!el || !w) return;
    if (el.scrollLeft >= w) el.scrollLeft -= w;
    if (el.scrollLeft < 0) el.scrollLeft += w;
  }, []);

  const scrollByCard = useCallback(
    (direction, { fromAuto = false } = {}) => {
      const el = scrollerRef.current;
      const cards = getCards();
      if (!el || !cards.length) return;
      if (!fromAuto) pausedRef.current = true;

      measure();
      const styles = getComputedStyle(el);
      const gap = parseFloat(styles.columnGap || styles.gap) || 16;
      const amount = cards[0].offsetWidth + gap;

      if (direction < 0 && el.scrollLeft < amount / 2 && setWidthRef.current) {
        el.scrollLeft += setWidthRef.current;
      }

      el.scrollBy({ left: direction * amount, behavior: 'smooth' });

      window.setTimeout(() => {
        normalize();
        updateActive();
        if (!fromAuto) {
          window.setTimeout(() => {
            pausedRef.current = false;
          }, 2500);
        }
      }, 450);
    },
    [getCards, measure, normalize, updateActive]
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;

    measure();
    updateActive();
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { rootMargin: '100px', threshold: 0.05 }
    );
    observer.observe(el);

    const onScroll = () => {
      if (scrollRafRef.current) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = 0;
        updateActive();
        normalize();
      });
    };
    const onResize = () => {
      measure();
      updateActive();
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const id = window.setInterval(() => {
      if (
        visibleRef.current &&
        !pausedRef.current &&
        document.visibilityState === 'visible'
      ) {
        scrollByCard(1, { fromAuto: true });
      }
    }, AUTOPLAY_MS);

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      window.clearInterval(id);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, [measure, normalize, scrollByCard, updateActive]);

  const goTo = (index) => {
    const el = scrollerRef.current;
    const cards = getCards();
    if (!el || !cards.length) return;
    pausedRef.current = true;
    const card = cards[index] || cards[index + COUNT];
    if (!card) return;
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: 'smooth',
    });
    window.setTimeout(() => {
      pausedRef.current = false;
      updateActive();
    }, 2500);
  };

  return (
    <section className="relative overflow-hidden bg-[#f3f3f3] py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-12">
          <div className="max-w-2xl">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400 sm:text-[11px]">
              Trusted Care Across Every Step
            </p>
            <h2 className="font-display text-[1.85rem] font-extrabold leading-[1.1] text-gray-900 sm:text-4xl lg:text-5xl">
              Our Advantage
            </h2>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              aria-label="Previous advantage"
              onClick={() => scrollByCard(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-gray-800 transition hover:border-primary-400 hover:text-primary-600"
            >
              <FiArrowLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next advantage"
              onClick={() => scrollByCard(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-gray-800 transition hover:border-primary-400 hover:text-primary-600"
            >
              <FiArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        onTouchStart={() => {
          pausedRef.current = true;
        }}
        onTouchEnd={() => {
          window.setTimeout(() => {
            pausedRef.current = false;
          }, 2500);
        }}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:gap-5 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {loopedAdvantages.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            data-advantage-card
            className="w-[78%] max-w-[300px] shrink-0 snap-center sm:w-[46%] sm:max-w-[340px] lg:w-[32%] lg:max-w-[380px]"
          >
            <AdvantageCard item={item} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 sm:mt-8">
        {advantages.map((item, index) => (
          <button
            key={item.title}
            type="button"
            aria-label={`Go to ${item.title}`}
            aria-current={active === index}
            onClick={() => goTo(index)}
            className={`h-2 rounded-full transition-all ${
              active === index ? 'w-7 bg-primary-500' : 'w-2 bg-black/15 hover:bg-black/30'
            }`}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 sm:hidden">
        <button
          type="button"
          aria-label="Previous advantage"
          onClick={() => scrollByCard(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-gray-800"
        >
          <FiArrowLeft size={16} />
        </button>
        <button
          type="button"
          aria-label="Next advantage"
          onClick={() => scrollByCard(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-gray-800"
        >
          <FiArrowRight size={16} />
        </button>
      </div>
    </section>
  );
};

export default OurAdvantage;
