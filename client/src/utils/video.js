/**
 * Convert common video URL formats into an embeddable src.
 * Supports YouTube watch/share/shorts, Vimeo, and direct .mp4 links.
 */
export const getVideoEmbed = (url = '', { autoplay = false, mute = false } = {}) => {
  if (!url) return null;

  const autoplayFlag = autoplay ? 1 : 0;
  const muteFlag = mute ? 1 : 0;

  // Direct video file
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return { type: 'file', src: url };
  }

  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  if (ytMatch?.[1]) {
    return {
      type: 'iframe',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=${autoplayFlag}&mute=${muteFlag}&rel=0&playsinline=1`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch?.[1]) {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=${autoplayFlag}&muted=${muteFlag}`,
    };
  }

  if (url.includes('embed') || url.includes('player')) {
    return { type: 'iframe', src: url };
  }

  return null;
};
