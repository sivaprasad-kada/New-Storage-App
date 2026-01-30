import React from 'react';
import { Star } from 'lucide-react';

const Favorites = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Favorites</h1>
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="bg-yellow-50 p-6 rounded-full mb-4">
                    <Star size={48} className="text-yellow-500" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">No favorites yet</h2>
                <p className="text-slate-500 mt-2 max-w-sm">Mark important files as favorites to access them quickly from here.</p>
            </div>
        </div>
    );
};

export default Favorites;
