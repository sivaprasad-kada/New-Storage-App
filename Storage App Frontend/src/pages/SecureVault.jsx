import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import FileDetailsPanel from '../components/FileDetailsPanel';
import { Lock, Fingerprint, Eye, ArrowLeft, Shield, Upload, Download, LayoutGrid, List, Info } from 'lucide-react';

const SecureVault = () => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // Persist view preference for vault
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('secureVaultView') || 'grid';
    });

    useEffect(() => {
        localStorage.setItem('secureVaultView', viewMode);
    }, [viewMode]);

    const handleUnlock = () => setIsUnlocked(true);
    const handleLock = () => setIsUnlocked(false);

    // Files data for unlocked view
    const securedFiles = [
        { name: 'Confidential_Contract.pdf', tags: ['legal', 'work'], size: '1.9 mb', modified: '29/12/23' },
        { name: 'Backup_Keys.txt', tags: ['personal', 'crypto'], size: '2 KB', modified: '29/12/23' },
        { name: 'Passport_Copy.jpg', tags: ['identity', 'travel'], size: '3.5 mb', modified: '29/12/23' },
        { name: 'Tax_Returns_2024.pdf', tags: ['finance'], size: '5.2 mb', modified: '29/12/23' },
    ];

    if (!isUnlocked) {
        return (
            <div className="fixed inset-0 z-50 bg-[#000080] dark:bg-[#000050] flex flex-col items-center justify-center text-white overflow-hidden transition-colors duration-300">
                {/* Header - Absolute Top Left */}
                <div className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2">
                    <div className="text-white">
                        {/* Modern Lock Logo */}
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight">Vault Access</span>
                </div>

                {/* Lock Content */}
                <div className="flex flex-col items-center max-w-sm sm:max-w-md w-full px-6">

                    {/* Lock Icon Box */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#0a0a4a] dark:bg-[#050530] rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-[#ffffff]/10 animate-float">
                        <Lock size={40} className="text-white sm:w-12 sm:h-12" fill="white" />
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center">Secure Vault</h1>
                    <p className="text-xs sm:text-sm font-medium opacity-80 mb-8 text-center px-4">Enter your PIN or use biometric authentication to access secured files.</p>

                    <div className="w-full space-y-4">
                        <button
                            onClick={handleUnlock}
                            className="w-full bg-[#0a0a4a] dark:bg-[#050530] border border-[#ffffff]/30 py-3 sm:py-4 rounded-lg flex items-center justify-center relative hover:bg-[#111155] transition-colors"
                        >
                            <span className="font-bold text-base sm:text-lg">ENTER PIN</span>
                            <Eye className="absolute right-4 sm:right-6 text-white/70" size={20} />
                        </button>

                        <button
                            onClick={handleUnlock}
                            className="w-full bg-white text-black font-bold py-3 sm:py-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-base sm:text-lg uppercase"
                        >
                            UNLOCK VAULT
                        </button>

                        <div className="flex items-center gap-4 text-xs font-bold text-white/60 my-2">
                            <div className="w-full h-[1px] bg-white/20"></div>
                            <span>OR</span>
                            <div className="w-full h-[1px] bg-white/20"></div>
                        </div>

                        <button
                            onClick={handleUnlock}
                            className="w-full bg-transparent border border-[#ffffff]/50 py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-white/5 transition-colors"
                        >
                            <Fingerprint size={24} />
                            <span className="font-bold text-sm">USE BIOMETRIC AUTHENTICATION</span>
                        </button>
                    </div>

                    <NavLink to="/dashboard" className="mt-8 sm:mt-12 bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/10">
                        <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[#000080]">
                            <ArrowLeft size={8} />
                        </span>
                        Back to Home
                    </NavLink>

                </div>
            </div>
        );
    }

    // Unlocked View
    return (
        <div className="space-y-6 dark:text-gray-200">

            <div className="flex items-center gap-2 mb-1">
                <NavLink to="/dashboard" className="font-bold flex items-center gap-2 text-black dark:text-white hover:underline">
                    <span className="w-6 h-6 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
                        <ArrowLeft size={14} />
                    </span>
                    Back to Home
                </NavLink>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Left Mini Sidebar for Vault */}
                <div className="w-full xl:w-72 shrink-0 space-y-4 sm:space-y-6 order-2 xl:order-1">

                    <div className="bg-green-400 dark:bg-green-600 rounded-xl p-4 text-white shadow-sm flex items-center gap-3">
                        <Lock size={32} className="text-white fill-white" />
                        <div>
                            <div className="uppercase text-xs font-bold opacity-80">status</div>
                            <div className="font-bold text-lg">Unlocked</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm space-y-2">
                        <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300">
                            <span>Secured Files:</span>
                            <span>4</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300">
                            <span>Total Size:</span>
                            <span>25.65 MB</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLock}
                        className="w-full bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-red-200 dark:border-red-900 shadow-sm transition-colors"
                    >
                        <Lock size={18} fill="currentColor" /> Lock Vault
                    </button>
                </div>

                {/* Main Vault Content */}
                <div className="flex-1 order-1 xl:order-2">
                    <div className="mb-6">
                        <h1 className="text-3xl sm:text-4xl font-normal text-black dark:text-white mb-1">Secure Vault</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">End-to-end encrypted file storage</p>
                    </div>

                    {/* Info Alert */}
                    <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-2xl p-4 sm:p-6 mb-8 flex gap-4 items-start">
                        <div className="pt-1 text-brand-primary">
                            <Shield size={28} fill="currentColor" className="opacity-20" stroke="currentColor" />
                        </div>
                        <div>
                            <h3 className="text-brand-primary font-bold text-lg mb-1">Your Files Are Protected</h3>
                            <p className="text-brand-primary/80 font-bold leading-relaxed text-sm">
                                All files in the vault are encrypted with AES-256. Only you
                                can access them with your credentials.
                            </p>
                        </div>
                    </div>

                    {/* Header with Toggle */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white">Secured Files</h3>
                        <div className="flex bg-white dark:bg-slate-800 rounded-full border border-brand-primary overflow-hidden">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1 px-4 transition-colors ${viewMode === 'list'
                                    ? 'bg-brand-primary text-white'
                                    : 'text-brand-primary hover:bg-brand-primary/10'}`}
                                aria-label="List View"
                            >
                                <List size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1 px-4 transition-colors ${viewMode === 'grid'
                                    ? 'bg-brand-primary text-white'
                                    : 'text-brand-primary hover:bg-brand-primary/10'}`}
                                aria-label="Grid View"
                            >
                                <LayoutGrid size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Files Grid/List */}
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8"
                        : "flex flex-col gap-3 mb-8"
                    }>
                        {securedFiles.map((file, i) => (
                            <div key={i} className={`
                                bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow
                                ${viewMode === 'list'
                                    ? 'flex items-center gap-4 min-h-[80px]'
                                    : 'flex flex-col min-h-[180px]'
                                }
                            `}>
                                {/* Icon & Header */}
                                <div className={`${viewMode === 'list' ? 'shrink-0' : 'mb-3'}`}>
                                    <div className="text-brand-primary mb-2">
                                        <Lock size={viewMode === 'list' ? 24 : 32} />
                                    </div>
                                    {viewMode === 'grid' && (
                                        <>
                                            <h4 className="font-bold text-black dark:text-white mb-1 truncate">{file.name}</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {file.tags.map((tag, t) => (
                                                    <span key={t} className="bg-brand-primary/10 text-brand-primary text-[10px] px-2 py-0.5 rounded-full font-medium uppercase">{tag}</span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* List View Details */}
                                {viewMode === 'list' && (
                                    <div className="flex-1 min-w-0 flex items-center justify-between gap-4">

                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-black dark:text-white mb-1 truncate">{file.name}</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {file.tags.map((tag, t) => (
                                                    <span key={t} className="bg-brand-primary/10 text-brand-primary text-[10px] px-2 py-0.5 rounded-full font-medium uppercase">{tag}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-6 shrink-0 text-xs font-bold text-gray-700 dark:text-gray-300">
                                            <span className="hidden sm:inline">{file.size}</span>
                                            <span className="hidden sm:inline">{file.modified}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-4 items-center shrink-0">
                                            <button
                                                onClick={() => setSelectedFile(file)}
                                                className="flex items-center gap-1 text-xs font-bold text-black dark:text-white hover:underline"
                                            >
                                                <Info size={12} className="text-gray-500 dark:text-gray-400" /> Details
                                            </button>
                                            <button className="flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline">
                                                <Download size={12} /> <span className="hidden sm:inline">Download</span>
                                            </button>
                                        </div>

                                    </div>
                                )}

                                {/* Grid View Meta & Actions */}
                                {viewMode === 'grid' && (
                                    <div className="mt-auto space-y-1">
                                        <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700 pb-1">
                                            <span>Size</span>
                                            <span className="font-normal">{file.size}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700 pb-1">
                                            <span>Modified</span>
                                            <span className="font-normal">{file.modified}</span>
                                        </div>

                                        <div className="flex justify-between items-center pt-2">
                                            <button
                                                onClick={() => setSelectedFile(file)}
                                                className="flex items-center gap-1 text-xs font-bold text-black dark:text-white hover:underline"
                                            >
                                                <Info size={12} className="text-gray-500 dark:text-gray-400" /> Details
                                            </button>
                                            <button className="flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline">
                                                <Download size={12} /> Download
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <button className="bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 rounded-lg font-bold inline-flex items-center gap-2 shadow-lg transition-colors">
                            <Upload size={20} /> Upload File to Vault
                        </button>
                    </div>

                </div>
            </div>

            {/* File Details Panel */}
            <FileDetailsPanel
                file={selectedFile}
                isOpen={!!selectedFile}
                onClose={() => setSelectedFile(null)}
            />

        </div>
    );
};

export default SecureVault;
