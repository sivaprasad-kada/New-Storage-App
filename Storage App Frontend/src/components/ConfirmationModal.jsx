import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDanger = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-800 transform scale-100 animate-in zoom-in-95 duration-200 selection:bg-none">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isDanger ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-brand-primary/10 text-brand-primary'}`}>
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-black dark:text-white">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 font-medium text-base leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-3 px-4 font-bold text-white rounded-xl shadow-lg transition-transform active:scale-95 ${isDanger
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                : 'bg-brand-primary hover:bg-brand-secondary shadow-brand-primary/30'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
