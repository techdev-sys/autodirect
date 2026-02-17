import React, { useMemo, useEffect } from 'react';
import { Truck, Navigation2, Box, Map as MapIcon, Mail, Phone, Zap, Fuel, Timer, MapPin, X, Smartphone, Clock } from 'lucide-react';
import { DetailNode } from '../../components/hauler/SharedComponents';

const LiveMapView = ({ jobs, userProfile, onSelect, selectedJob, searchQuery }) => {
    const activeJobs = jobs.filter(j => ['assigned', 'loading', 'in_transit'].includes(j.status));
    const allAssets = (userProfile?.fleetAssets || []).map(a => typeof a === 'string' ? a : a.registration);

    const assetToJob = {};
    activeJobs.forEach(j => {
        if (j.truckRegistration) assetToJob[j.truckRegistration] = j;
    });

    const searchResult = useMemo(() => {
        if (!searchQuery) return null;
        const q = searchQuery.toUpperCase();
        const match = allAssets.find(a => a?.toUpperCase().includes(q));
        if (match) {
            const activeJob = assetToJob[match];
            return { reg: match, status: activeJob ? (activeJob.status === 'in_transit' ? 'In Transit' : 'Loading') : 'Parked', job: activeJob || null };
        }
        return null;
    }, [searchQuery, allAssets, assetToJob]);

    useEffect(() => {
        if (searchResult?.job) onSelect(searchResult.job);
    }, [searchResult, onSelect]);

    return (
        <div className="grid grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className={`transition-all duration-500 ${(selectedJob || searchResult) ? 'col-span-8' : 'col-span-12'}`}>
                <div className="card-premium-light h-[700px] relative overflow-hidden bg-[#F8FAFC]">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)', backgroundSize: '60px 60px' }}></div>
                    {searchResult && (
                        <div className="absolute top-10 left-10 z-20 animate-in slide-in-from-top-4 duration-500">
                            <div className="bg-[#1A1A1A] text-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-6 border border-white/10">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${searchResult.status === 'In Transit' ? 'bg-blue-600' : searchResult.status === 'Loading' ? 'bg-amber-600' : 'bg-slate-700'}`}>
                                    <Truck size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Asset Found</p>
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-xl font-black italic">{searchResult.reg}</h4>
                                        <div className={`h-2 w-2 rounded-full ${searchResult.status === 'In Transit' ? 'bg-blue-500' : searchResult.status === 'Loading' ? 'bg-amber-500' : 'bg-slate-500'}`}></div>
                                        <span className="text-sm font-bold text-slate-300">{searchResult.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0">
                        {activeJobs.map((job, idx) => {
                            const isSearchMatch = searchResult?.reg === job.truckRegistration;
                            return (
                                <button key={job.id} onClick={() => onSelect(job)} className={`absolute group transition-all duration-1000 ${isSearchMatch ? 'z-30 scale-150' : 'animate-pulse'}`} style={{ top: `${20 + (idx * 123) % 60}%`, left: `${15 + (idx * 231) % 70}%` }} >
                                    <div className={`relative flex items-center justify-center`}>
                                        <div className={`absolute w-12 h-12 rounded-full blur-xl opacity-20 ${job.status === 'in_transit' ? 'bg-blue-500' : 'bg-amber-500'} ${isSearchMatch ? 'opacity-60 scale-150' : ''}`}></div>
                                        <div className={`w-6 h-6 rounded-full border-4 border-white shadow-xl flex items-center justify-center ${job.status === 'in_transit' ? 'bg-blue-600' : 'bg-amber-500'} ${isSearchMatch ? 'ring-4 ring-blue-500/30' : ''}`}>
                                            <Navigation2 size={10} className="text-white rotate-45" fill="white" />
                                        </div>
                                        <div className={`absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-lg border border-slate-100 transition-opacity ${isSearchMatch ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            <p className="text-[10px] font-black uppercase text-slate-800">{job.truckRegistration || 'Asset Node'}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className="absolute bottom-10 left-10 flex gap-6">
                        <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-white flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Navigation2 size={24} /></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Transit</p>
                                <p className="text-xl font-bold">{activeJobs.filter(j => j.status === 'in_transit').length}</p>
                            </div>
                        </div>
                        <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-white flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center"><Box size={24} /></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Network</p>
                                <p className="text-xl font-bold">{allAssets.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {(selectedJob || (searchResult && !searchResult.job)) && (
                <div className="col-span-4 animate-in slide-in-from-right-10 duration-500">
                    <div className="card-premium-light h-[700px] flex flex-col p-0 overflow-hidden shadow-2xl relative">
                        <div className="h-40 bg-[#1A1A1A] relative overflow-hidden flex items-end justify-between p-8">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-14 h-14 bg-white rounded-2xl p-1 shadow-xl flex items-center justify-center"><Truck size={28} className="text-slate-800" /></div>
                                <div>
                                    <h4 className="text-white font-bold leading-none tracking-tight uppercase italic">{selectedJob?.truckRegistration || searchResult?.reg}</h4>
                                    <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-1">Status: {selectedJob ? selectedJob.status : 'Parked'}</p>
                                </div>
                            </div>
                            <button onClick={() => { onSelect(null); }} className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20"><X size={20} /></button>
                        </div>
                        <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operational Detail</label>
                                <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                    {selectedJob ? (
                                        <>
                                            <p className="font-bold text-lg leading-tight">{selectedJob.goodsType}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium"><MapPin size={12} /><span>{selectedJob.destination?.split(',')[0]}</span></div>
                                        </>
                                    ) : (
                                        <div className="py-4 text-center">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3"><Clock size={20} className="text-slate-300" /></div>
                                            <p className="text-sm font-bold text-slate-900">Vehicle on Standby</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <DetailNode icon={Fuel} label="Fuel Node" value="92%" />
                                <DetailNode icon={Timer} label="Job Cycle" value={selectedJob ? "Active" : "Stable"} />
                                <DetailNode icon={Navigation2} label="Speed" value={selectedJob?.status === 'in_transit' ? "64 km/h" : "0 km/h"} />
                                <DetailNode icon={Zap} label="Health" value="Optimal" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveMapView;
