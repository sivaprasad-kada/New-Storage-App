import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Menu, ChevronDown, Check, LogOut, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { toggleSidebar } = useTheme();
    const navigate = useNavigate();
    const [searchFocus, setSearchFocus] = useState(false);
    const [searchMode, setSearchMode] = useState('Normal Search');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);
    const userMenuRef = useRef(null);
    const notificationRef = useRef(null);

    useEffect(() => {
        // Fetch User Data
        const fetchUser = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user/`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                console.error("Failed to fetch user", error);
            }
        };

        const fetchNotifications = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/notifications`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        fetchUser();
        fetchNotifications();
    }, []);

    // Close dropdowns on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchModeSelect = (mode) => {
        setSearchMode(mode);
        setIsDropdownOpen(false);
    };

    const handleLogout = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok || res.status === 204) {
                navigate('/auth');
            }
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            try {
                await fetch(`${import.meta.env.VITE_BASE_URL}/api/notifications/${notif._id}/read`, {
                    method: 'PATCH',
                    credentials: 'include'
                });
                setNotifications(notifications.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
            } catch (error) {
                console.error(error);
            }
        }
        navigate('/shared?tab=withMe');
        setIsNotificationOpen(false);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <header className="h-20 px-4 sm:px-8 flex items-center justify-between shrink-0 bg-gray-50 dark:bg-slate-900 border-b border-transparent transition-colors duration-300">

            {/* Mobile Menu & Brand */}
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 dark:text-gray-300">
                    <Menu size={24} />
                </button>

                <div className="flex items-center gap-2">
                    <div className="text-brand-primary">
                        {/* Refined Geometric Logo Object */}
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-sm">
                            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="var(--color-brand-primary)" opacity="0.2" />
                            <path d="M12 22V12M12 22L2 17M12 22L22 17" stroke="var(--color-brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 7L12 12L22 7" stroke="var(--color-brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 2V12" stroke="var(--color-brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="3" fill="var(--color-brand-primary)" />
                        </svg>
                    </div>
                    <span className="hidden sm:block text-2xl sm:text-3xl font-extrabold text-brand-primary tracking-tight font-mono">Cloud Drive</span>
                </div>
            </div>

            {/* Search Bar - Responsive */}
            <div className="flex-1 max-w-2xl mx-4 sm:mx-12 relative z-20" ref={dropdownRef}>
                <div className={`relative transition-all duration-200 ${searchFocus ? 'scale-105' : ''}`}>
                    <div className="flex items-center w-full bg-white dark:bg-slate-800 rounded-full border border-brand-primary px-4 py-2 shadow-sm transition-colors">
                        <Search className="text-gray-400 ml-2 shrink-0" size={20} />
                        <input
                            type="text"
                            placeholder={`Search by ${searchMode}...`}
                            onFocus={() => setSearchFocus(true)}
                            onBlur={() => setSearchFocus(false)}
                            className="w-full bg-transparent border-none focus:outline-none px-4 text-gray-600 dark:text-gray-200 placeholder:text-gray-400 text-sm sm:text-base min-w-0"
                        />

                        {/* Dropdown Trigger */}
                        <div className="border-l border-gray-300 dark:border-slate-600 pl-2 sm:pl-3 relative shrink-0">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-brand-primary transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">{searchMode}</span>
                                <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Search Dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <button
                                onClick={() => handleSearchModeSelect('Normal Search')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between text-gray-700 dark:text-gray-200"
                            >
                                Normal Search
                                {searchMode === 'Normal Search' && <Check size={14} className="text-brand-primary" />}
                            </button>
                            <button
                                onClick={() => handleSearchModeSelect('Semantic Search')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between text-gray-700 dark:text-gray-200"
                            >
                                Semantic Search
                                {searchMode === 'Semantic Search' && <Check size={14} className="text-brand-primary" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions & User Menu */}
            <div className="flex items-center gap-3 sm:gap-6 shrink-0 relative">
                <div className="relative" ref={notificationRef}>
                    <div 
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className="relative cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"
                    >
                        <Bell size={24} className="text-brand-primary fill-brand-primary dark:text-brand-primary" />
                        {unreadCount > 0 && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                                {unreadCount}
                            </div>
                        )}
                    </div>

                    {/* Notifications Dropdown */}
                    {isNotificationOpen && (
                        <div className="absolute top-full right-0 mt-3 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 z-50">
                            <div className="p-4 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <h4 className="font-bold text-black dark:text-white">Notifications</h4>
                            </div>
                            <div className="flex flex-col">
                                {notifications.length > 0 ? (
                                    notifications.map(notif => (
                                        <div 
                                            key={notif._id} 
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`p-4 border-b border-gray-50 dark:border-slate-700/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${!notif.isRead ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : ''}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {notif.senderId?.picture ? (
                                                    <img src={notif.senderId.picture} alt="Sender" className="w-6 h-6 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">
                                                        {notif.senderId?.name?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                                <span className="font-bold text-sm text-black dark:text-white">
                                                    {notif.senderId?.name || 'Someone'}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${!notif.isRead ? 'font-bold text-black dark:text-white' : 'font-medium text-gray-600 dark:text-gray-300'}`}>
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500 text-sm font-medium">
                                        No notifications
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div
                    ref={userMenuRef}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-brand-primary flex items-center justify-center text-brand-primary cursor-pointer hover:bg-brand-primary hover:text-white transition-all overflow-hidden relative">
                    {user?.picture ? (
                        <img
                            src={user.picture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <User size={20} className="sm:w-6 sm:h-6" />
                    )}
                </div>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                        {/* User Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                            <h4 className="font-bold text-black dark:text-white text-base truncate">{user?.name || 'User'}</h4>
                            <p className="text-sm text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                            <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-colors text-left">
                                <Settings size={18} className="text-gray-400" />
                                Settings
                            </button>
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors text-left">
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
