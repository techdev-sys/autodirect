
import React from 'react';

const TabBtn = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${active ? 'bg-primary text-background shadow-lg' : 'text-text-muted hover:bg-white/5'
            }`}
    >
        <Icon className={`w-5 h-5 mb-1 ${active ? 'scale-110' : ''}`} />
        <span className="text-[9px] font-black uppercase tracking-tighter leading-none">{label}</span>
    </button>
);

export default TabBtn;
