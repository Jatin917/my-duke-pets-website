import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="text-center">
      <h1 className="font-bold text-6xl text-primary-500 mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-800 mb-3">Page Not Found</h2>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="inline-flex items-center gap-2 btn-gradient text-white font-semibold px-6 py-3 rounded-xl">
        <FiHome /> Back To Dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
