import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const BASE_URL = import.meta.env.VITE_BASE_URL;

const THEME_COLORS = {
  blue:   { primary: '#0ea5e9', secondary: '#0284c7' },
  red:    { primary: '#ef4444', secondary: '#dc2626' },
  green:  { primary: '#22c55e', secondary: '#16a34a' },
  purple: { primary: '#a855f7', secondary: '#9333ea' },
};

function applyTheme(color) {
  const selected = THEME_COLORS[color] || THEME_COLORS.blue;
  document.documentElement.style.setProperty('--color-brand-primary', selected.primary);
  document.documentElement.style.setProperty('--color-brand-secondary', selected.secondary);
}

export const ThemeProvider = ({ children }) => {
  // Theme fetched securely from backend – NOT localStorage
  const [themeColor, setThemeColorState] = useState('blue');
  const [themeLoading, setThemeLoading] = useState(true);

  // Dark mode is a UI preference only, localStorage is fine here
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('isDarkMode') === 'true';
  });

  // Mobile Menu State (Global layout)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Desktop sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sidebar visibility (for file details panel overlay)
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  // ─── Fetch theme from backend on mount ────────────────────────────────────
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await fetch(`${BASE_URL}/user/theme`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const serverTheme = data.theme || 'blue';
          setThemeColorState(serverTheme);
          applyTheme(serverTheme);
        }
      } catch (err) {
        console.error('Failed to fetch theme:', err);
        // Fallback to default blue on error
        applyTheme('blue');
      } finally {
        setThemeLoading(false);
      }
    };
    fetchTheme();
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(themeColor);
  }, [themeColor]);

  // ─── Secure theme setter: persists to backend ──────────────────────────────
  const setThemeColor = useCallback(async (newTheme) => {
    try {
      const res = await fetch(`${BASE_URL}/user/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
        credentials: 'include',
      });

      if (res.ok) {
        setThemeColorState(newTheme);
        applyTheme(newTheme);
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error, status: res.status };
      }
    } catch (err) {
      console.error('Failed to update theme:', err);
      return { success: false, error: 'Network error' };
    }
  }, []);

  // Apply Dark Mode
  useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => setIsMobileMenuOpen(prev => !prev);
  const closeSidebar = () => setIsMobileMenuOpen(false);
  const toggleSidebarCollapse = () => setIsSidebarCollapsed(prev => !prev);
  const setSidebarHidden = (hidden) => setIsSidebarHidden(hidden);

  return (
    <ThemeContext.Provider value={{
      themeColor,
      setThemeColor,
      themeLoading,
      isDarkMode,
      setIsDarkMode,
      isMobileMenuOpen,
      toggleSidebar,
      closeSidebar,
      isSidebarHidden,
      setSidebarHidden,
      isSidebarCollapsed,
      toggleSidebarCollapse,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
