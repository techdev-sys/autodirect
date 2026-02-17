import React from 'react';
import {
    Truck,
    MapPin,
    User,
    ShieldCheck,
    ArrowRight,
    Box,
    Navigation,
    CheckCircle2,
    TrendingUp,
    Smartphone,
    Clock,
    DollarSign,
    MoreHorizontal
} from 'lucide-react';

const HaulerJobCard = ({ job, userProfile, onAction, isDispatcher, isDriver }) => {
    const statusConfig = {
        open: { color: '#2563eb', bg: 'bg-blue-50/50', label: 'In Market' },
        secured: { color: '#64748b', bg: 'bg-slate-50/50', label: 'Secured' },
        assigned: { color: '#6366f1', bg: 'bg-indigo-50/50', label: 'Assigned' },
        loading: { color: '#f59e0b', bg: 'bg-amber-50/50', label: 'Loading' },
        in_transit: { color: '#06b6d4', bg: 'bg-cyan-50/50', label: 'In Transit' },
        delivered: { color: '#10b981', bg: 'bg-emerald-50/50', label: 'Delivered' }
    };
    const config = statusConfig[job.status] || statusConfig.open;

    return (
        <div className="flex flex-col h-full bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group relative overflow-hidden">
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-24 h-24 ${config.bg} rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-700 opacity-50`} />

            {/* Top Section: Icon & Category */}
            <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center text-slate-900 shadow-sm border border-white/50 group-hover:rotate-3 transition-transform duration-500`}>
                    <Truck size={24} style={{ color: config.color }} />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Status</span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-100 rounded-full shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">{config.label}</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 space-y-4">
                <div>
                    <h4 className="font-extrabold text-slate-900 leading-tight text-lg group-hover:text-blue-600 transition-colors truncate">
                        {job.goodsType || 'General Cargo'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="px-2 py-0.5 bg-slate-100/80 rounded-md">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{job.tonnage} Tons</span>
                        </div>
                    </div>
                </div>

                {/* Route Visualization */}
                <div className="relative py-2">
                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1 mt-1">
                            <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-500 bg-white" />
                            <div className="w-0.5 h-6 bg-gradient-to-b from-blue-500/20 to-emerald-500/20 rounded-full" />
                            <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-white" />
                        </div>
                        <div className="space-y-3 flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-slate-600 truncate leading-tight">
                                {String(job.departure || 'Origin unknown').split(',')[0]}
                            </p>
                            <p className="text-[11px] font-semibold text-slate-600 truncate leading-tight">
                                {String(job.destination || 'Destination unknown').split(',')[0]}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Pricing & Action */}
            <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Payout</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">
                        <span className="text-[10px] text-slate-400 mr-0.5 font-bold">USD</span>
                        {job.budget?.toLocaleString()}
                    </p>
                </div>

                {job.status === 'open' && isDispatcher ? (
                    <button
                        onClick={() => onAction('secure')}
                        className="px-6 py-3 bg-[#1A1A1A] hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 btn-interact group/btn"
                    >
                        Secure <ArrowRight size={12} className="inline ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                ) : (
                    <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all btn-interact border border-slate-50">
                        <MoreHorizontal size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default HaulerJobCard;
