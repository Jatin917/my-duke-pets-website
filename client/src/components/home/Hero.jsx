import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import StreamVideo from '../common/StreamVideo';
import { SITE_NAME } from '../../utils/constants';

const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const GenuineSellerSeal = () => (
  <div
    className="relative mx-auto h-40 w-40 sm:h-48 sm:w-48 shrink-0"
    aria-label={`${SITE_NAME} Genuine Seller`}
  >
    <motion.div
      className="absolute inset-0"
      animate={{ rotate: 360 }}
      transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
        <defs>
          <path
            id="seal-rim"
            d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
          />
        </defs>
        <circle
          cx="100"
          cy="100"
          r="96"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
        />
        <circle
          cx="100"
          cy="100"
          r="62"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
        <text
          fill="rgba(255,255,255,0.92)"
          fontSize="13"
          fontWeight="600"
          letterSpacing="3.2"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <textPath href="#seal-rim" startOffset="0%">
            MY DUKE • GENUINE SELLER • MY DUKE • GENUINE SELLER •
          </textPath>
        </text>
      </svg>
    </motion.div>

    <div className="absolute inset-[22%] rounded-full border border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center text-center px-3">
      <span className="font-display text-[10px] sm:text-xs font-extrabold tracking-[0.12em] text-white uppercase leading-snug">
        Genuine Seller
      </span>
    </div>
  </div>
);

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-28 sm:pb-28 min-h-[min(92vh,820px)] flex items-center">
      <div className="absolute inset-0">
        <StreamVideo
          src="/videos/backgroundVideo.mp4"
          mobileSrc="/videos/backgroundVideo-mobile.mp4"
          poster="/videos/backgroundVideo-poster.jpg"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1a1528]/72" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/35 via-transparent to-secondary-900/25" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">
          <div className="text-center lg:text-left min-w-0">
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-5"
            >
              {SITE_NAME}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-primary-300 mb-4"
            >
              Verified &nbsp;•&nbsp; Healthy &nbsp;•&nbsp; Vaccinated
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug mb-5"
            >
              Every Pet Deserves the Right Home.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="text-white/85 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed"
            >
              My Duke connects genuine pet parents and responsible breeders across India — every
              listing checked, every pet cared for, before it ever reaches you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <button
                type="button"
                onClick={() => scrollToId('buy-sell')}
                className="btn-gradient text-white font-semibold px-7 py-3.5 rounded-xl shadow-glow text-sm sm:text-base"
              >
                Find a Pet
              </button>
              <Link
                to="/help#enquiries"
                className="font-semibold px-7 py-3.5 rounded-xl text-sm sm:text-base text-white border border-white/35 bg-white/5 hover:bg-white/12 backdrop-blur-sm transition"
              >
                List Your Pet →
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex justify-center lg:justify-end"
          >
            <GenuineSellerSeal />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
