import React, { useState } from 'react';
import { Share2, Copy, Check, FileText, Download, Link as LinkIcon, DownloadCloud, Eye } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Shared = () => {
    const [activeTab, setActiveTab] = useState('withMe');
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = (id) => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Mock Data
    const files = [
        // { id: 1, name: 'Project_Alpha_Specs.pdf', type: 'PDF', size: '2.4 MB', sharedBy: 'Sarah Connor', date: '2 days ago', thumb: null },
        // { id: 2, name: 'Office_Party.jpg', type: 'IMG', size: '4.8 MB', sharedBy: 'John Doe', date: '1 week ago', thumb: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        // { id: 3, name: 'Q4_Report.docx', type: 'DOC', size: '1.1 MB', sharedBy: 'Mike Ross', date: 'Yesterday', thumb: null },
        // { id: 4, name: 'Design_System_v2.fig', type: 'FIG', size: '15 MB', sharedBy: 'You', date: 'Just now', thumb: null },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-normal text-black dark:text-white mb-1">Shared Files</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">Access files shared with you or by you</p>
                </div>

                <div className="bg-gray-200 dark:bg-slate-800 p-1 rounded-xl flex gap-1 font-bold w-fit">
                    <button
                        onClick={() => setActiveTab('withMe')}
                        className={`px-4 sm:px-6 py-2 rounded-lg transition-all text-sm sm:text-base ${activeTab === 'withMe'
                            ? 'bg-white dark:bg-slate-600 text-brand-primary shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Shared with me
                    </button>
                    <button
                        onClick={() => setActiveTab('byMe')}
                        className={`px-4 sm:px-6 py-2 rounded-lg transition-all text-sm sm:text-base ${activeTab === 'byMe'
                            ? 'bg-white dark:bg-slate-600 text-brand-primary shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Shared by me
                    </button>
                </div>
            </div>

            {/* Share Link Generation Card */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Share your memories instantly</h3>
                        <p className="text-white/90 font-medium max-w-lg">Generate a secure, time-limited link for your photos and videos to share with friends and family.</p>
                    </div>
                    <button className="bg-white text-brand-primary px-6 py-3 rounded-xl font-bold shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <LinkIcon size={20} /> Generate Link
                    </button>
                </div>
                <Share2 className="absolute -bottom-8 -right-8 text-white/20 w-48 h-48 rotate-12" />
            </div>

            {/* Files Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {files.map((file) => (
                    <div key={file.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm flex flex-col group min-h-[220px] hover:shadow-md transition-shadow">

                        {/* Thumbnail / Icon Area */}
                        <div className="mb-4 h-32 sm:h-24 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden relative">
                            {file.thumb ? (
                                <img src={file.thumb} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-brand-primary">
                                    <FileText size={40} />
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="p-2 bg-white rounded-full text-black hover:scale-110 transition-transform" title="Download">
                                    <DownloadCloud size={16} />
                                </button>
                                <button className="p-2 bg-white rounded-full text-black hover:scale-110 transition-transform" title="Preview">
                                    <Eye size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <h4 className="font-bold text-black dark:text-white text-sm truncate mb-1">{file.name}</h4>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">{file.size} • {file.date}</p>

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-slate-700">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {file.sharedBy.charAt(0)}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 truncate max-w-[80px] sm:max-w-[60px]">{file.sharedBy}</span>
                                </div>

                                <button
                                    onClick={() => handleCopy(file.id)}
                                    className={`text-xs font-bold flex items-center gap-1 transition-colors ${copiedId === file.id ? 'text-green-600' : 'text-brand-primary hover:text-brand-secondary'}`}
                                >
                                    {copiedId === file.id ? <Check size={14} /> : <Copy size={14} />}
                                    {copiedId === file.id ? 'Copied' : 'Copy Link'}
                                </button>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shared;
