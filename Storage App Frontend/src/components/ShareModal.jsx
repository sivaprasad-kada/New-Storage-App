import React, { useState } from 'react';
import { X, Link, Copy, Check, Lock, Calendar, DownloadCloud, Globe } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, file, onShare }) => {
    const [accessType, setAccessType] = useState('public');
    const [permission, setPermission] = useState('view');
    const [expiresAt, setExpiresAt] = useState('');
    const [password, setPassword] = useState('');
    const [maxDownloads, setMaxDownloads] = useState('');
    const [email, setEmail] = useState('');
    
    const [shareData, setShareData] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inviteOptions, setInviteOptions] = useState(false);

    if (!isOpen) return null;

    const handleShare = async () => {
        setIsLoading(true);
        try {
            const data = await onShare({
                accessType: email ? 'private' : accessType,
                permission,
                expiresAt: expiresAt || null,
                password: email ? null : (password || null),
                maxDownloads: email ? null : (maxDownloads ? parseInt(maxDownloads) : null),
                email: email || null
            });
            setShareData(data);
        } catch (error) {
            if (error.message === "User not found") {
                setInviteOptions(true);
            } else {
                console.error(error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInviteEmail = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/share/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                credentials: 'include'
            });
            if (res.ok) alert("Invite sent via email!");
        } catch (error) {
            console.error(error);
        }
    };

    const signupUrl = `${window.location.origin}/auth`;
    const inviteMessage = `Hey! I'm using StorageApp. Sign up here: ${signupUrl}`;

    const handleWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(inviteMessage)}`, '_blank');
    };

    const handleInstagram = () => {
        navigator.clipboard.writeText(inviteMessage);
        alert("Invite text copied! Open Instagram to share.");
    };

    const handleCopy = () => {
        if (!shareData) return;
        const fullUrl = `${window.location.origin}${shareData.shareUrl}`;
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setShareData(null);
        setAccessType('public');
        setPermission('view');
        setExpiresAt('');
        setPassword('');
        setMaxDownloads('');
        setEmail('');
        setInviteOptions(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 relative">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-colors cursor-pointer"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold mb-1 text-black dark:text-white flex items-center gap-2">
                    <Link size={20} className="text-brand-primary" /> Share File
                </h3>
                <p className="text-sm font-bold text-gray-500 mb-6 truncate">{file?.name}</p>

                {inviteOptions ? (
                    <div className="space-y-6 text-center py-4">
                        <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Globe size={32} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-black dark:text-white">Email does not exist</h4>
                            <p className="text-sm font-medium text-gray-500">Would you like to invite them instead?</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleInviteEmail} className="w-full py-3 font-bold bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-black dark:text-white rounded-xl transition-colors">
                                Invite via Email
                            </button>
                            <button onClick={handleWhatsApp} className="w-full py-3 font-bold bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-colors">
                                Share via WhatsApp
                            </button>
                            <button onClick={handleInstagram} className="w-full py-3 font-bold bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-xl transition-colors">
                                Share via Instagram
                            </button>
                        </div>
                    </div>
                ) : !shareData ? (
                    <div className="space-y-4">
                        {/* Settings Form */}
                        <div className="space-y-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Globe size={12}/> Shared With (Email)</label>
                                <input 
                                    type="email" 
                                    placeholder="Enter email address (optional)"
                                    className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium dark:text-white outline-none focus:border-brand-primary"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (e.target.value) {
                                            // Clear password and maxDownloads for private shares
                                            setPassword('');
                                            setMaxDownloads('');
                                        }
                                    }}
                                />
                                {email && (
                                    <p className="text-xs font-medium text-brand-primary mt-0.5">
                                        Private share — file will be shared directly with this user.
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Permission</label>
                                <select 
                                    className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium dark:text-white outline-none focus:border-brand-primary"
                                    value={permission}
                                    onChange={(e) => setPermission(e.target.value)}
                                >
                                    <option value="view">Can View</option>
                                    <option value="edit">Can Edit</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Calendar size={12}/> Expiry Date (Optional)</label>
                                <input 
                                    type="datetime-local" 
                                    className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium dark:text-white outline-none focus:border-brand-primary"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                />
                            </div>

                            {/* Password and Max Downloads — only for public/link shares, NOT for email (private) shares */}
                            {!email && (
                                <>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Lock size={12}/> Password (Optional)</label>
                                        <input 
                                            type="password" 
                                            placeholder="Set a password..."
                                            className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium dark:text-white outline-none focus:border-brand-primary"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><DownloadCloud size={12}/> Max Downloads (Optional)</label>
                                        <input 
                                            type="number" 
                                            placeholder="e.g. 5"
                                            min="1"
                                            className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium dark:text-white outline-none focus:border-brand-primary"
                                            value={maxDownloads}
                                            onChange={(e) => setMaxDownloads(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleShare}
                            disabled={isLoading}
                            className="w-full py-3 mt-4 font-bold bg-brand-primary text-white rounded-xl shadow-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? (email ? 'Sharing...' : 'Generating Link...') : (email ? 'Share with User' : 'Generate Share Link')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 text-center py-4">
                        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={32} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-black dark:text-white">Link Generated!</h4>
                            {shareData?.directShare ? (
                                <p className="text-sm font-medium text-gray-500">File shared successfully with {email}.</p>
                            ) : (
                                <p className="text-sm font-medium text-gray-500">Anyone with this link can {permission} this file.</p>
                            )}
                        </div>

                        {!shareData?.directShare && (
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 p-2 rounded-xl border border-gray-200 dark:border-slate-700">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={`${window.location.origin}${shareData.shareUrl}`} 
                                    className="bg-transparent flex-1 outline-none text-sm font-medium px-2 dark:text-white text-gray-600 truncate"
                                />
                                <button 
                                    onClick={handleCopy}
                                    className="bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 p-2 rounded-lg border border-gray-200 dark:border-slate-600 transition-colors shrink-0 cursor-pointer"
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-black dark:text-white" />}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareModal;
