
import React from 'react';

const InputGroup = ({ label, icon: Icon, value, onChange, placeholder, type = "text" }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-black text-text-muted uppercase">{label}</label>
        <div className="relative">
            <Icon className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
            <input
                required
                type={type}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    </div>
);

export default InputGroup;
