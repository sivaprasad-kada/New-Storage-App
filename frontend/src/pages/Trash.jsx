import React from 'react';
import { Trash2 } from 'lucide-react';

const Trash = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Trash</h1>
                <button className="btn-secondary text-red-600 hover:bg-red-50 border-red-200">Empty Trash</button>
            </div>

            <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                    <Trash2 size={48} className="text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Trash is empty</h2>
                <p className="text-slate-500 mt-2 max-w-sm">Items moved to trash will appear here. They are automatically deleted after 30 days.</p>
            </div>
        </div>
    );
};

export default Trash;
