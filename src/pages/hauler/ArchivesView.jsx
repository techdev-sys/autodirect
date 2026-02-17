import React from 'react';
import { ArrowUpRight, Box, MapPin, Hash, ChevronRight } from 'lucide-react';

const ArchivesView = ({ missions }) => (
    <div className="w-full space-y-12 md:space-y-20 animate-fade-in pb-24 overflow-hidden">
        <div className="card-premium-light p-0 overflow-hidden shadow-2xl shadow-black/5">
            <div className="p-8 md:p-12 border-b border-slate-50 flex justify-between items-center bg-white">
                <div>
                    <h3 className="text-xl md:text-3xl font-black tracking-tighter">Mission Archives</h3>
                    <p className="hidden md:block text-sm font-medium text-slate-400 mt-2 uppercase tracking-widest opacity-60">Full historical registry of completed operations.</p>
                </div>
                <div className="px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] border border-blue-100/50">
                    {missions.length} Delivered
                </div>
            </div>

            {/* Desktop View Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#F8FAFC]/50 border-b border-slate-50">
                        <tr>
                            <th className="px-12 py-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Material Node</th>
                            <th className="px-12 py-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Logistics Path</th>
                            <th className="px-12 py-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">System ID</th>
                            <th className="px-12 py-8 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {missions.map(m => (
                            <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-12 py-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                            <Box size={24} />
                                        </div>
                                        <span className="font-black text-base md:text-lg tracking-tight text-slate-900 uppercase italic">{m.goodsType}</span>
                                    </div>
                                </td>
                                <td className="px-12 py-10 text-xs md:text-sm text-slate-500 font-bold italic opacity-60 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-3">
                                        <MapPin size={16} className="text-blue-400" />
                                        {m.departure?.split(',')[0]} <span className="text-slate-200 mx-1">→</span> {m.destination?.split(',')[0]}
                                    </div>
                                </td>
                                <td className="px-12 py-10">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-500/50 group-hover:text-blue-500 transition-colors uppercase tracking-widest bg-blue-50/0 group-hover:bg-blue-50/50 px-3 py-1.5 rounded-full w-fit">
                                        <Hash size={12} />
                                        {m.id.slice(-8).toUpperCase()}
                                    </div>
                                </td>
                                <td className="px-12 py-10 text-right">
                                    <button className="p-4 bg-slate-50 text-slate-400 hover:bg-[#1A1A1A] hover:text-white rounded-2xl transition-all shadow-sm border border-slate-100 hover:border-slate-900 btn-interact">
                                        <ArrowUpRight size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View List */}
            <div className="md:hidden divide-y divide-slate-50">
                {missions.map(m => (
                    <div key={m.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                        <div className="flex items-center gap-5 min-w-0">
                            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm transition-all shrink-0 border border-slate-100">
                                <Box size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-base font-black text-slate-900 truncate uppercase italic">{m.goodsType}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 truncate uppercase tracking-widest opacity-60">
                                    {m.departure?.split(',')[0]} → {m.destination?.split(',')[0]}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">{m.id.slice(-6).toUpperCase()}</span>
                            <ChevronRight size={18} className="text-slate-300" />
                        </div>
                    </div>
                ))}
            </div>

            {missions.length === 0 && (
                <div className="py-32 text-center">
                    <div className="w-20 h-20 bg-slate-50 text-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <Box size={40} />
                    </div>
                    <p className="text-sm font-black text-slate-300 uppercase tracking-[0.3em]">No Historical Records Found</p>
                </div>
            )}
        </div>
    </div>
);

export default ArchivesView;
