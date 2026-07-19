import { useState } from 'react';
import { FiMenu, FiLogOut, FiUser, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <button onClick={onMenuClick} className="lg:hidden text-gray-600 text-xl">
        <FiMenu />
      </button>

      <div className="hidden lg:block">
        <p className="text-sm text-gray-400">Welcome back,</p>
        <p className="font-semibold text-gray-800">{user?.name || 'Admin'}</p>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition"
        >
          <span className="w-9 h-9 rounded-full bg-gradient-primary text-white flex items-center justify-center">
            <FiUser />
          </span>
          <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
          <FiChevronDown className="text-gray-400" size={14} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
