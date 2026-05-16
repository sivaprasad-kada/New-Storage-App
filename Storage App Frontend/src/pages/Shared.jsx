import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, FileText, Download, Link as LinkIcon, DownloadCloud, Eye, Trash2, ShieldAlert, Edit3, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Shared = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [activeTab, setActiveTab] = useState('byMe');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('tab') === 'withMe') {
            setActiveTab('withMe');
        }
    }, [location.search]);

    const [copiedId, setCopiedId] = useState(null);
    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const fetchShares = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'byMe' ? '/api/share/my' : '/api/share/shared-with-me';
            const response = await fetch(`${BASE_URL}${endpoint}`, { credentials: "include" });
            if (response.status === 401) {
                navigate("/auth");
                return;
            }
            if (response.ok) {
                const data = await response.json();
                setShares(data.shares || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShares();
    }, [activeTab]);

    const handleCopy = (token) => {
        const fullUrl = `${window.location.origin}/s/${token}`;
        navigator.clipboard.writeText(fullUrl);
        setCopiedId(token);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleRevoke = async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/share/${token}/revoke`, {
                method: "PATCH",
                credentials: "include"
            });
            if (response.ok) {
                fetchShares();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteShare = async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/share/${token}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (response.ok) {
                setShares(shares.filter(s => s.shareToken !== token));
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Failed to delete share");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Remove from "Shared With Me" (soft-remove, does NOT delete file)
    const handleRemoveFromSharedWithMe = async (shareId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/share/remove-from-shared-with-me/${shareId}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (response.ok) {
                setShares(prev => prev.filter(s => s._id !== shareId));
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Failed to remove");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Remove from "Shared By Me" (soft-remove, does NOT delete file)
    const handleRemoveFromSharedByMe = async (shareId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/share/remove-from-shared-by-me/${shareId}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (response.ok) {
                setShares(prev => prev.filter(s => s._id !== shareId));
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Failed to remove");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Rename file (works globally — reflects for owner and all shared users)
    const handleRename = async (fileId) => {
        if (!renameValue.trim()) return;
        try {
            const response = await fetch(`${BASE_URL}/api/files/rename/${fileId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ newFilename: renameValue.trim() })
            });
            if (response.ok) {
                const data = await response.json();
                setShares(prev => prev.map(s => {
                    if (s.fileId?._id === fileId) {
                        return { ...s, fileId: { ...s.fileId, name: data.name } };
                    }
                    return s;
                }));
                setRenamingId(null);
                setRenameValue('');
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Failed to rename");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Download shared file
    const handleDownload = async (fileId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/files/download/${fileId}`, {
                credentials: "include"
            });
            if (response.ok) {
                const data = await response.json();
                // Open the signed URL in a new tab to trigger download
                window.open(data.fileUrl, '_blank');
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Failed to download");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleGenerateLink = () => {
        navigate('/my-files');
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-black dark:text-white mb-1">Shared Files</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">Access files shared with you or by you</p>
                </div>

                <div className="bg-gray-200 dark:bg-slate-800 p-1 rounded-xl flex gap-1 font-bold w-full sm:w-fit">
                    <button
                        onClick={() => setActiveTab('withMe')}
                        className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 rounded-lg transition-all text-xs sm:text-sm ${activeTab === 'withMe'
                            ? 'bg-white dark:bg-slate-600 text-brand-primary shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Shared with me
                    </button>
                    <button
                        onClick={() => setActiveTab('byMe')}
                        className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 rounded-lg transition-all text-xs sm:text-sm ${activeTab === 'byMe'
                            ? 'bg-white dark:bg-slate-600 text-brand-primary shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Shared by me
                    </button>
                </div>
            </div>

            {/* Share Link Generation Card */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-lg mb-6 sm:mb-8 relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Share your memories instantly</h3>
                        <p className="text-white/90 font-medium max-w-lg text-sm sm:text-base">Generate a secure, time-limited link for your photos and videos to share with friends and family.</p>
                    </div>
                    <button onClick={() => handleGenerateLink()} className="bg-white text-brand-primary px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2 shrink-0 text-sm sm:text-base">
                        <LinkIcon size={18} /> Generate Link
                    </button>
                </div>
                <Share2 className="absolute -bottom-8 -right-8 text-white/20 w-36 h-36 sm:w-48 sm:h-48 rotate-12" />
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                </div>
            )}

            {/* Files Grid */}
            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {shares.length > 0 ? (
                        shares.map((share) => {
                            const file = share.fileId;
                            const isExpired = share.expiresAt && new Date(share.expiresAt) < new Date();
                            const isRevoked = share.isRevoked;
                            const maxDownloadsReached = share.maxDownloads && share.downloadCount >= share.maxDownloads;
                            const isActive = !isExpired && !isRevoked && !maxDownloadsReached;
                            const isRenaming = renamingId === share._id;

                            return (
                                <div key={share._id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm flex flex-col group min-h-[220px] hover:shadow-md transition-shadow relative">

                                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                                        {isActive ? (
                                            <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-green-200">Active</span>
                                        ) : (
                                            <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-red-200">
                                                {isRevoked ? 'Revoked' : isExpired ? 'Expired' : 'Limit Reached'}
                                            </span>
                                        )}
                                        {share.password && <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-orange-200"><ShieldAlert size={10} className="inline mr-1" />Protected</span>}
                                    </div>

                                    {/* Thumbnail / Icon Area */}
                                    <div className="mb-4 h-32 sm:h-24 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden relative cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600" onClick={() => window.open(`/s/${share.shareToken}`, '_blank')}>
                                        <div className="text-brand-primary flex flex-col items-center">
                                            <FileText size={40} />
                                            <span className="text-xs mt-2 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"><Eye size={12}/> View</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        {/* File Name / Rename UI */}
                                        {isRenaming ? (
                                            <div className="flex items-center gap-1 mb-1">
                                                <input
                                                    type="text"
                                                    value={renameValue}
                                                    onChange={(e) => setRenameValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleRename(file?._id);
                                                        if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
                                                    }}
                                                    className="flex-1 text-sm font-bold border border-brand-primary rounded-lg px-2 py-1 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/30"
                                                    autoFocus
                                                />
                                                <button onClick={() => handleRename(file?._id)} className="text-green-600 hover:text-green-700 p-1">
                                                    <Check size={14} />
                                                </button>
                                                <button onClick={() => { setRenamingId(null); setRenameValue(''); }} className="text-gray-400 hover:text-gray-600 p-1">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <h4 className="font-bold text-black dark:text-white text-sm truncate mb-1" title={file?.name}>{file?.name || 'Deleted File'}</h4>
                                        )}

                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 space-y-1">
                                            <p>Downloads: {share.downloadCount} {share.maxDownloads ? `/ ${share.maxDownloads}` : ''}</p>
                                            <p>Created: {new Date(share.createdAt).toLocaleDateString()}</p>
                                            {share.expiresAt && <p>Expires: {new Date(share.expiresAt).toLocaleDateString()}</p>}
                                            {activeTab === 'withMe' && share.ownerId && <p>Owner: {share.ownerId.name || share.ownerId.email}</p>}
                                            {activeTab === 'byMe' && share.receiverEmail && <p>Shared with: {share.receiverEmail}</p>}
                                            {activeTab === 'byMe' && share.receiverId && !share.receiverEmail && (
                                                <p>Shared with: {share.receiverId.name || share.receiverId.email}</p>
                                            )}
                                            {share.permission && <p>Permission: <span className={`uppercase font-bold ${share.permission === 'edit' ? 'text-blue-500' : 'text-gray-500'}`}>{share.permission}</span></p>}
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-slate-700 gap-1 flex-wrap">
                                            {/* Remove Button */}
                                            {activeTab === 'byMe' ? (
                                                <button
                                                    onClick={() => handleRemoveFromSharedByMe(share._id)}
                                                    className="text-xs font-bold flex items-center gap-1 transition-colors text-red-500 hover:text-red-600 cursor-pointer"
                                                    title="Remove from your shared list"
                                                >
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleRemoveFromSharedWithMe(share._id)}
                                                    className="text-xs font-bold flex items-center gap-1 transition-colors text-red-500 hover:text-red-600 cursor-pointer"
                                                    title="Remove from your view (file is not deleted)"
                                                >
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2">
                                                {/* Rename (only for edit permission or owner) */}
                                                {(activeTab === 'byMe' || share.permission === 'edit') && file && (
                                                    <button
                                                        onClick={() => { setRenamingId(share._id); setRenameValue(file.name || ''); }}
                                                        className="text-xs font-bold flex items-center gap-1 transition-colors text-amber-500 hover:text-amber-600 cursor-pointer"
                                                        title="Rename file"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                )}

                                                {/* Download */}
                                                {file && (
                                                    <button
                                                        onClick={() => handleDownload(file._id)}
                                                        className="text-xs font-bold flex items-center gap-1 transition-colors text-emerald-500 hover:text-emerald-600 cursor-pointer"
                                                        title="Download file"
                                                    >
                                                        <Download size={14} />
                                                    </button>
                                                )}

                                                {/* Copy Link */}
                                                <button
                                                    onClick={() => handleCopy(share.shareToken)}
                                                    className={`text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${copiedId === share.shareToken ? 'text-green-600' : 'text-brand-primary hover:text-brand-secondary'}`}
                                                >
                                                    {copiedId === share.shareToken ? <Check size={14} /> : <Copy size={14} />}
                                                    {copiedId === share.shareToken ? 'Copied' : 'Copy'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 font-bold bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            {activeTab === 'byMe' ? "You haven't shared any files yet." : "No files shared with you yet."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Shared;
