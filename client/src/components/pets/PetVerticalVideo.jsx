import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiPlay } from 'react-icons/fi';
import { getVideoEmbed } from '../../utils/video';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

/**
 * Vertical 9:16 pet video panel — plays inline beside the main image.
 * Also supports a fullscreen modal for "Watch Full Video".
 */
const PetVerticalVideo = ({ videoUrl, name, fullscreenOpen, onCloseFullscreen }) => {
  const inlineVideo = getVideoEmbed(videoUrl, { autoplay: true, mute: true });
  const modalVideo = getVideoEmbed(videoUrl, { autoplay: true, mute: false });
  useBodyScrollLock(Boolean(fullscreenOpen && modalVideo));

  if (!inlineVideo) return null;

  return (
    <>
      <div className="w-full max-w-[260px] mx-auto lg:mx-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center lg:text-left">
          Pet Video
        </p>
        <div className="relative w-full aspect-[9/16] rounded-3xl overflow-hidden bg-dark-900 shadow-soft border border-gray-100">
          {inlineVideo.type === 'file' ? (
            <video
              src={inlineVideo.src}
              className="absolute inset-0 w-full h-full object-cover"
              controls
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <iframe
              src={inlineVideo.src}
              title={`${name} video`}
              className="absolute inset-0 w-full h-full scale-[1.35] origin-center"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {fullscreenOpen && modalVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseFullscreen}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <button
              onClick={onCloseFullscreen}
              aria-label="Close video"
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10"
            >
              <FiX size={20} />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm sm:max-w-md"
            >
              <div className="mb-3 flex items-center gap-2 text-white">
                <span className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <FiPlay size={14} className="ml-0.5" />
                </span>
                <div>
                  <p className="font-display font-bold text-lg leading-tight">{name}</p>
                  <p className="text-xs text-white/60">Full video tour</p>
                </div>
              </div>

              {/* Fullscreen also uses 9:16 portrait frame */}
              <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-2xl mx-auto">
                {modalVideo.type === 'file' ? (
                  <video
                    src={modalVideo.src}
                    controls
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <iframe
                    src={modalVideo.src}
                    title={`${name} full video`}
                    className="absolute inset-0 w-full h-full scale-[1.35] origin-center"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PetVerticalVideo;
