import React, { useState } from 'react';
import { X, UserPlus, PlusCircle } from 'lucide-react';

const ResourceModal = ({ type, mode, data, onClose, onConfirm }) => {
    const [formData, setFormData] = useState(data || {
        displayName: '',
        email: '',
        phoneNumber: '',
        registration: '',
        type: 'Tipper Interlink',
        tonnageCap: '34'
    });

    const isDriver = type === 'driver';

    return (
        <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center p-6 animate-in fade-in duration-300 font-sans">
            <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] p-12 space-y-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-slate-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter text-slate-900">{mode === 'create' ? 'Enroll' : 'Calibrate'} {isDriver ? 'Operative' : 'Hardware'}</h2>
                        <p className="text-slate-500 text-sm font-semibold mt-1 opacity-70">Syncing to the AutoDirect logistics infrastructure.</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-black/5 hover:bg-black/10 rounded-2xl transition-all">
                        <X size={20} className="text-slate-900" />
                    </button>
                </div>

                <div className="space-y-6">
                    {isDriver ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase ml-1">Full Legal Name</label>
                                <input className="w-full p-5 bg-[#F4F2EE] rounded-3xl border-none outline-none font-bold text-sm shadow-inner placeholder:text-slate-300" value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} placeholder="e.g. John Smith" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase ml-1">Access Email Address</label>
                                <input className="w-full p-5 bg-[#F4F2EE] rounded-3xl border-none outline-none font-bold text-sm shadow-inner placeholder:text-slate-300" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@autodirect.network" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase ml-1">Primary Comms Protocol</label>
                                <input className="w-full p-5 bg-[#F4F2EE] rounded-3xl border-none outline-none font-bold text-sm shadow-inner placeholder:text-slate-300" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="+27 00 000 0000" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase ml-1">Asset Registration ID</label>
                                <input className="w-full p-5 bg-[#F4F2EE] rounded-3xl border-none outline-none font-bold text-sm shadow-inner uppercase placeholder:text-slate-300" value={formData.registration} onChange={e => setFormData({ ...formData, registration: e.target.value.toUpperCase() })} placeholder="e.g. ABC 123 GP" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase ml-1">Asset Configuration View</label>
                                <select className="w-full p-5 bg-[#F4F2EE] rounded-3xl border-none outline-none font-bold text-sm shadow-inner appearance-none" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option>Tipper Interlink</option>
                                    <option>Flatbed</option>
                                    <option>Superlink</option>
                                    <option>Side Tipper</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase ml-1">Max Payload Tonnage</label>
                                <input type="number" className="w-full p-5 bg-[#F4F2EE] rounded-3xl border-none outline-none font-bold text-sm shadow-inner placeholder:text-slate-300" value={formData.tonnageCap} onChange={e => setFormData({ ...formData, tonnageCap: e.target.value })} placeholder="34" />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-5 bg-black/5 text-slate-500 rounded-3xl font-bold text-xs uppercase tracking-widest hover:bg-black/10 transition-all">Abort</button>
                    <button onClick={() => onConfirm(formData)} className="flex-[2] py-5 bg-[#1A1A1A] text-white rounded-3xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">Confirm Deployment</button>
                </div>
            </div>
        </div>
    );
};

export default ResourceModal;
