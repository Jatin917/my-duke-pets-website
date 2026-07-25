import { FaPaw } from 'react-icons/fa';

const FADE_MASK = 'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)';

/**
 * Edge-faded scrolling keyword strip. The list is rendered twice because the
 * marquee keyframe translates by -50% for a seamless loop.
 */
const KeywordMarquee = ({ items, dark = false, className = '' }) => (
  <div
    className={`relative overflow-hidden border-y ${
      dark ? 'border-white/10' : 'border-primary-100'
    } ${className}`}
    style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
    aria-hidden="true"
  >
    <div className="flex w-max animate-marquee">
      {[...items, ...items].map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`flex items-center gap-4 whitespace-nowrap px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] sm:px-6 sm:text-xs ${
            dark ? 'text-white/55' : 'text-primary-700/70'
          }`}
        >
          {item}
          <FaPaw size={9} className="text-primary-400" />
        </span>
      ))}
    </div>
  </div>
);

export default KeywordMarquee;
