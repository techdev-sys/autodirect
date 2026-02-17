import React from 'react';
import { LogOut, X } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-[400px] rounded-[2.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-slate-100">
                <div className="p-10 text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <LogOut size={36} />
                    </div>

                    <h2 className="text-2xl font-black tracking-tight text-[#1A1A1A]">Terminate Session</h2>
                    <p className="text-slate-400 font-medium text-sm mt-2">Are you sure you want to log out of the system? All active operational links will remain intact.</p>

                    <div className="grid grid-cols-2 gap-4 mt-10">
                        <button
                            onClick={onClose}
                            className="py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all btn-interact"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all btn-interact"
                        >
                            Log Out
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default LogoutModal;
