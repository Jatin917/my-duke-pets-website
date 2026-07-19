import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const Breadcrumb = ({ items = [] }) => (
  <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap" aria-label="Breadcrumb">
    <Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition">
      <FiHome /> Home
    </Link>
    {items.map((item, idx) => (
      <span key={idx} className="flex items-center gap-2">
        <FiChevronRight className="text-gray-400" />
        {item.to ? (
          <Link to={item.to} className="hover:text-primary-600 transition">
            {item.label}
          </Link>
        ) : (
          <span className="text-gray-800 font-medium">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export default Breadcrumb;
