
import React from 'react';

const SectionCard = ({ children, className = "" }) => (
    <div className={`bg-surface rounded-2xl shadow-sm border border-white/5 overflow-hidden ${className}`}>
        {children}
    </div>
);

export default SectionCard;
