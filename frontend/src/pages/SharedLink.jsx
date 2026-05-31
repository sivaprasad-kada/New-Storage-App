import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, Lock, CheckCircle, AlertTriangle, Eye, Folder, Image, Video, Music, Box } from 'lucide-react';

const SharedLink = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // loading, success, requires_password, error
    const [errorMsg, setErrorMsg] = useState('');
    const [fileData, setFileData] = useState(null);
    const [password, setPassword] = useState('');
    const [sharePermission, setSharePermission] = useState('view');
    const [fileUrl, setFileUrl] = useState('');
    const [verifying, setVerifying] = useState(false);

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const fetchShareData = async (pwd = '') => {
        try {
            setVerifying(true);
            const url = new URL(`${BASE_URL}/s/${token}`);
            if (pwd) url.searchParams.append('password', pwd);

            const response = await fetch(url.toString(), { credentials: "include" });
            const data = await response.json();

            if (response.status === 401 && data.requiresPassword) {
                setStatus('requires_password');
                if (data.file) setFileData(data.file); // might have just name
                return;
            }

            if (!response.ok) {
                setStatus('error');
                setErrorMsg(data.error || 'Failed to access link');
                return;
            }

            setFileData(data.file);
            setFileUrl(data.fileUrl);
            setSharePermission(data.share.permission);
            setStatus('success');
        } catch (err) {
            setStatus('error');
            setErrorMsg('Network error');
        } finally {
            setVerifying(false);
        }
    };

    useEffect(() => {
        fetchShareData();
    }, [token]);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        fetchShareData(password);
    };

    const trackDownload = async () => {
        try {
            await fetch(`${BASE_URL}/api/share/${token}/download`, { method: 'POST' });
        } catch (e) {
            console.error('Failed to track download', e);
        }
    };

    const handleDownload = () => {
        trackDownload();
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileData?.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getFileIcon = (category) => {
        if (category === 'image') return <Image size={64} className="text-purple-500" />;
        if (category === 'video') return <Video size={64} className="text-red-500" />;
        if (category === 'audio') return <Music size={64} className="text-yellow-500" />;
        if (category === 'archive') return <Box size={64} className="text-orange-500" />;
        return <FileText size={64} className="text-brand-primary" />;
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Link Unavailable</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{errorMsg}</p>
                </div>
            </div>
        );
    }

    if (status === 'requires_password') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock size={32} />
                    </div>
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Password Protected</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                            The file <span className="font-bold text-black dark:text-white">"{fileData?.name}"</span> requires a password to access.
                        </p>
                    </div>
                    
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-black dark:text-white outline-none focus:border-brand-primary transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={verifying}
                            className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-colors disabled:opacity-50"
                        >
                            {verifying ? 'Verifying...' : 'Access File'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-brand-primary tracking-tight">StorageApp</h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 dark:border-slate-700">
                    
                    {/* Preview / Icon */}
                    <div className="w-full h-48 bg-gray-50 dark:bg-slate-900 rounded-xl mb-6 flex items-center justify-center border border-gray-100 dark:border-slate-700 relative overflow-hidden group">
                        {fileData?.category === 'image' && fileUrl ? (
                            <img src={fileUrl} alt={fileData?.name} className="w-full h-full object-contain" />
                        ) : (
                            getFileIcon(fileData?.category)
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <button 
                                onClick={() => window.open(fileUrl, '_blank')}
                                className="bg-white text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                                <Eye size={18} /> Preview
                            </button>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-black dark:text-white mb-2 break-words">{fileData?.name}</h2>
                        <div className="flex items-center justify-center gap-4 text-sm font-bold text-gray-500">
                            <span className="uppercase tracking-wider">{fileData?.extension?.replace('.', '') || 'FILE'}</span>
                            <span>•</span>
                            <span>{fileData?.size ? (fileData.size / 1024).toFixed(1) + ' KB' : 'Unknown Size'}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    {sharePermission !== 'view' && (
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDownload}
                                className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-colors flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Download size={20} /> Download File
                            </button>
                        </div>
                    )}

                    <p className="text-center text-xs font-bold text-gray-400 mt-6">
                        Shared securely via StorageApp
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SharedLink;
