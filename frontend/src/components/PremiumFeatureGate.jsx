import React from 'react';
import { usePlanAccess } from '../hooks/usePlanAccess';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PremiumFeatureGate = ({ feature, children, fallback, blur = false }) => {
    const { hasAccess, loading } = usePlanAccess(feature);
    const navigate = useNavigate();

    if (loading) return <div className="animate-pulse bg-gray-100 dark:bg-slate-800 rounded-lg h-10 w-full"></div>;

    if (hasAccess) {
        return children;
    }

    if (fallback) {
        return fallback;
    }

    return (
        <div className={`relative ${blur ? 'group cursor-not-allowed' : ''}`}>
            <div className={blur ? 'blur-sm opacity-50 transition-all pointer-events-none' : 'hidden'}>
                {children}
            </div>
            
            <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-center ${blur ? 'absolute inset-0 z-10' : ''}`}>
                <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
                    <Lock size={20} className="text-gray-500 dark:text-gray-400" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Premium Feature</h4>
                <p className="text-sm text-gray-500 mb-4 max-w-xs">
                    Upgrade to a premium plan to unlock this feature.
                </p>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/payment');
                    }}
                    className="px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-lg hover:bg-brand-secondary transition-colors"
                >
                    View Plans
                </button>
            </div>
        </div>
    );
};

export default PremiumFeatureGate;
