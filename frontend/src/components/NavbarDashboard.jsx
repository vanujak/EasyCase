import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import AppUserButton from "./AppUserButton.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function NavbarDashboard() {
  const [open, setOpen] = useState(false);

  const base =
    "px-3 py-2 rounded-lg font-medium text-lg transition-colors text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400";
  const active =
    "px-3 py-2 rounded-lg font-semibold text-lg bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400";

  const cls = ({ isActive }) => (isActive ? active : base);

  return (
    <nav className="border-b border-gray-200 bg-white dark:bg-slate-900 dark:border-slate-800 text-gray-900 dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-6xl h-20 px-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img
            src="/easy-case-logo.png"
            alt="EasyCase logo"
            className="h-15 w-15 object-contain"
          />
          <span className="!text-[30px] font-semibold tracking-tight">EasyCase</span>
        </Link>

        {/* Right side controls for mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <rect 
                className={`origin-center transition-all duration-300 ease-out ${
                  open 
                    ? 'translate-y-0 rotate-45' 
                    : '-translate-y-[5px]'
                }`}
                y="7" 
                width="16" 
                height="2" 
                rx="1"
              />
              <rect 
                className={`origin-center transition-all duration-300 ease-out ${
                  open 
                    ? 'opacity-0 scale-0' 
                    : 'opacity-100 scale-100'
                }`}
                y="7" 
                width="16" 
                height="2" 
                rx="1"
              />
              <rect 
                className={`origin-center transition-all duration-300 ease-out ${
                  open 
                    ? 'translate-y-0 -rotate-45' 
                    : 'translate-y-[5px]'
                }`}
                y="7" 
                width="16" 
                height="2" 
                rx="1"
              />
            </svg>
          </button>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <NavLink to="/dashboard" className={cls}>
            Dashboard
          </NavLink>
          <NavLink to="/cases" className={cls}>
            Cases
          </NavLink>
          <NavLink to="/clients" className={cls}>
            Clients
          </NavLink>

          <div className="ml-1 pl-2 border-l border-gray-200 dark:border-slate-800 flex items-center gap-3">
            <ThemeToggle />
            <AppUserButton afterSignOutUrl="/login" />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2">
          <NavLink to="/dashboard" onClick={() => setOpen(false)} className={cls}>
            Dashboard
          </NavLink>
          <NavLink to="/cases" onClick={() => setOpen(false)} className={cls}>
            Cases
          </NavLink>
          <NavLink to="/clients" onClick={() => setOpen(false)} className={cls}>
            Clients
          </NavLink>
          <div className="pt-2 flex items-center justify-between border-t border-gray-200 dark:border-slate-800">
            <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">Account</span>
            <AppUserButton afterSignOutUrl="/login" />
          </div>
        </div>
      </div>
    </nav>
  );
}
