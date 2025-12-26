import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-neon-blue/30 rounded-xl p-6 max-w-sm w-full shadow-[0_0_15px_rgba(0,243,255,0.2)] transform transition-all scale-100 flex flex-col relative">

                {/* Close Button absolute top-right */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {title && (
                    <h3 className="text-xl font-bold text-white mb-4 pr-6 flex items-center gap-2 border-b border-slate-700/50 pb-2">
                        {title}
                    </h3>
                )}

                <div className="text-slate-300">
                    {children}
                </div>
            </div>
        </div>
    );
}
