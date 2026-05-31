import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Share2,
  Database,
  Settings,
  Moon,
  Sun,
  Lock,
  X,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const {
    isDarkMode,
    setIsDarkMode,
    isMobileMenuOpen,
    closeSidebar,
    isSidebarHidden,
    isSidebarCollapsed,
    toggleSidebarCollapse,
  } = useTheme();

  const location = useLocation();

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  const navItems = [
    { name: 'HOME',         path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Files',     path: '/my-files',  icon: FileText },
    { name: 'Shared',       path: '/shared',    icon: Share2 },
    { name: 'Storage',      path: '/storage',   icon: Database },
    { name: 'Subscription', path: '/payment',   icon: CreditCard },
    { name: 'Settings',     path: '/settings',  icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-gray-100 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800
          flex flex-col pt-6 pb-6 px-4 shrink-0 font-sans
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0'}
          ${isSidebarHidden ? 'lg:-translate-x-full lg:w-0 lg:overflow-hidden lg:opacity-0 lg:p-0'
            : isSidebarCollapsed ? 'lg:w-[4.5rem] lg:px-2' : 'lg:w-64'}
        `}
      >
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6 px-2">
          <span className="font-bold text-xl text-brand-primary">Cloud Drive</span>
          <button onClick={closeSidebar}>
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              title={isSidebarCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-md font-bold transition-all overflow-hidden
                ${isActive
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={20}
                    className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`}
                  />
                  <span
                    className={`truncate transition-all duration-300 ${
                      isSidebarCollapsed ? 'lg:hidden' : ''
                    }`}
                  >
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700 mt-4">
            <NavLink
              to="/vault"
              onClick={closeSidebar}
              title={isSidebarCollapsed ? 'Secure Vault' : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-md font-bold transition-all overflow-hidden
                ${isActive
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Lock
                    size={20}
                    className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`}
                  />
                  <span className={`truncate transition-all duration-300 ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
                    Secure Vault
                  </span>
                </>
              )}
            </NavLink>
          </div>

          {/* Dark Mode Toggle */}
          <div
            className={`px-3 mt-4 flex items-center font-bold text-gray-400 dark:text-gray-500
              ${isSidebarCollapsed ? 'lg:justify-center' : 'justify-between'}
            `}
          >
            <span className={`${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-12 h-6 bg-gray-200 dark:bg-slate-700 rounded-full relative cursor-pointer shadow-inner transition-colors shrink-0"
              aria-label="Toggle Dark Mode"
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDarkMode ? 'left-6' : 'left-0.5'
                }`}
              >
                {isDarkMode ? <Sun size={12} className="text-white" /> : <Moon size={12} className="text-white" />}
              </div>
            </button>
          </div>
        </nav>

        {/* Desktop Collapse Toggle Button */}
        <div className="hidden lg:flex mt-6 px-1 justify-end">
          <button
            onClick={toggleSidebarCollapse}
            className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white hover:bg-brand-secondary transition-colors shadow-md"
            aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            title={isSidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            {isSidebarCollapsed
              ? <ChevronRight size={16} />
              : <ChevronLeft size={16} />
            }
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
