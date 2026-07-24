import { useEffect, useRef } from 'react';

/**
 * Progressive-stream hero video served from /public/videos.
 * Uses HTTP range requests (partial content) instead of a full download first.
 * Src is attached only when the element is near the viewport.
 */
const StreamVideo = ({
  src,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  poster,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const start = () => {
      if (!el.getAttribute('src')) {
        el.src = src;
        el.load();
      }
      if (autoPlay) el.play().catch(() => {});
    };

    if (typeof IntersectionObserver === 'undefined') {
      start();
      return undefined;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        start();
        io.disconnect();
      },
      { rootMargin: '160px', threshold: 0.01 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [src, autoPlay]);

  return (
    <video
      ref={ref}
      className={className}
      muted={muted}
      loop={loop}
      playsInline
      preload="metadata"
      poster={poster}
      controls={false}
      disablePictureInPicture
    />
  );
};

export default StreamVideo;
