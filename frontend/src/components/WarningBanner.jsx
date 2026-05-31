import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WarningBanner = () => {
    const [uploadsBlocked, setUploadsBlocked] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user/`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setUploadsBlocked(data.uploadsBlocked);
                }
            } catch (error) {
                console.error("Failed to fetch user status", error);
            }
        };
        fetchUser();
    }, []);

    if (!uploadsBlocked) return null;

    return (
        <div className="bg-red-500 text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between shadow-md z-30 relative shrink-0">
            <div className="flex items-center gap-2 text-sm font-bold mb-2 sm:mb-0 text-center sm:text-left">
                <AlertCircle size={18} className="shrink-0" />
                Storage limit exceeded. New uploads are blocked. Please delete files or upgrade your plan.
            </div>
            <button 
                onClick={() => navigate('/payment')}
                className="bg-white text-red-500 text-xs font-extrabold px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0"
            >
                Upgrade Now
            </button>
        </div>
    );
};

export default WarningBanner;
