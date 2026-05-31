import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, LogOut, Brush, Check, ShieldAlert, Crown, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

const Settings = () => {
    const { themeColor, setThemeColor, themeLoading } = useTheme();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [themeError, setThemeError] = useState('');
    const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);

    const themes = [
        { id: 'blue',   color: '#0ea5e9', name: 'Sky Blue',  premium: false },
        { id: 'red',    color: '#ef4444', name: 'Red',       premium: true },
        { id: 'green',  color: '#22c55e', name: 'Green',     premium: true },
        { id: 'purple', color: '#a855f7', name: 'Purple',    premium: true },
    ];

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user/`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                console.error("Failed to fetch user", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_BASE_URL}/user/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            navigate('/auth', { replace: true });
        }
    };

    const handleThemeSelect = async (themeId) => {
        if (isUpdatingTheme) return;
        setThemeError('');
        setIsUpdatingTheme(true);
        const result = await setThemeColor(themeId);
        setIsUpdatingTheme(false);
        if (!result.success) {
            if (result.status === 403) {
                setShowUpgradeModal(true);
            } else {
                setThemeError(result.error || 'Failed to update theme');
            }
        }
    };

    const confirmLogoutAll = () => {
        setShowLogoutAllModal(true);
    };

    const executeLogoutAll = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user/logoutAll`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok || res.status === 204) {
                navigate('/auth');
            }
        } catch (error) {
            console.error("Logout All failed", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

    return (
        <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto dark:text-white pb-20">
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-black dark:text-white mb-1">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">Manage your profile, themes, and security</p>
            </div>

                {/* Theme Selection Section */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
                <div className="flex items-center gap-2 mb-6">
                    <Brush className="text-brand-primary" size={24} />
                    <h2 className="text-2xl font-bold text-black dark:text-white">Appearance</h2>
                    {themeLoading && <span className="text-xs text-gray-400 ml-2 animate-pulse">Loading...</span>}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {themes.map((theme) => {
                        const isPremiumLocked = theme.premium && user?.plan !== 'pro';
                        return (
                            <button
                                key={theme.id}
                                onClick={() => handleThemeSelect(theme.id)}
                                disabled={isUpdatingTheme}
                                className={`
                                    relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all
                                    ${themeColor === theme.id ? 'border-brand-primary bg-brand-primary/5 dark:bg-white/5' : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-700'}
                                    ${isUpdatingTheme ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                {/* Premium Crown badge */}
                                {isPremiumLocked && (
                                    <div className="absolute top-2 right-2">
                                        <Crown size={14} className="text-amber-500" />
                                    </div>
                                )}
                                <div
                                    className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-transform hover:scale-110 relative"
                                    style={{ backgroundColor: theme.color }}
                                >
                                    {themeColor === theme.id && <Check className="text-white" size={20} />}
                                    {isPremiumLocked && themeColor !== theme.id && (
                                        <Lock size={14} className="text-white/80" />
                                    )}
                                </div>
                                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{theme.name}</span>
                                {isPremiumLocked && (
                                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Pro</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {themeError && (
                    <p className="text-red-500 text-sm font-medium mt-3">{themeError}</p>
                )}

                <p className="text-xs text-gray-400 mt-4 font-medium">
                    🔒 Premium themes are validated server-side. Upgrade to Pro to unlock all colors.
                </p>
            </div>

            {/* Profile Section */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-6">User Profile</h2>

                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-brand-primary/20">
                            <img
                                src={user?.picture || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        {/*              <button className="absolute bottom-0 right-0 w-10 h-10 bg-brand-primary rounded-full text-white flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm hover:bg-brand-secondary transition-colors">
                            <Camera size={18} />
                        </button> */}
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={user?.name || ''}
                                readOnly
                                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logout */}
                <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-6 border border-red-100 dark:border-red-900/20 transition-colors">
                    <div className="flex flex-col items-start gap-4 h-full justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mb-1">Logout</h3>
                            <p className="text-red-700/70 dark:text-red-400/70 text-sm font-medium">End your current session safely.</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                        >
                            <LogOut size={20} /> Logout
                        </button>
                    </div>
                </div>

                {/* Logout All */}
                <div className="bg-orange-50 dark:bg-orange-900/10 rounded-3xl p-6 border border-orange-100 dark:border-orange-900/20 transition-colors">
                    <div className="flex flex-col items-start gap-4 h-full justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-orange-900 dark:text-orange-400 mb-1">Emergency Logout</h3>
                            <p className="text-orange-700/70 dark:text-orange-400/70 text-sm font-medium">Sign out from all devices immediately.</p>
                        </div>
                        <button
                            onClick={confirmLogoutAll}
                            className="w-full bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                        >
                            <ShieldAlert size={20} /> Logout Everyone
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showLogoutAllModal}
                onClose={() => setShowLogoutAllModal(false)}
                onConfirm={executeLogoutAll}
                title="Logout All Devices?"
                message="This will sign you out from all active sessions on computers, tablets, and phones. You will need to log in again."
                confirmText="Logout Everyone"
                isDanger={true}
            />

            {/* Upgrade Modal for Premium Themes */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Crown className="text-white" size={32} />
                        </div>
                        <h3 className="text-2xl font-extrabold mb-3 text-black dark:text-white">Pro Themes</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-8 font-medium">
                            Premium color themes are exclusively available on the <strong>Pro plan</strong>. Upgrade to unlock full customization.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => { setShowUpgradeModal(false); navigate('/payment'); }}
                                className="w-full py-4 font-bold bg-amber-500 text-white rounded-xl shadow-md hover:bg-amber-600 transition-colors text-lg"
                            >
                                Upgrade to Pro
                            </button>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="w-full py-4 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Settings;
