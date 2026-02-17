import React, { useState, useMemo } from 'react';
import { Activity, Box, MapPin, User, Truck, Clock, Maximize2, X, Navigation2 } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import HaulerJobCard from '../../components/HaulerJobCard';
import { DetailNode } from '../../components/hauler/SharedComponents';

const MapPreview = ({ jobs, onExpand }) => {
    return (
        <div className="relative h-[300px] w-full bg-[#F8FAFC] rounded-[2.5rem] border border-slate-100 overflow-hidden group cursor-pointer" onClick={onExpand}>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:40px_40px]"></div>
            <div className="absolute inset-0 p-8">
                <div className="flex justify-between items-start">
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Live Telemetry Staging</span>
                    </div>
                    <div className="w-10 h-10 bg-[#1A1A1A] text-white rounded-xl flex items-center justify-center btn-interact shadow-lg group-hover:scale-110">
                        <Maximize2 size={18} />
                    </div>
                </div>

                {/* Simplified Map Visualization */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {jobs.slice(0, 5).map((job, i) => (
                        <div key={job.id} className="absolute" style={{ top: `${30 + (i * 45) % 40}%`, left: `${20 + (i * 78) % 60}%` }}>
                            <div className={`w-3 h-3 rounded-full border-2 border-white shadow-lg ${job.status === 'in_transit' ? 'bg-blue-600' : 'bg-amber-500'}`}></div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute bottom-6 left-6 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">System Grid v4.02</div>
        </div>
    );
};

const FullScreenMap = ({ jobs, onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-white p-8 animate-in fade-in zoom-in-95 duration-500 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter">Live Mission Feed</h2>
                    <p className="text-slate-400 text-sm font-semibold">Real-time geospatial visualization of active logistics hardware.</p>
                </div>
                <button onClick={onClose} className="p-4 bg-black/5 hover:bg-black/10 rounded-[1.5rem] transition-all btn-interact">
                    <X size={24} className="text-slate-900" />
                </button>
            </div>

            <div className="flex-1 bg-[#F8FAFC] rounded-[3.5rem] border border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)', backgroundSize: '60px 60px' }}></div>

                <div className="absolute inset-0">
                    {jobs.map((job, idx) => (
                        <div key={job.id} className="absolute animate-pulse" style={{ top: `${20 + (idx * 123) % 60}%`, left: `${15 + (idx * 231) % 70}%` }}>
                            <div className="relative group">
                                <div className={`w-8 h-8 rounded-full border-4 border-white shadow-xl flex items-center justify-center ${job.status === 'in_transit' ? 'bg-blue-600' : 'bg-amber-500'}`}>
                                    <Navigation2 size={12} className="text-white rotate-45" fill="white" />
                                </div>
                                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                                    {job.truckRegistration || 'Asset Node'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-10 left-10 flex gap-4">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-50 flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Activity size={20} /></div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Links</p>
                            <p className="text-xl font-bold">{jobs.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActiveOpsView = ({ missions, userProfile, onAction, isDispatcher, isDriver }) => {
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    // Live Operations: Driver assigned (assigned, loading, in_transit)
    const liveMissions = missions.filter(m => ['assigned', 'loading', 'in_transit'].includes(m.status));
    // Pending Deployment: Picked from market but not yet assigned (secured)
    const pendingMissions = missions.filter(m => m.status === 'secured');

    return (
        <div className="w-full space-y-20 md:space-y-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20 overflow-hidden">
            {/* Clickable Map Staging */}
            <section className="space-y-10">
                <div className="flex items-end justify-between">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight">Geospatial Awareness</h3>
                        <p className="text-sm text-slate-400 font-medium mt-1">Click to expand tactical mission feed.</p>
                    </div>
                </div>
                <MapPreview jobs={liveMissions} onExpand={() => setIsMapExpanded(true)} />
            </section>

            {/* Live Operations */}
            <section className="space-y-10">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight uppercase tracking-tighter">
                        Live Operations
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {liveMissions.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem]">
                            No units currently active in the grid.
                        </div>
                    ) : (
                        liveMissions.map(job => (
                            <HaulerJobCard
                                key={job.id}
                                job={job}
                                userProfile={userProfile}
                                onAction={(action) => onAction(job, action)}
                                isDispatcher={isDispatcher}
                                isDriver={isDriver}
                            />
                        ))
                    )}
                </div>
            </section>

            {/* Pending Deployment */}
            <section className="space-y-10 pt-20 border-t border-slate-100">
                <div className="flex items-center gap-4">
                    <Box className="text-blue-500" size={28} />
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight uppercase tracking-tighter">
                        Pending Deployment
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {pendingMissions.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem]">
                            No secured nodes awaiting deployment.
                        </div>
                    ) : (
                        pendingMissions.map(job => (
                            <div key={job.id} className="card-premium-light group flex flex-col h-full relative overflow-hidden">
                                {/* Background Accent */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-[4rem] -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110 duration-700" />

                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                                        <Box size={24} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Secured</p>
                                        <p className="text-sm font-black text-slate-500">{job.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div>
                                        <h4 className="font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition-colors truncate">{job.goodsType}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="px-2 py-0.5 bg-slate-100 rounded-md">
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{job.tonnage} Tons</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <DetailNode icon={MapPin} label="Logistics Path" value={`${job.departure?.split(',')[0]} → ${job.destination?.split(',')[0]}`} />
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Contract</p>
                                        <p className="text-xl font-black text-slate-900 tracking-tight">
                                            <span className="text-[10px] text-slate-400 mr-0.5 font-bold">USD</span>
                                            {job.budget?.toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onAction(job, 'secure')}
                                        className="px-6 py-3 bg-[#1A1A1A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 btn-interact"
                                    >
                                        Deploy
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Expansion Overlay */}
            {isMapExpanded && <FullScreenMap jobs={liveMissions} onClose={() => setIsMapExpanded(false)} />}
        </div>
    );
};

export default ActiveOpsView;
