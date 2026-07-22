import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils';

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/food', label: 'Food' },
  { to: '/meals', label: 'Meals' },
  { to: '/health', label: 'Health' },
  { to: '/recipe', label: 'Recipe' },
  { to: '/custom-foods', label: 'Custom' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-brand-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2 font-extrabold tracking-tight text-black">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg shadow-sm shadow-brand-500/30">🥗</span>
          <span>WhatYou<span className="text-brand-600">Eat</span></span>
        </Link>
        <nav className="hidden gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-brand-100 text-brand-700' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 ring-2 ring-brand-200"
            title={user?.name}
          >
            {initials(user?.name)}
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-black hover:bg-brand-100"
          >
            Logout
          </button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                isActive ? 'bg-brand-100 text-brand-700' : 'text-slate-600'
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
