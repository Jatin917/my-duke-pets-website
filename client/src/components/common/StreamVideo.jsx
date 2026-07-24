import { useEffect, useRef, useState } from 'react';

const MOBILE_MQ = '(max-width: 768px)';

/**
 * Progressive-stream background video from /public/videos.
 * Picks a lighter mobile source on small screens, waits for buffer
 * before playing, and pauses when off-screen to avoid decode lag.
 */
const StreamVideo = ({
  src,
  mobileSrc,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  poster,
}) => {
  const ref = useRef(null);
  const [activeSrc, setActiveSrc] = useState(() => {
    if (typeof window === 'undefined') return src;
    if (mobileSrc && window.matchMedia(MOBILE_MQ).matches) return mobileSrc;
    return src;
  });

  useEffect(() => {
    if (!mobileSrc) {
      setActiveSrc(src);
      return undefined;
    }
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setActiveSrc(mq.matches ? mobileSrc : src);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, [src, mobileSrc]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !activeSrc) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    let attached = false;
    let readyToPlay = false;

    const tryPlay = () => {
      if (!autoPlay || !readyToPlay || document.hidden) return;
      el.play().catch(() => {});
    };

    const onCanPlay = () => {
      readyToPlay = true;
      tryPlay();
    };

    const onVisibility = () => {
      if (document.hidden) {
        el.pause();
      } else {
        tryPlay();
      }
    };

    const attach = () => {
      if (attached) return;
      attached = true;
      el.src = activeSrc;
      el.load();
      el.addEventListener('canplay', onCanPlay, { once: true });
      // Fallback if canplay already fired or never fires on some browsers
      const t = window.setTimeout(onCanPlay, 1200);
      el.dataset.playTimer = String(t);
    };

    const cleanupAttach = () => {
      el.removeEventListener('canplay', onCanPlay);
      const t = Number(el.dataset.playTimer);
      if (t) window.clearTimeout(t);
    };

    document.addEventListener('visibilitychange', onVisibility);

    if (typeof IntersectionObserver === 'undefined') {
      attach();
      return () => {
        cleanupAttach();
        document.removeEventListener('visibilitychange', onVisibility);
      };
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          attach();
          tryPlay();
        } else if (attached) {
          el.pause();
        }
      },
      { rootMargin: '120px', threshold: 0.01 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cleanupAttach();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [activeSrc, autoPlay]);

  return (
    <video
      ref={ref}
      className={`${className} [transform:translateZ(0)] will-change-[contents]`}
      muted={muted}
      loop={loop}
      playsInline
      preload="none"
      poster={poster}
      controls={false}
      disablePictureInPicture
    />
  );
};

export default StreamVideo;
