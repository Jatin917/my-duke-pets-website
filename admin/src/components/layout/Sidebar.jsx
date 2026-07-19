import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiPackage,
  FiTag,
  FiMail,
  FiX,
  FiHeart,
  FiShoppingBag,
} from 'react-icons/fi';

const links = [
  { to: '/', label: 'Dashboard', icon: FiGrid },
  { to: '/pets', label: 'Manage Pets', icon: FiPackage },
  { to: '/categories', label: 'Categories', icon: FiTag },
  { to: '/enquiries', label: 'Enquiries', icon: FiMail },
  { to: '/sell', label: 'Sell Requests', icon: FiShoppingBag },
  { to: '/donate', label: 'Donate', icon: FiHeart },
];

const Sidebar = ({ open, onClose }) => (
  <>
    {open && (
      <div onClick={onClose} className="fixed inset-0 bg-black/50 z-30 lg:hidden" />
    )}
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-dark-900 text-gray-300 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between px-5 h-20 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <span className="rounded-xl bg-white/10 p-1.5 shrink-0">
            <img src="/logo.png" alt="My Duke" className="h-10 w-auto object-contain" />
          </span>
          <span className="font-bold text-white text-sm leading-tight">
            Admin
          </span>
        </div>
        <button onClick={onClose} className="lg:hidden text-gray-400 shrink-0">
          <FiX />
        </button>
      </div>

      <nav className="px-4 py-6 space-y-1.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="rounded-xl bg-white/5 p-4 text-xs text-gray-400">
          My Duke Admin v1.0
        </div>
      </div>
    </aside>
  </>
);

export default Sidebar;
