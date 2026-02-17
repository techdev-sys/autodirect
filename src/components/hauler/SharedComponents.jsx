import React from 'react';

export const StatsBubble = ({ value, suffix, dark }) => (
    <div className={`p-4 rounded-[2rem] shadow-xl flex flex-col items-center justify-center min-w-[100px] border border-white/10 btn-interact ${dark ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]'}`}>
        <p className="text-xl font-bold tracking-tighter leading-none">{value.toLocaleString()}</p>
        <p className="text-[10px] font-bold opacity-60 uppercase mt-0.5">{suffix}</p>
        <div className="w-1 h-1 bg-blue-500 rounded-full mt-2"></div>
    </div>
);

export const SummaryLegend = ({ color, label }) => (
    <div className="flex items-center gap-3">
        <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: color }}></div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
);

export const CalendarLegend = ({ color, label }) => (
    <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: color }}></div>
        <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
    </div>
);

export const SearchPill = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all btn-interact ${active ? 'bg-[#1A1A1A] text-white shadow-md' : 'text-slate-400 hover:text-slate-900'}`}>{label}</button>
);

export const DetailNode = ({ icon: Icon, label, value }) => (
    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><Icon size={16} /></div>
        <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-slate-900 leading-none mt-0.5">{value}</p>
        </div>
    </div>
);

export const CircularProgress = ({ value, max, color }) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
        <div className="relative w-16 h-16 transform rotate-[-90deg]">
            <svg viewBox="0 0 36 36" className="w-full h-full">
                <path className="text-slate-100" strokeDasharray="100, 100" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path strokeDasharray={`${percentage}, 100`} strokeWidth="4" strokeLinecap="round" fill="none" stroke={color} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center rotate-[90deg]"><span className="text-xs font-bold text-slate-800">{value}</span></div>
        </div>
    );
};
