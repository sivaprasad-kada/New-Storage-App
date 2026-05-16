import React, { useEffect, useState } from 'react';
import { Upload, Trash2, FileText, Database, Image as ImageIcon, Video, Music, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Storage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch storage stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!stats) return <div className="p-8 text-center text-red-500">Failed to load storage data.</div>;

    const totalUsed = stats.usedStorageInBytes || 0;
    const totalMax = stats.maxStorageInBytes || 1; // avoid div by zero
    const usedPercentage = Math.min(100, (totalUsed / totalMax) * 100).toFixed(1);

    // Calculate chart properties
    const circumference = 2 * Math.PI * 40; // r=40
    const strokeDashoffset = circumference - (usedPercentage / 100) * circumference;

    // Categories
    const categories = [
        { name: 'Documents', bytes: stats.documentBytes || 0, color: '#0091ff', bg: 'bg-[#0091ff]', border: 'border-[#0091ff]', icon: <FileText size={16} /> },
        { name: 'Images', bytes: stats.imageBytes || 0, color: '#8b008b', bg: 'bg-[#8b008b]', border: 'border-[#8b008b]', icon: <ImageIcon size={16} /> },
        { name: 'Videos', bytes: stats.videoBytes || 0, color: '#ef4444', bg: 'bg-[#ef4444]', border: 'border-[#ef4444]', icon: <Video size={16} /> },
        { name: 'Audio', bytes: stats.audioBytes || 0, color: '#eab308', bg: 'bg-[#eab308]', border: 'border-[#eab308]', icon: <Music size={16} /> },
        { name: 'Others', bytes: stats.otherBytes || 0, color: '#a1a1aa', bg: 'bg-[#a1a1aa]', border: 'border-[#a1a1aa]', icon: <Box size={16} /> },
    ];

    // Identify Majority
    const majority = [...categories].sort((a, b) => b.bytes - a.bytes)[0];

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h1 className="text-4xl font-normal text-black dark:text-white mb-1">Storage</h1>
                <p className="text-gray-500 font-bold text-sm">Understand how your storage is being used</p>
            </div>

            <h2 className="text-xl sm:text-2xl font-normal text-black dark:text-white mb-4 sm:mb-6">Storage Overview</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-start">
                {/* Chart Section */}
                <div className="flex flex-col items-center justify-center relative bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="relative w-40 h-40 sm:w-56 md:w-64 sm:h-56 md:h-64">
                        {/* SVG Donut Chart */}
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                            {/* Background Circle */}
                            <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="12" fill="none" className="dark:stroke-slate-700" />
                            {/* Progress Circle */}
                            <circle
                                cx="50" cy="50" r="40"
                                stroke="var(--color-brand-primary)"
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>

                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-5xl font-extrabold text-black dark:text-white">{usedPercentage}%</span>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2">
                                {formatBytes(totalUsed)} Used
                            </span>
                            <span className="text-xs text-gray-400">
                                of {formatBytes(totalMax)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 font-medium">Majority usage</p>
                        <p className="text-xl font-bold text-black dark:text-white capitalize flex items-center justify-center gap-2">
                            {majority.icon} {majority.name}
                        </p>
                    </div>
                </div>

                {/* Breakdown & Actions Section */}
                <div className="space-y-6">
                    {/* Color Legend Bar */}
                    <div className="flex h-12 w-full rounded-xl overflow-hidden mb-8 shadow-inner bg-gray-100 dark:bg-slate-800">
                        {categories.map((cat, i) => {
                            const widthPercent = (cat.bytes / (totalUsed || 1)) * 100;
                            if (widthPercent <= 0) return null;
                            return (
                                <div key={i} className={`${cat.bg}`} style={{ width: `${widthPercent}%` }} title={`${cat.name}: ${formatBytes(cat.bytes)}`}></div>
                            );
                        })}
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {categories.map((cat, i) => {
                            const percent = ((cat.bytes / (totalUsed || 1)) * 100).toFixed(1);
                            return (
                                <div key={i} className={`bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow`}>
                                    <div className="flex items-center gap-2 mb-2 font-bold text-gray-700 dark:text-gray-200">
                                        <span style={{ color: cat.color }}>{cat.icon}</span> {cat.name}
                                    </div>
                                    <div className="text-xs font-bold text-gray-500 mb-3">{formatBytes(cat.bytes)}</div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full ${cat.bg}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gray-100 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700">
                        <div className="flex flex-col gap-3">
                            <button onClick={() => navigate('/payment')} className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer">
                                <Upload size={18} /> Upgrade plan
                            </button>
                            <button className="w-full bg-white hover:bg-gray-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-black dark:text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 border border-gray-300 dark:border-slate-600 shadow-sm transition-colors">
                                <Trash2 size={18} /> Clean Up Storage
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Storage;
