import {
    Search,
    User,
    ShieldCheck,
    Box,
    Navigation,
    CheckCircle,
    DollarSign
} from 'lucide-react';

export const SERVICE_TYPES = [
    'General Service',
    'Engine Overhaul',
    'Suspension & Brakes',
    'Electrical & AC',
    'Panel Beating/Body',
    'Diagnostics'
];

export const PLATFORM_FEE_RATE = 0.025; // 2.5% from each side (Total 5%)

export const STATUS_STEPS = {
    'open': {
        label: 'Network Visible',
        color: 'bg-orange-100 text-orange-700 border-orange-200 shadow-sm shadow-orange-50',
        icon: Search
    },
    'secured': {
        label: 'Contract Secured',
        color: 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200',
        icon: ShieldCheck
    },
    'assigned': {
        label: 'Fleet Assigned',
        color: 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm shadow-amber-50',
        icon: User
    },
    'loading': {
        label: 'Payload Loading',
        color: 'bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-200',
        icon: Box
    },
    'in_transit': {
        label: 'Mission Active',
        color: 'bg-orange-50 text-orange-600 border-orange-200 shadow-sm shadow-orange-50',
        icon: Navigation
    },
    'delivered': {
        label: 'Node Fulfillment',
        color: 'bg-green-50 text-green-700 border-green-200 shadow-sm shadow-green-50',
        icon: CheckCircle
    },
    'paid': {
        label: 'Asset Liquidity',
        color: 'bg-slate-800 text-white border-slate-700 shadow-md',
        icon: DollarSign
    },
};
