
import React from 'react';

const EmptyState = ({ icon: Icon, title, desc }) => (
    <div className="py-20 text-center flex flex-col items-center justify-center space-y-3 opacity-60">
        <div className="w-16 h-16 bg-surface rounded-3xl flex items-center justify-center text-white/20 border border-white/5">
            <Icon className="w-8 h-8" />
        </div>
        <div className="space-y-1">
            <h3 className="font-black text-white uppercase">{title}</h3>
            <p className="text-xs text-text-muted font-bold uppercase tracking-tight">{desc}</p>
        </div>
    </div>
);

export default EmptyState;
