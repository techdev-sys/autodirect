
import React from 'react';
import { STATUS_STEPS } from '../data/constants';

const StatusBadge = ({ status }) => {
    const config = STATUS_STEPS[status] || STATUS_STEPS['open'];
    const Icon = config.icon;
    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center border ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
        </span>
    );
};

export default StatusBadge;
