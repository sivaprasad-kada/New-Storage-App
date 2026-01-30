import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Theme state: 'blue' | 'red' | 'green' | 'purple'
    const [themeColor, setThemeColor] = useState(() => {
        return localStorage.getItem('themeColor') || 'blue';
    });

    // Dark mode state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('isDarkMode') === 'true';
    });

    // Mobile Menu State (Global layout)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Apply Theme Colors
    useEffect(() => {
        const root = document.documentElement;
        localStorage.setItem('themeColor', themeColor);

        const colors = {
            blue: { primary: '#0ea5e9', secondary: '#0284c7' }, // Sky-500, Sky-600
            red: { primary: '#ef4444', secondary: '#dc2626' },   // Red-500, Red-600
            green: { primary: '#22c55e', secondary: '#16a34a' }, // Green-500, Green-600
            purple: { primary: '#a855f7', secondary: '#9333ea' }, // Purple-500, Purple-600
        };

        const selected = colors[themeColor] || colors['blue'];
        root.style.setProperty('--color-brand-primary', selected.primary);
        root.style.setProperty('--color-brand-secondary', selected.secondary);
    }, [themeColor]);

    // Apply Dark Mode
    useEffect(() => {
        const root = document.documentElement;
        localStorage.setItem('isDarkMode', isDarkMode);

        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Sidebar visibility state (Desktop) - used when Details panel is open
    const [isSidebarHidden, setIsSidebarHidden] = useState(false);

    const toggleSidebar = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeSidebar = () => setIsMobileMenuOpen(false);

    // Explicitly hide sidebar (for details panel interaction)
    const setSidebarHidden = (hidden) => setIsSidebarHidden(hidden);

    return (
        <ThemeContext.Provider value={{
            themeColor,
            setThemeColor,
            isDarkMode,
            setIsDarkMode,
            isMobileMenuOpen,
            toggleSidebar,
            closeSidebar,
            isSidebarHidden,
            setSidebarHidden
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
