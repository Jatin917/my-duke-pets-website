import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';
import SEO from '../components/common/SEO';

const NotFound = () => (
  <>
    <SEO title="Page Not Found" />
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-7xl mb-2"
        >
          🐾
        </motion.div>
        <h1 className="font-display text-6xl font-extrabold text-primary-500 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Oops! This page ran away</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          The page you're looking for might have been rehomed. Let's get you back on track.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 btn-gradient text-white font-semibold px-7 py-3.5 rounded-full shadow-glow"
        >
          <FiHome /> Back To Home
        </Link>
      </div>
    </div>
  </>
);

export default NotFound;
