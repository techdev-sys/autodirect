
import React from 'react';
import {
    Plus,
    History,
    Car,
    MapPin,
    DollarSign,
    Lock,
    ChevronRight,
    CreditCard,
    ShieldCheck,
    Wrench
} from 'lucide-react';
import TabBtn from '../components/TabBtn';
import SectionCard from '../components/SectionCard';
import InputGroup from '../components/InputGroup';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { SERVICE_TYPES } from '../data/constants';

const OwnerDashboard = ({
    activeTab,
    setActiveTab,
    newJob,
    setNewJob,
    handlePostJob,
    ownerJobs,
    handleReleasePayment
}) => {
    return (
        <>
            {/* P2P Navigation */}
            <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-slate-200">
                <TabBtn active={activeTab === 'post'} onClick={() => setActiveTab('post')} icon={Plus} label="New Request" />
                <TabBtn active={activeTab === 'my-requests'} onClick={() => setActiveTab('my-requests')} icon={History} label="My Garage" />
            </div>

            {/* OWNER: Create Repair Request */}
            {activeTab === 'post' && (
                <SectionCard className="p-6 space-y-6 animate-in slide-in-from-right-4">
                    <div className="space-y-1">
                        <h2 className="font-black text-2xl text-slate-800 uppercase">Launch Repair Listing</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase">Connect directly with certified independent mechanics.</p>
                    </div>

                    <form onSubmit={handlePostJob} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup label="Vehicle Model" icon={Car} placeholder="e.g. 2019 Ford Ranger" value={newJob.vehicleModel} onChange={v => setNewJob({ ...newJob, vehicleModel: v })} />
                            <InputGroup label="Location" icon={MapPin} placeholder="Your City/Area" value={newJob.location} onChange={v => setNewJob({ ...newJob, location: v })} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Service Category</label>
                                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" value={newJob.serviceType} onChange={e => setNewJob({ ...newJob, serviceType: e.target.value })}>
                                    {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <InputGroup label="Repair Budget ($)" icon={DollarSign} type="number" placeholder="Offer Amount" value={newJob.budget} onChange={v => setNewJob({ ...newJob, budget: v })} />
                        </div>

                        {newJob.budget && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
                                <div className="flex items-center space-x-2 text-blue-800 font-black text-xs uppercase">
                                    <Lock className="w-4 h-4" /> <span>Direct Payment Escrow</span>
                                </div>
                                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                    Your total budget of <b>${newJob.budget}</b> will be held in our secure escrow.
                                    The mechanic sees the net payout, removing any broker negotiation. You release the funds
                                    only when repairs are verified.
                                </p>
                            </div>
                        )}

                        <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all uppercase flex items-center justify-center">
                            List Verified Request
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </button>
                    </form>
                </SectionCard>
            )}

            {/* OWNER: Active & Past Requests */}
            {activeTab === 'my-requests' && (
                <div className="space-y-4 animate-in fade-in">
                    {ownerJobs.length === 0 ? (
                        <EmptyState icon={Car} title="Garage Empty" desc="You haven't posted any repair requests yet." />
                    ) : (
                        ownerJobs.map(job => (
                            <SectionCard key={job.id} className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <StatusBadge status={job.status} />
                                    <div className="text-right">
                                        <p className="text-xl font-black text-slate-900">${job.totalBudget.toLocaleString()}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Escrow Secured</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="font-black text-lg text-slate-800 uppercase">{job.vehicleModel}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase">{job.serviceType} • {job.location}</p>
                                </div>

                                {job.status === 'ready' && (
                                    <button
                                        onClick={() => handleReleasePayment(job.id)}
                                        className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl flex items-center justify-center animate-pulse shadow-lg"
                                    >
                                        <CreditCard className="w-5 h-5 mr-2" /> Release Funds to Mechanic
                                    </button>
                                )}

                                {job.status === 'paid' && (
                                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl font-black text-center text-xs uppercase flex items-center justify-center">
                                        <ShieldCheck className="w-4 h-4 mr-2" /> Contract Successfully Settled
                                    </div>
                                )}

                                {job.mechanicId && !['ready', 'paid'].includes(job.status) && (
                                    <div className="p-4 bg-blue-50 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                                                <Wrench className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-blue-400 uppercase leading-none">Mechanic Active</p>
                                                <p className="text-sm font-bold text-blue-700">{job.mechanicName}</p>
                                            </div>
                                        </div>
                                        <div className="animate-pulse flex space-x-1">
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                        </div>
                                    </div>
                                )}
                            </SectionCard>
                        ))
                    )}
                </div>
            )}
        </>
    );
};

export default OwnerDashboard;
