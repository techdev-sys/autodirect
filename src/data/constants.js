
import {
    Search,
    User,
    ClipboardList,
    Wrench,
    CheckCircle,
    Car,
    ShieldCheck
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
    'open': { label: 'Search Active', color: 'bg-primary/10 text-primary border-primary/20', icon: Search },
    'assigned': { label: 'Driver Assigned', color: 'bg-secondary/10 text-secondary border-secondary/20', icon: User },
    'transit': { label: 'In Transit', color: 'bg-blue-900/20 text-blue-400 border-blue-900/30', icon: Wrench },
    'delivered': { label: 'Cargo Delivered', color: 'bg-green-900/20 text-green-400 border-green-900/30', icon: CheckCircle },
    'paid': { label: 'Funds Released', color: 'bg-surface text-text-muted border-white/10', icon: ShieldCheck },
};
