import React, { useState } from 'react';
import { X } from 'lucide-react';

const AssignmentModal = ({ job, drivers, assets, onClose, onConfirm }) => {
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState('');

    return (
        <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center p-6 animate-in fade-in duration-300 font-sans">
            <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] p-12 space-y-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-slate-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter text-slate-900">Assign Fleet</h2>
                        <p className="text-slate-500 text-sm font-semibold mt-1 opacity-70">Initialize mission for deployment.</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-black/5 hover:bg-black/10 rounded-2xl transition-all">
                        <X size={20} className="text-slate-900" />
                    </button>
                </div>
                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase ml-1">Select Operative</label>
                        <select className="w-full p-5 bg-[#F4F2EE] rounded-[1.5rem] border-none outline-none font-bold text-sm appearance-none shadow-inner" onChange={e => setSelectedDriver(drivers.find(d => d.id === e.target.value))}>
                            <option value="">Search Drivers...</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.displayName || d.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase ml-1">Select Fleet Unit</label>
                        <select className="w-full p-5 bg-[#F4F2EE] rounded-[1.5rem] border-none outline-none font-bold text-sm appearance-none shadow-inner" onChange={e => setSelectedAsset(e.target.value)}>
                            <option value="">Search Assets...</option>
                            {(assets || []).map(a => <option key={a.id} value={a.registration}>{a.registration}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-5 bg-black/5 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black/10 transition-all">Cancel</button>
                    <button disabled={!selectedDriver || !selectedAsset} onClick={() => onConfirm(selectedDriver.id, selectedDriver.displayName, selectedAsset)} className="flex-[2] py-5 bg-[#1A1A1A] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] shadow-xl active:scale-95 disabled:opacity-20 transition-all">Initiate Launch</button>
                </div>
            </div>
        </div>
    );
};

export default AssignmentModal;
