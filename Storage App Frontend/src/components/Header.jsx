import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Bell, User, Menu, ChevronDown, Check, LogOut, Settings, File, Folder, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AlertModal from './AlertModal';
import { PLAN_FEATURES } from '../utils/planFeatures';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const Header = () => {
    const { toggleSidebar } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchFocus, setSearchFocus] = useState(false);
    const [searchMode, setSearchMode] = useState('Folder Search');
    const [query, setQuery] = useState('');
    const [folderFiles, setFolderFiles] = useState([]);
    const [globalFiles, setGlobalFiles] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const dropdownRef = useRef(null);
    const userMenuRef = useRef(null);
    const notificationRef = useRef(null);
    const searchContainerRef = useRef(null);

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

    // Determine current folder ID
    const currentFolderId = useMemo(() => {
        const dirMatch = location.pathname.match(/\/directory\/([a-f0-9]{24})/);
        return dirMatch ? dirMatch[1] : user?.rootDirId;
    }, [location.pathname, user?.rootDirId]);

    // Fetch folder files once when folder opens
    useEffect(() => {
        if (searchMode === 'Folder Search' && currentFolderId) {
            const fetchFolderFiles = async () => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/files/folder/${currentFolderId}`, { credentials: 'include' });
                    if (res.ok) {
                        const data = await res.json();
                        setFolderFiles(data.files || []);
                    }
                } catch(e) {
                    console.error("Folder fetch error", e);
                }
            };
            fetchFolderFiles();
        }
    }, [currentFolderId, searchMode]);

    const debouncedQuery = useDebounce(query, 500);

    // Global search effect
    useEffect(() => {
        if (searchMode === 'Global Search' && debouncedQuery.trim().length > 0) {
            const fetchSearch = async () => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/search/global?q=${encodeURIComponent(debouncedQuery.trim())}`, { credentials: 'include' });
                    if (res.ok) {
                        const data = await res.json();
                        setGlobalFiles(data.files || []);
                    } else if (res.status === 403) {
                        setShowPremiumModal(true);
                        setSearchMode('Folder Search'); // fallback
                    }
                } catch(e) {
                    console.error(e);
                } finally {
                    setIsSearching(false);
                }
            };
            fetchSearch();
        } else if (searchMode === 'Global Search' && debouncedQuery.trim().length === 0) {
            setGlobalFiles([]);
            setIsSearching(false);
        }
    }, [debouncedQuery, searchMode]);

    // Handle typing state
    useEffect(() => {
        if (searchMode === 'Global Search' && query !== debouncedQuery && query.trim().length > 0) {
            setIsSearching(true);
        }
    }, [query, debouncedQuery, searchMode]);

    const filteredFolderFiles = useMemo(() => {
        if (!query) return [];
        return folderFiles.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
    }, [folderFiles, query]);

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
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setSearchFocus(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchModeSelect = (mode) => {
        const hasGlobalSearch = PLAN_FEATURES[user?.plan?.toLowerCase() || 'free']?.globalSearch;
        
        if (mode === 'Global Search' && !hasGlobalSearch) {
            setShowPremiumModal(true);
            setIsDropdownOpen(false);
            return;
        }
        setSearchMode(mode);
        setIsDropdownOpen(false);
        setQuery('');
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        // Close all menus immediately
        setIsUserMenuOpen(false);
        setIsNotificationOpen(false);
        setIsDropdownOpen(false);

        try {
            await fetch(`${import.meta.env.VITE_BASE_URL}/user/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            // Always navigate to auth regardless of server response
            setIsLoggingOut(false);
            navigate('/auth', { replace: true });
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

    const showResults = searchFocus && query.length > 0;
    const searchResults = searchMode === 'Folder Search' ? filteredFolderFiles : globalFiles;

    const HighlightMatch = ({ text }) => {
        if (!query) return <span>{text}</span>;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) => 
                    part.toLowerCase() === query.toLowerCase() 
                    ? <span key={i} className="bg-brand-primary/20 text-brand-primary rounded px-0.5">{part}</span> 
                    : part
                )}
            </span>
        );
    };

    return (
        <header className="h-16 sm:h-20 px-3 sm:px-6 flex items-center justify-between shrink-0 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors duration-300 gap-2">
            {/* Mobile Menu & Brand - ALWAYS visible */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 dark:text-gray-300 shrink-0 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <Menu size={22} />
                </button>

                <div className="flex items-center gap-2 shrink-0">
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
                    <span className="hidden sm:block text-2xl sm:text-3xl font-extrabold text-brand-primary tracking-tight font-mono whitespace-nowrap">Cloud Drive</span>
                </div>
            </div>

            {/* Search Bar - hidden on mobile, visible from sm */}
            <div className={`hidden sm:flex flex-1 max-w-2xl transition-all duration-300 relative z-20 ${searchFocus ? 'mx-0' : 'mx-4 lg:mx-12'}`} ref={searchContainerRef}>
                <div className={`relative transition-all duration-200 ${searchFocus ? 'scale-100 sm:scale-105' : 'scale-100'}`}>
                    <div className="flex items-center w-full bg-white dark:bg-slate-800 rounded-full border border-brand-primary px-2 sm:px-4 py-2 shadow-sm transition-colors">
                        <Search className="text-gray-400 ml-1 sm:ml-2 shrink-0" size={18} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`Search by ${searchMode}...`}
                            onFocus={() => setSearchFocus(true)}
                            className="w-full bg-transparent border-none focus:outline-none px-4 text-gray-600 dark:text-gray-200 placeholder:text-gray-400 text-sm sm:text-base min-w-0"
                        />

                        {/* Dropdown Trigger */}
                        <div className="border-l border-gray-300 dark:border-slate-600 pl-2 sm:pl-3 relative shrink-0" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-brand-primary transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">{searchMode}</span>
                                <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Search Dropdown */}
                            {isDropdownOpen && (
                                <div className="absolute top-full right-0 mt-4 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <button
                                        onClick={() => handleSearchModeSelect('Folder Search')}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between text-gray-700 dark:text-gray-200"
                                    >
                                        Folder Search
                                        {searchMode === 'Folder Search' && <Check size={14} className="text-brand-primary" />}
                                    </button>
                                    <button
                                        onClick={() => handleSearchModeSelect('Global Search')}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between text-gray-700 dark:text-gray-200"
                                    >
                                        Global Search
                                        {searchMode === 'Global Search' && <Check size={14} className="text-brand-primary" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="p-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {searchMode === 'Folder Search' ? 'Current Folder' : 'All Files'}
                                </span>
                                {isSearching && <span className="text-xs text-brand-primary animate-pulse">Searching...</span>}
                            </div>
                            
                            {searchResults.length === 0 && !isSearching ? (
                                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                    <Search className="mb-2 text-gray-300" size={32} />
                                    <p className="font-medium text-sm">No results found for "{query}"</p>
                                </div>
                            ) : (
                                <div className="p-2 space-y-1">
                                    {searchResults.map(file => (
                                        <div 
                                            key={file._id}
                                            onMouseDown={() => {
                                                if (file.type === 'folder' || file.isDirectory) {
                                                    navigate(`/directory/${file._id}`);
                                                } else {
                                                    window.open(`${import.meta.env.VITE_BASE_URL}/file/${file._id}`, '_blank');
                                                }
                                                setSearchFocus(false);
                                            }}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors group w-full"
                                        >
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                                                {(file.type === 'folder' || file.isDirectory) ? <Folder size={18} /> : (file.type === 'image' ? <ImageIcon size={18} /> : <File size={18} />)}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-2">
                                                <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-xs sm:text-sm">
                                                    <HighlightMatch text={file.name} />
                                                </p>
                                                {searchMode === 'Global Search' && (
                                                    <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
                                                        <Folder size={10} className="shrink-0" /> <span className="truncate">{file.folderId === user?.rootDirId ? 'My Cloud' : 'Nested Folder'}</span>
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-[10px] sm:text-xs text-gray-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shrink-0">
                                                {file.type === 'folder' ? 'Folder' : `${(file.size / 1024).toFixed(1)} KB`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions & User Menu */}
            <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 relative">
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
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors text-left disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <LogOut size={18} className={isLoggingOut ? 'animate-spin' : ''} />
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Upgrade Modal */}
            {showPremiumModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Search className="text-white" size={32} />
                        </div>
                        <h3 className="text-2xl font-extrabold mb-3 text-black dark:text-white">Unlock Global Search</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-8 font-medium">
                            Search across all your folders instantly. Upgrade to Premium to unlock this feature and more!
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    setShowPremiumModal(false);
                                    navigate('/payment');
                                }}
                                className="w-full py-4 font-bold bg-brand-primary text-white rounded-xl shadow-md hover:bg-brand-secondary transition-colors text-lg"
                            >
                                Upgrade Now
                            </button>
                            <button
                                onClick={() => setShowPremiumModal(false)}
                                className="w-full py-4 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
