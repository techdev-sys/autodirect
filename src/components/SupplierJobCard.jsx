import React from 'react';
import { Truck, MapPin, Navigation, CheckCircle2, ShieldCheck, FileText, Smartphone, ArrowRight } from 'lucide-react';

const StatusPulse = ({ status }) => {
    const isTransit = status === 'in_transit' || status === 'loading';
    const isDelivered = status === 'delivered' || status === 'paid';

    let pulseColor = 'bg-slate-300';
    let textColor = 'text-slate-400';
    if (status === 'open') {
        pulseColor = 'bg-orange-400';
        textColor = 'text-orange-500';
    }
    if (isTransit) {
        pulseColor = 'bg-orange-600';
        textColor = 'text-orange-600';
    }
    if (isDelivered) {
        pulseColor = 'bg-green-500';
        textColor = 'text-green-600';
    }

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
            <div className="relative flex h-2 w-2">
                {(isTransit || status === 'open') && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${pulseColor}`}></span>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${textColor}`}>
                {status.replace('_', ' ')}
            </span>
        </div>
    );
};

const SupplierJobCard = ({ job, onViewBOL }) => {
    const isSecured = ['secured', 'assigned', 'loading', 'in_transit', 'delivered', 'paid'].includes(job.status);
    const isDelivered = ['delivered', 'paid'].includes(job.status);

    return (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-premium transition-all group relative overflow-hidden">
            {/* Design Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-[#121926] uppercase tracking-tighter leading-none mb-1">
                        {job.goodsType || 'General Logistics'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Truck size={12} /> {job.tonnage} Tons • {job.fleetType}
                    </p>
                </div>
                <StatusPulse status={job.status} />
            </div>

            <div className="space-y-4 mb-8 relative z-10">
                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-50">
                        <MapPin size={18} className="text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-[#121926] uppercase flex items-center gap-2 truncate">
                            {job.departure?.split(',')[0]}
                            <ArrowRight size={12} className="text-slate-300" />
                            {job.destination?.split(',')[0]}
                        </p>
                    </div>
                </div>

                {isSecured && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#121926] p-6 rounded-[2rem] border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-500 shadow-xl">
                        <div className="space-y-1.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Authorized Hauler</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/5">
                                    <ShieldCheck size={14} className="text-orange-400" />
                                </div>
                                <p className="text-xs font-black text-white uppercase truncate">{job.haulerName || 'Secured Partner'}</p>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Operative Link</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/5">
                                    <Smartphone size={14} className="text-green-400" />
                                </div>
                                <p className="text-xs font-black text-white uppercase">{job.assignedDriverPhone || job.assignedDriverName || 'Awaiting Signal'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {isDelivered && (
                    <div className="flex items-center justify-between p-5 bg-green-50/50 rounded-2xl border border-green-100/50 animate-in fade-in zoom-in duration-500">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-green-200">
                                <CheckCircle2 size={18} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-green-800 uppercase tracking-tighter">Mission Accomplished</p>
                                <p className="text-[9px] font-bold text-green-600/70 uppercase">Fulfillment Verified</p>
                            </div>
                        </div>
                        {job.fulfillmentSignature && (
                            <div className="flex flex-col items-center">
                                <img src={job.fulfillmentSignature} alt="Signature" className="h-10 w-auto object-contain mix-blend-multiply" />
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Digital Identity</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={() => onViewBOL(job)}
                className="w-full h-14 bg-white border border-slate-200 text-[#121926] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#121926] hover:text-white hover:border-[#121926] transition-all group shadow-sm active:scale-95"
            >
                <FileText size={16} className="group-hover:scale-110 transition-transform" />
                View Digital BOL
            </button>
        </div>
    );
};

export default SupplierJobCard;
