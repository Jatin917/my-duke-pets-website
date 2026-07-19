import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX, FiZoomIn, FiPlay } from 'react-icons/fi';
import { resolveImageUrl } from '../../services/api';
import { getVideoEmbed } from '../../utils/video';

/**
 * Landscape image gallery + "Watch Full Video" CTA under the image.
 * Video itself is rendered separately in a 9:16 panel.
 */
const ImageGallery = ({ images = [], name, videoUrl = '', onWatchVideo }) => {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const list = images.length ? images : [''];
  const hasVideo = Boolean(getVideoEmbed(videoUrl));

  const next = () => setActive((i) => (i + 1) % list.length);
  const prev = () => setActive((i) => (i - 1 + list.length) % list.length);

  return (
    <div>
      <div className="relative rounded-3xl overflow-hidden bg-gray-100 h-[280px] sm:h-[380px] lg:h-[420px] group">
        {list[active] ? (
          <img
            src={resolveImageUrl(list[active])}
            alt={`${name} ${active + 1}`}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setZoomOpen(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">🐾</div>
        )}

        <button
          onClick={() => setZoomOpen(true)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition z-10"
        >
          <FiZoomIn />
        </button>

        {list.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-700 z-10"
            >
              <FiChevronLeft />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-700 z-10"
            >
              <FiChevronRight />
            </button>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition ${
                i === active ? 'border-primary-500' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={resolveImageUrl(img)} alt={`thumb-${i}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {hasVideo && (
        <button
          onClick={onWatchVideo}
          className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-gradient text-white font-semibold px-6 py-3 rounded-full shadow-glow"
        >
          <FiPlay className="ml-0.5" />
          Watch Full Video
        </button>
      )}

      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomOpen(false)}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          >
            <button
              onClick={() => setZoomOpen(false)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >
              <FiX size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={resolveImageUrl(list[active])}
              alt={name}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageGallery;
