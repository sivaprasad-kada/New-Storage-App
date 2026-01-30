import React, { useState, useEffect } from 'react';
import { Download, LayoutGrid, List, ArrowRight, Info, File, Image, Video, FileText, Folder, FileArchive, Code } from 'lucide-react';

const RecentActivity = ({ files = [], onNavigate, onFileClick, onDownload, onDelete, onDetailsClick }) => {
    // Persist view preference
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('recentActivityView') || 'grid';
    });

    useEffect(() => {
        localStorage.setItem('recentActivityView', viewMode);
    }, [viewMode]);

    const getFileIcon = (tags) => {
        if (tags.includes('folder')) return <Folder size={40} className="text-brand-primary" fill="currentColor" fillOpacity={0.2} />;
        if (tags.includes('image')) return <Image size={40} className="text-purple-500" />;
        if (tags.includes('video')) return <Video size={40} className="text-red-500" />;
        if (tags.includes('document')) return <FileText size={40} className="text-blue-500" />;
        if (tags.includes('archive')) return <FileArchive size={40} className="text-yellow-500" />;
        if (tags.includes('code')) return <Code size={40} className="text-green-500" />;
        return <File size={40} className="text-gray-400" />;
    };

    return (
        <div className="space-y-4">
            {/* Header with Toggle */}
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-black dark:text-white">Recent Activity</h3>

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

            {/* Content */}
            <div className="relative">
                {files.length === 0 ? (
                    <div className="text-center py-12 bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 font-bold">No recent files</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
                        : "flex flex-col gap-3"
                    }>
                        {files.map((file, i) => (
                            <div
                                key={i}
                                onClick={() => {
                                    if (file.isDirectory || (file.tags && file.tags.includes('folder'))) {
                                        onNavigate && onNavigate(file._id || file.id);
                                    } else {
                                        onFileClick && onFileClick(file.filename || file.name, file._id || file.id, file);
                                    }
                                }}
                                className={`
                                bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer
                                ${viewMode === 'list'
                                        ? 'flex items-center gap-4 min-h-[80px]'
                                        : 'flex flex-col h-full min-h-[200px]'
                                    }
                            `}>
                                {/* Icon */}
                                <div className={`${viewMode === 'list' ? 'shrink-0' : 'mb-3'}`}>
                                    <div className="flex items-center justify-center">
                                        {React.cloneElement(getFileIcon(file.tags || []), {
                                            size: viewMode === 'list' ? 32 : 40
                                        })}
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className={`flex-1 ${viewMode === 'list' ? 'flex items-center justify-between gap-4 overflow-hidden' : ''}`}>

                                    {/* Name & Tags */}
                                    <div className={`${viewMode === 'list' ? 'min-w-0 flex-1' : 'mb-3 opacity-100'}`}>
                                        <h4 className="font-bold text-black dark:text-white mb-1 truncate" title={file.name}>{file.name}</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {file.tags && file.tags.map((tag, t) => (
                                                <span key={t} className="bg-brand-primary/10 text-brand-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Meta & Actions */}
                                    <div className={`${viewMode === 'list' ? 'flex items-center gap-6 shrink-0' : 'mt-auto space-y-1'}`}>

                                        {/* Meta Stats */}
                                        <div className={`${viewMode === 'list' ? 'flex items-center gap-6' : 'space-y-1'}`}>
                                            <div className={`text-xs font-bold text-black dark:text-gray-300 ${viewMode === 'grid' ? 'flex justify-between border-b border-gray-200 dark:border-slate-700 pb-1' : ''}`}>
                                                <span className={viewMode === 'list' ? 'text-gray-500 dark:text-gray-400 mr-1 hidden sm:inline' : ''}>{viewMode === 'list' ? '' : 'size'}</span>
                                                <span className="font-normal">{file.size}</span>
                                            </div>
                                            <div className={`text-xs font-bold text-black dark:text-gray-300 ${viewMode === 'grid' ? 'flex justify-between border-b border-gray-200 dark:border-slate-700 pb-1' : ''}`}>
                                                <span className={viewMode === 'list' ? 'text-gray-500 dark:text-gray-400 mr-1 hidden sm:inline' : ''}>{viewMode === 'list' ? '' : 'modified'}</span>
                                                <span className="font-normal">{file.modified}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className={`${viewMode === 'list' ? 'flex gap-4' : 'flex justify-between items-center pt-2'}`}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDetailsClick && onDetailsClick(file);
                                                }}
                                                className="flex items-center gap-1 text-xs font-bold text-black dark:text-white hover:underline"
                                            >
                                                <Info size={12} className="text-gray-500 dark:text-gray-400" /> <span className="hidden sm:inline">Details</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDownload && onDownload(file);
                                                }}
                                                className="flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline"
                                            >
                                                <Download size={12} /> <span className="hidden sm:inline">Download</span>
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Slider Arrow - Desktop Only (Only for Grid) */}
                {viewMode === 'grid' && files.length > 0 && (
                    <div className="absolute top-1/2 -right-5 xl:-right-12 -translate-y-1/2 hidden xl:block">
                        <button className="w-10 h-10 rounded-full border-2 border-brand-primary flex items-center justify-center text-brand-primary hover:bg-brand-primary/10 transition-colors bg-white dark:bg-slate-800">
                            <ArrowRight size={24} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivity;
