
import React from 'react';

const RoleCard = ({ title, desc, onClick, icon: Icon, color }) => (
    <button
        onClick={onClick}
        className={`w-full p-6 bg-white border-2 border-slate-100 hover:${color} rounded-2xl text-left transition-all group active:scale-95 shadow-sm hover:shadow-md`}
    >
        <div className="flex justify-between items-start">
            <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-800 uppercase">{title}</h3>
                <p className="text-sm text-slate-500 leading-tight">{desc}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-slate-800 group-hover:bg-slate-200 transition-colors">
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </button>
);

export default RoleCard;
