import React, { useEffect, useState } from 'react';
import { X, Download, Share2, Trash2, Info, FileText, Calendar, HardDrive, User, Tag, Image as ImageIcon, Video as VideoIcon, Music, Box, FileLineChart, Folder } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

const FileDetailsPanel = ({ file, isOpen, onClose, onDownload, onDelete, onShare, inline = false }) => {
    const [isVisible, setIsVisible] = useState(false);
    const { setSidebarHidden } = useTheme();

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setSidebarHidden(true); // Always hide sidebar when panel opens
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            setSidebarHidden(false);
            return () => clearTimeout(timer);
        }

        // Cleanup: ensure sidebar is restored when component unmounts
        return () => {
            setSidebarHidden(false);
        };
    }, [isOpen, setSidebarHidden, inline]);

    if (!isVisible && !isOpen) return null;

    return (
        <>
            {/* Backdrop for Mobile or Overlay Mode */}
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${inline ? 'lg:hidden' : ''} ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <div
                className={inline ?
                    `fixed inset-0 z-50 w-full bg-white dark:bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:h-full lg:w-auto lg:bg-transparent lg:border-l lg:border-gray-200 lg:dark:border-slate-800 ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}` :
                    `fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-slate-900 
                    shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-slate-800
                    flex flex-col
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
                }
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-brand-primary">
                        <Info size={20} />
                        <h2 className="text-lg font-bold text-black dark:text-white">Details</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Preview Section - Icon Only */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-32 h-32 bg-gray-50 dark:bg-slate-800 rounded-2xl mb-6 flex items-center justify-center border border-gray-100 dark:border-slate-800 shadow-inner">
                            {(() => {
                                if (!file) return <FileText size={64} className="text-gray-400" />;
                                if (file.isDirectory || (file.tags && file.tags.includes('folder'))) return <Folder size={64} className="text-brand-primary fill-brand-primary/10" />;
                                if (file.tags && file.tags.includes('image')) return <ImageIcon size={64} className="text-purple-500" />;
                                if (file.tags && file.tags.includes('video')) return <VideoIcon size={64} className="text-red-500" />;
                                if (file.tags && file.tags.includes('audio')) return <Music size={64} className="text-yellow-500" />;
                                if (file.tags && file.tags.includes('archive')) return <Box size={64} className="text-orange-500" />;
                                if (file.tags && file.tags.includes('document')) return <FileText size={64} className="text-blue-500" />;

                                return <FileText size={64} className="text-brand-primary" />;
                            })()}
                        </div>
                        <h3 className="text-xl font-bold text-black dark:text-white break-words w-full px-2">
                            {file?.name || 'Unknown File'}
                        </h3>
                        <p className="text-gray-400 font-medium text-sm mt-1 uppercase tracking-wide">
                            {file?.tags ? 'Document' : 'Folder'}
                        </p>
                    </div>

                    {/* Meta Data Grid */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Properties</h4>

                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <HardDrive size={18} />
                                    <span className="font-medium text-sm">Size</span>
                                </div>
                                <span className="font-bold text-black dark:text-white text-sm">{file?.size || 'Unknown'}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <Calendar size={18} />
                                    <span className="font-medium text-sm">Modified</span>
                                </div>
                                <span className="font-bold text-black dark:text-white text-sm">{file?.modified || 'Just now'}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <User size={18} />
                                    <span className="font-medium text-sm">Owner</span>
                                </div>
                                <span className="font-bold text-black dark:text-white text-sm">Me</span>
                            </div>

                            {file?.tags && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <Tag size={18} />
                                        <span className="font-medium text-sm">Tags</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {file.tags.map(t => (
                                            <span key={t} className="w-2 h-2 rounded-full bg-brand-primary"></span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tags List */}
                    {file?.tags && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {file.tags.map((tag, i) => (
                                    <span key={i} className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-bold uppercase border border-brand-primary/20">
                                        {tag}
                                    </span>
                                ))}
                                <button className="px-3 py-1 rounded-full border border-gray-200 dark:border-slate-700 text-gray-400 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                    + Add Tag
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 dark:bg-slate-850 border-t border-gray-100 dark:border-slate-800 grid grid-cols-3 gap-3">
                    <button
                        onClick={() => onDownload && onDownload(file)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all group cursor-pointer">
                        <Download size={20} className="mb-1 text-gray-700 dark:text-gray-300 group-hover:text-white" />
                        <span className="text-xs font-bold">Download</span>
                    </button>
                    <button 
                        onClick={() => onShare && onShare(file)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all group cursor-pointer">
                        <Share2 size={20} className="mb-1 text-gray-700 dark:text-gray-300 group-hover:text-white" />
                        <span className="text-xs font-bold">Share</span>
                    </button>
                    <button
                        onClick={() => onDelete && onDelete(file)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all group cursor-pointer">
                        <Trash2 size={20} className="mb-1 text-gray-700 dark:text-gray-300 group-hover:text-white" />
                        <span className="text-xs font-bold">Delete</span>
                    </button>
                </div>

            </div>
        </>
    );
};

export default FileDetailsPanel;
