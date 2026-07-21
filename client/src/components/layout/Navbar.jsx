import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSearch, FiUser } from 'react-icons/fi';
import { FaHeadset } from 'react-icons/fa';
import BrandLogo from '../common/BrandLogo';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/pets', label: 'All Pets' },
  { to: '/sell', label: 'Sell' },
  { to: '/donate', label: 'Donate' },
  { to: '/contact', label: 'Contact' },
  { to: '/about', label: 'About' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, customer } = useCustomerAuth();
  useBodyScrollLock(open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query ? `/pets?search=${encodeURIComponent(query)}` : '/pets');
    setOpen(false);
  };

  return (
    <header
      className={`relative w-full z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-soft py-2'
          : 'bg-white sm:bg-transparent py-2 sm:py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-2 sm:gap-4">
        <BrandLogo
          className="shrink-0"
          imgClassName="h-14 sm:h-12 w-auto max-w-[110px] sm:max-w-none object-contain object-left"
        />

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative font-medium text-sm transition-colors ${
                  isActive ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pets, breeds..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 border border-transparent focus:border-primary-400 focus:bg-white focus:outline-none text-sm transition"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </form>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 ml-auto shrink-0">
          <Link
            to="/help"
            className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition"
            aria-label="Help and support"
            title="Help and support"
          >
            <FaHeadset size={18} />
          </Link>

          <Link
            to={isAuthenticated ? '/account' : '/login?return_url=/account'}
            className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition"
            title={isAuthenticated ? customer?.name || 'Account' : 'Login'}
            aria-label={isAuthenticated ? 'Account' : 'Login'}
          >
            <FiUser size={18} />
          </Link>

          <Link
            to="/pets"
            className="hidden sm:inline-flex btn-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-glow"
          >
            Adopt Now
          </Link>

          <button
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700"
            aria-label="Toggle menu"
          >
            {open ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white shadow-soft overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pets, breeds..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 focus:outline-none text-sm"
                />
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </form>
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block py-2 font-medium ${isActive ? 'text-primary-600' : 'text-gray-700'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/help"
                onClick={() => setOpen(false)}
                className="block py-2 font-medium text-gray-700"
              >
                Help &amp; Support
              </Link>
              <Link
                to={isAuthenticated ? '/account' : '/login?return_url=/account'}
                onClick={() => setOpen(false)}
                className="block text-center btn-gradient text-white font-semibold px-5 py-3 rounded-full"
              >
                {isAuthenticated ? 'My Account' : 'Login / Signup'}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
