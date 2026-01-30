
import React from 'react';
import {
    Search,
    Wrench,
    ShieldAlert,
    Settings,
    MapPin,
    ChevronRight,
    CheckCircle,
    Clock,
    DollarSign
} from 'lucide-react';
import TabBtn from '../components/TabBtn';
import SectionCard from '../components/SectionCard';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

const MechanicDashboard = ({
    activeTab,
    setActiveTab,
    publicBoard,
    handleAcceptJob,
    activeMechanicJobs,
    handleUpdateStatus,
    pastMechanicJobs
}) => {
    return (
        <>
            {/* P2P Navigation */}
            <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-slate-200">
                <TabBtn active={activeTab === 'board'} onClick={() => setActiveTab('board')} icon={Search} label="Job Board" />
                <TabBtn active={activeTab === 'active-jobs'} onClick={() => setActiveTab('active-jobs')} icon={Wrench} label="Workbay" />
            </div>

            {/* MECHANIC: Global Job Board */}
            {activeTab === 'board' && (
                <div className="space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Direct Contracts</h3>
                        <div className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            Broker-Free Verified
                        </div>
                    </div>

                    {publicBoard.length === 0 ? (
                        <EmptyState icon={Search} title="Board Clear" desc="No open work orders in your area right now." />
                    ) : (
                        publicBoard.map(job => (
                            <SectionCard key={job.id} className="p-5 border-l-4 border-emerald-500">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <p className="text-3xl font-black text-slate-800">${job.netPayout.toLocaleString()}</p>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tight">Your Guaranteed Payout (Net)</p>
                                    </div>
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                                        <Settings className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="font-black text-lg text-slate-800 uppercase">{job.vehicleModel}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">{job.serviceType}</p>
                                    <div className="flex items-center text-xs font-bold text-slate-600">
                                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
                                        {job.location}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleAcceptJob(job.id)}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center uppercase"
                                >
                                    Claim Work Order
                                    <ChevronRight className="w-5 h-5 ml-1" />
                                </button>
                            </SectionCard>
                        ))
                    )}
                </div>
            )}

            {/* MECHANIC: Active Workbay */}
            {activeTab === 'active-jobs' && (
                <div className="space-y-8 animate-in fade-in">
                    {activeMechanicJobs.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <Wrench className="w-3 h-3 mr-2 text-emerald-500" />
                                Active Manifests
                            </h3>
                            {activeMechanicJobs.map(job => (
                                <SectionCard key={job.id} className="relative border-emerald-200">
                                    <div className="p-6 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-slate-400 uppercase leading-none">Job Rate (Net)</p>
                                                <p className="text-2xl font-black text-slate-800">${job.netPayout.toLocaleString()}</p>
                                            </div>
                                            <StatusBadge status={job.status} />
                                        </div>

                                        <div className="p-4 bg-slate-50 rounded-2xl">
                                            <h4 className="font-black text-slate-800 uppercase leading-none mb-1">{job.vehicleModel}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{job.serviceType} • Loc: {job.location}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
                                                {['assigned', 'diagnosing', 'repairing', 'testing', 'ready'].map((step, idx) => {
                                                    const seq = ['assigned', 'diagnosing', 'repairing', 'testing', 'ready'];
                                                    const currIdx = seq.indexOf(job.status);
                                                    const active = step === job.status;
                                                    const done = currIdx > idx;
                                                    return (
                                                        <button
                                                            key={step}
                                                            disabled={!active || step === 'ready'}
                                                            onClick={() => handleUpdateStatus(job.id, job.status)}
                                                            className={`flex flex-col items-center justify-center py-3 rounded-lg transition-all ${active ? 'bg-white shadow-md text-emerald-600 scale-105' :
                                                                done ? 'text-emerald-400' : 'text-slate-300'
                                                                }`}
                                                        >
                                                            {done ? <CheckCircle className="w-4 h-4" /> : <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                                                            <span className="text-[7px] font-black uppercase mt-1 tracking-tighter">{step}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {job.status !== 'ready' ? (
                                                <button
                                                    onClick={() => handleUpdateStatus(job.id, job.status)}
                                                    className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center uppercase"
                                                >
                                                    Progress Stage
                                                    <ChevronRight className="w-5 h-5 ml-1" />
                                                </button>
                                            ) : (
                                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] font-black uppercase text-center flex items-center justify-center">
                                                    <Clock className="w-4 h-4 mr-2" /> Pending Escrow Release by Client
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </SectionCard>
                            ))}
                        </div>
                    )}

                    {pastMechanicJobs.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <DollarSign className="w-3 h-3 mr-2 text-emerald-600" />
                                Settle Accounts
                            </h3>
                            {pastMechanicJobs.map(job => (
                                <div key={job.id} className="p-4 bg-white rounded-xl border border-slate-200 opacity-60 flex justify-between items-center">
                                    <div>
                                        <p className="font-black text-slate-700 uppercase text-sm">{job.vehicleModel}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{job.serviceType} • {job.id.slice(-6)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-emerald-600 text-lg">${job.netPayout.toLocaleString()}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Paid Out</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default MechanicDashboard;
