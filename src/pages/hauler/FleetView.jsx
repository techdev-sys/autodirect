import React from 'react';
import { UserPlus, PlusCircle, User, Mail, Phone, ShieldCheck, Truck, Edit3, Trash2, Zap } from 'lucide-react';

const FleetView = ({
    drivers, trucks,
    onAddDriver, onEditDriver, onDeleteDriver,
    onAddTruck, onEditTruck, onDeleteTruck
}) => {
    return (
        <div className="w-full space-y-16 md:space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden pb-20">
            {/* Drivers Section */}
            <section className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight">Software Operatives</h3>
                        <p className="text-xs md:text-sm text-slate-400 font-medium mt-1">Manage human capital and access credentials.</p>
                    </div>
                    <button
                        onClick={onAddDriver}
                        className="w-full md:w-auto px-8 py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-black/5 btn-interact"
                    >
                        <UserPlus size={18} /> Enroll Driver
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {drivers.map(driver => (
                        <div key={driver.id} className="card-premium-light hover:border-blue-200 transition-all group relative overflow-hidden">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEditDriver(driver)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl btn-interact border border-slate-100"><Edit3 size={14} /></button>
                                <button onClick={() => onDeleteDriver(driver.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl btn-interact border border-slate-100"><Trash2 size={14} /></button>
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-[#F4F2EE] rounded-2xl overflow-hidden border-2 border-white shadow-inner flex items-center justify-center shrink-0">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.uid || driver.id}`} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-lg md:text-xl leading-none truncate">{driver.displayName || driver.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 truncate">Node ID: {driver.id.slice(-6).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold truncate bg-slate-50/50 p-2 rounded-lg">
                                    <Mail size={14} className="text-slate-300 shrink-0" /> <span className="truncate">{driver.email || 'No email synced'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold truncate bg-slate-50/50 p-2 rounded-lg">
                                    <Phone size={14} className="text-slate-300 shrink-0" /> <span className="truncate">{driver.phoneNumber || 'Unlinked'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold p-2">
                                    <ShieldCheck size={14} className="text-emerald-400 shrink-0" /> <span className="text-emerald-600">Secure Access</span>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${driver.forcePasswordChange ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                    {driver.forcePasswordChange ? 'Pending' : 'Verified'}
                                </span>
                                <button className="text-[10px] font-black text-slate-300 hover:text-slate-900 transition-colors uppercase tracking-widest btn-interact">Logs</button>
                            </div>
                        </div>
                    ))}
                    {drivers.length === 0 && <div className="col-span-full py-20 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem]">No registered operatives.</div>}
                </div>
            </section>

            {/* Asset Fleet Section */}
            <section className="space-y-10 pt-16 border-t border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight">Hardware Fleet</h3>
                        <p className="text-xs md:text-sm text-slate-400 font-medium mt-1">Monitoring and management of logistics equipment.</p>
                    </div>
                    <button
                        onClick={onAddTruck}
                        className="w-full md:w-auto px-8 py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-black/5 btn-interact"
                    >
                        <PlusCircle size={18} /> Register Asset
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {trucks.map(truck => (
                        <div key={truck.id} className="card-premium-light hover:shadow-xl hover:shadow-black/5 transition-all group relative">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => onEditTruck(truck)} className="p-2.5 bg-white text-slate-400 hover:text-blue-600 rounded-xl border border-slate-100 btn-interact shadow-sm"><Edit3 size={14} /></button>
                                <button onClick={() => onDeleteTruck(truck.id)} className="p-2.5 bg-white text-slate-400 hover:text-red-600 rounded-xl border border-slate-100 btn-interact shadow-sm"><Trash2 size={14} /></button>
                            </div>

                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-blue-100/50 shadow-sm">
                                    <Truck size={32} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase truncate">{truck.registration}</h4>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1 truncate">{truck.type || 'Standard Unit'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-[#F4F2EE]/50 rounded-2xl border border-white">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Load Cap</p>
                                    <p className="text-sm font-black mt-1">{truck.tonnageCap || '34'} Tons</p>
                                </div>
                                <div className={`p-5 rounded-2xl border ${truck.status === 'Available' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-blue-50/30 border-blue-100'}`}>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Status</p>
                                    <p className={`text-sm font-black mt-1 ${truck.status === 'Available' ? 'text-emerald-600' : 'text-blue-600'}`}>{truck.status || 'Active'}</p>
                                </div>
                            </div>

                            <div className="mt-10 flex items-center justify-between text-[10px] font-black text-slate-300 uppercase px-1 tracking-widest">
                                <div className="flex items-center gap-2 truncate"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Node Link Stable</div>
                                <span className="shrink-0">Ref: {truck.id.slice(-4).toUpperCase()}</span>
                            </div>
                        </div>
                    ))}
                    {trucks.length === 0 && <div className="col-span-full py-20 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem]">Fleet database is empty.</div>}
                </div>
            </section>
        </div>
    );
};

export default FleetView;
