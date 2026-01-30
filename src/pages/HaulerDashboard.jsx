import React from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import SectionCard from '../components/SectionCard';
import EmptyState from '../components/EmptyState';
import NotificationBell from '../components/NotificationBell';
import TabBtn from '../components/TabBtn';
import StatusBadge from '../components/StatusBadge';
import {
    Truck, MapPin, DollarSign, Search, CheckCircle, ChevronDown,
    Check, X, Package, Clock, AlertTriangle, Briefcase, Calendar,
    LayoutDashboard, User, FileText, ChevronRight, Navigation, Play
} from 'lucide-react';
import LiveMap from '../components/LiveMap';
import { getCoordinates, interpolatePosition } from '../utils/locationUtils';
import ProofOfDelivery from '../components/ProofOfDelivery';
import BillOfLading from '../components/BillOfLading';
import ProfileCard from '../components/ProfileCard';
import { toast } from 'react-hot-toast';
import { serverTimestamp } from 'firebase/firestore';

const HaulerDashboard = ({ activeTab, setActiveTab, availableJobs, myJobs, onAcceptJob, onUpdateStatus, onExpireJob, userProfile }) => {
    const [bolJob, setBolJob] = React.useState(null);
    const [actionLoading, setActionLoading] = React.useState(null);
    const [expandedJobIds, setExpandedJobIds] = React.useState([]);
    const [completingJob, setCompletingJob] = React.useState(null);
    const [orgDrivers, setOrgDrivers] = React.useState([]);

    React.useEffect(() => {
        const fetchDrivers = async () => {
            if (userProfile?.organizationId && ['admin', 'dispatcher', 'owner'].includes(userProfile.role)) {
                try {
                    const q = query(collection(db, "users"), where("organizationId", "==", userProfile.organizationId));
                    const snap = await getDocs(q);
                    // Filter client-side or add index later. simple list for now
                    const drivers = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'driver' || u.role === 'owner');
                    setOrgDrivers(drivers);
                } catch (e) {
                    console.error("Error fetching drivers", e);
                }
            }
        };
        fetchDrivers();
    }, [userProfile]);

    const handleAssignDriver = async (jobId, driverId) => {
        try {
            const driver = orgDrivers.find(d => d.id === driverId);
            await updateDoc(doc(db, "transportJobs", jobId), {
                assignedDriverId: driverId,
                assignedDriverName: driver?.displayName || 'Unknown Driver',
                assignedBy: userProfile.uid
            });
        } catch (e) {
            console.error("Error assigning driver:", e);
        }
    };

    const toggleJobExpansion = (id) => {
        setExpandedJobIds(prev =>
            prev.includes(id) ? prev.filter(jobId => jobId !== id) : [...prev, id]
        );
    };

    const handleAction = async (jobId, actionType, actionFn) => {
        setActionLoading(jobId);
        await actionFn();
        setActionLoading(null);
    };

    // feature: Empty Leg Optimization
    const getReturnLoads = (currentJob) => {
        if (!currentJob || !currentJob.destination) return [];
        // Find open jobs that start where this job ends
        return availableJobs.filter(job =>
            job.departure &&
            (job.departure.toLowerCase().includes(currentJob.destination.toLowerCase()) ||
                currentJob.destination.toLowerCase().includes(job.departure.toLowerCase()))
        );
    };

    const activeJobs = myJobs.filter(job => ['assigned', 'transit'].includes(job.status));
    const pastJobs = myJobs.filter(job => ['delivered', 'cancelled'].includes(job.status));

    // Stats Calculations
    const totalEarnings = pastJobs.filter(j => j.status === 'delivered').reduce((acc, curr) => acc + Number(curr.budget || 0), 0);
    const completedCount = pastJobs.filter(j => j.status === 'delivered').length;
    const pendingCount = activeJobs.length;
    const totalMarketJobs = availableJobs.length;

    return (
        <div className="space-y-10 pb-16">
            {bolJob && <BillOfLading job={bolJob} onClose={() => setBolJob(null)} />}

            {/* Premium Stats Hub */}
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-premium relative overflow-hidden group">
                {/* Dynamic Background Blurs */}
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                                <div className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white/10 flex items-center shadow-lg shadow-primary/20">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-2 animate-ping"></div>
                                    Network Live
                                </div>
                                <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Global Ops v2.4</span>
                            </div>
                            <h1 className="text-5xl font-black tracking-tighter leading-tight">
                                Hauler <span className="gradient-text">Command Center.</span>
                            </h1>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="glass-effect p-1 rounded-2xl border-white/5">
                                <NotificationBell dark={true} />
                            </div>
                            <button className="w-12 h-12 glass-effect flex items-center justify-center rounded-2xl border-white/5 hover:bg-white/10 transition-all border border-white/10">
                                <User className="w-6 h-6 text-white" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Market Loads', val: totalMarketJobs, icon: Briefcase, color: 'text-primary' },
                            { label: 'Active Runs', val: pendingCount, icon: Clock, color: 'text-amber-400' },
                            { label: 'Successful', val: completedCount, icon: CheckCircle, color: 'text-green-400' },
                            { label: 'Net Revenue', val: `$${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-blue-400' }
                        ].map((stat, i) => (
                            <div key={i} className="glass-effect p-6 rounded-3xl border-white/5 hover:bg-white/[0.08] transition-all group/stat">
                                <div className="flex items-center space-x-4 mb-3">
                                    <div className={`p-2.5 bg-white/5 rounded-xl border border-white/10 group-hover/stat:border-white/20 transition-colors ${stat.color}`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                                </div>
                                <p className="text-3xl font-black tracking-tight">{stat.val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div >

            {/* Navigation Tabs */}
            <div className="flex p-1.5 glass-effect rounded-[1.5rem] border border-slate-200/50 w-fit backdrop-blur-md">
                <TabBtn active={activeTab === 'board'} onClick={() => setActiveTab('board')} icon={LayoutDashboard} label="Load Board" />
                <TabBtn active={activeTab === 'active'} onClick={() => setActiveTab('active')} icon={Truck} label="My Fleet Ops" />
            </div >

            {/* Content Area */}
            {
                activeTab === 'board' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {availableJobs.length === 0 ? (
                            <EmptyState icon={Search} title="Market Scanning..." desc="Tracking regional suppliers for new load requirements..." />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {availableJobs.map(job => (
                                    <div key={job.id} className="premium-card group flex flex-col h-full hover:-translate-y-2 transition-all duration-500 overflow-hidden border-slate-100">
                                        {/* Card Header - Modern Gradient */}
                                        <div className="bg-slate-900 p-8 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                            <div className="absolute top-5 right-5 z-10">
                                                <div className="bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg border border-white/10 uppercase tracking-widest animate-pulse">Live Listing</div>
                                            </div>

                                            <div className="relative z-10 space-y-3">
                                                <div className="flex items-center space-x-2 text-primary">
                                                    <Truck className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{job.fleetType}</span>
                                                </div>
                                                <h3 className="text-white font-black text-2xl tracking-tighter leading-tight pr-6 uppercase">
                                                    {job.departure.split(',')[0]}
                                                    <ChevronRight className="w-5 h-5 inline mx-1 text-slate-500" />
                                                    {job.destination.split(',')[0]}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Card Body - Clean & Spaced */}
                                        <div className="p-8 flex-1 flex flex-col justify-between">
                                            <div className="space-y-4 mb-8">
                                                <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-50">
                                                    <span className="font-black text-slate-400 uppercase tracking-widest">Commodity</span>
                                                    <span className="font-bold text-slate-900 uppercase">{job.goodsType}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-50">
                                                    <span className="font-black text-slate-400 uppercase tracking-widest">Cargo Weight</span>
                                                    <span className="font-bold text-slate-900">{job.tonnage} Metric Tons</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-black text-slate-400 uppercase tracking-widest">Dispatch</span>
                                                    <span className="font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10 uppercase">Instant</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Contract Value</span>
                                                    <div className="text-3xl font-black text-slate-900 flex items-start">
                                                        <span className="text-sm text-primary mt-1 mr-0.5">$</span>
                                                        {Number(job.budget).toLocaleString()}
                                                    </div>
                                                </div>

                                                <button
                                                    disabled={actionLoading === job.id}
                                                    onClick={() => handleAction(job.id, 'accept', () => onAcceptJob(job.id))}
                                                    className={`h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 ${actionLoading === job.id
                                                        ? 'bg-slate-100 text-slate-400'
                                                        : 'bg-primary text-white hover:bg-primary-hover hover:shadow-primary/30'
                                                        }`}
                                                >
                                                    {actionLoading === job.id ? 'Securing...' : 'Claim Job'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {
                activeTab === 'active' && (
                    <div className="space-y-8 animate-in fade-in">
                        {activeJobs.length === 0 && pastJobs.length === 0 && (
                            <EmptyState icon={Truck} title="No Active Jobs" desc="No active jobs currently in progress." />
                        )}

                        {/* ACTIVE JOBS */}
                        {activeJobs.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 px-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Active Runs</h3>
                                </div>
                                {activeJobs.map(job => (
                                    <HaulerJobCard
                                        key={job.id}
                                        job={job}
                                        expanded={true}
                                        actionLoading={actionLoading}
                                        handleAction={handleAction}
                                        onUpdateStatus={onUpdateStatus}
                                        onAcceptJob={onAcceptJob}
                                        getReturnLoads={getReturnLoads}
                                        onInitiateDelivery={setCompletingJob}
                                        onExpireJob={onExpireJob}
                                        userProfile={userProfile}
                                        orgDrivers={orgDrivers}
                                        onAssignDriver={handleAssignDriver}
                                        onViewBOL={() => setBolJob(job)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* PAST JOBS */}
                        {pastJobs.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Past Runs</h3>
                                {pastJobs.map(job => (
                                    <HaulerJobCard
                                        key={job.id}
                                        job={job}
                                        expanded={expandedJobIds.includes(job.id)}
                                        onToggleExpand={() => toggleJobExpansion(job.id)}
                                        readOnly={true}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {
                completingJob && (
                    <ProofOfDelivery
                        job={completingJob}
                        onClose={() => setCompletingJob(null)}
                        onSuccess={() => setCompletingJob(null)}
                    />
                )
            }
        </div >
    );
};

const HaulerJobCard = ({ job, expanded, onToggleExpand, readOnly, actionLoading, onUpdateStatus, onAcceptJob, getReturnLoads, onInitiateDelivery, userProfile, orgDrivers, onAssignDriver, onViewBOL }) => {
    const [selectedDriverId, setSelectedDriverId] = React.useState('');

    const handleAssign = async () => {
        if (!selectedDriverId) return;
        try {
            await onAssignDriver(job.id, selectedDriverId);
            toast.success("Driver assigned successfully");
        } catch (e) {
            toast.error("Failed to assign driver");
        }
    };

    if (!expanded) {
        return (
            <div
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                onClick={onToggleExpand}
            >
                <div className="flex items-center space-x-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${job.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                        {job.status === 'delivered' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>

                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <h4 className="font-black text-slate-900 text-base tracking-tight">${Number(job.budget).toLocaleString()} Earned</h4>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-widest">
                                ID: {job.id.slice(-6).toUpperCase()}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight flex items-center">
                            {job.departure?.split(',')[0]}
                            <ChevronRight className="w-3 h-3 mx-2 text-slate-300" />
                            {job.destination?.split(',')[0]}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="hidden md:block text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Finalized On</p>
                        <p className="text-xs font-bold text-slate-700">
                            {job.completedAt ? new Date(job.completedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {['assigned', 'transit', 'delivered'].includes(job.status) && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onViewBOL(); }}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all border border-transparent hover:border-primary/10"
                            >
                                <FileText className="w-5 h-5" />
                            </button>
                        )}
                        <StatusBadge status={job.status} />
                        <div className="p-2 rounded-xl group-hover:bg-primary/5 transition-colors">
                            <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-primary transition-transform duration-300" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const returnLoads = getReturnLoads ? getReturnLoads(job) : [];

    return (
        <div className="premium-card p-10 animate-in slide-in-from-top-4 duration-500 border-slate-100 flex flex-col bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-slate-50">
                <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                        <StatusBadge status={job.status} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference: {job.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{job.goodsType || 'General Cargo'}</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{job.fleetType} • {job.tonnage} Metric Tons</p>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={onViewBOL} className="h-12 px-6 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-primary hover:bg-primary/5 transition-all border border-slate-200/50">
                        <FileText className="w-5 h-5 mr-2" /> Document Vault
                    </button>
                    {readOnly && (
                        <button onClick={onToggleExpand} className="h-12 px-6 rounded-2xl bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest border border-primary/10 hover:bg-primary/10 transition-all">
                            Collapse view
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Route Intelligence</h5>
                    <div className="space-y-5">
                        <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-primary/5">
                            <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-primary rounded-full"></div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center">
                                <MapPin className="w-3.5 h-3.5 mr-2" /> Origin Point
                            </p>
                            <p className="text-sm font-black text-slate-800 uppercase leading-relaxed">{job.departure}</p>
                        </div>
                        <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-green-500/5">
                            <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-green-500 rounded-full"></div>
                            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2 flex items-center">
                                <Navigation className="w-3.5 h-3.5 mr-2" /> Destination Target
                            </p>
                            <p className="text-sm font-black text-slate-800 uppercase leading-relaxed">{job.destination}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Operator Status</h5>

                    {['assigned', 'transit', 'delivered'].includes(job.status) ? (
                        <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 animate-in fade-in zoom-in-95">
                            <div className="flex items-center space-x-5">
                                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                                    <User className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Active Unit</p>
                                    <p className="text-xl font-black text-slate-900">{job.assignedDriverName || 'Primary Asset Assigned'}</p>
                                    <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                                        Communications Link Stable
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 bg-amber-50/50 rounded-[2rem] border border-amber-100/50">
                            <div className="flex items-center space-x-5">
                                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Awaiting Assignment</p>
                                    <p className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mt-1">Standby Mode</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 relative z-10">Contract Value</p>
                        <div className="text-5xl font-black tracking-tighter relative z-10 flex items-center">
                            <span className="text-2xl text-primary mr-1">$</span>
                            {Number(job.budget).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {!readOnly && (
                <div className="pt-8 border-t border-slate-50 space-y-6">
                    {job.status === 'open' && (
                        <div className="space-y-4 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fleet Operations Command</p>
                                <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">Auth: Level 2 Dispatcher</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <select
                                    className="flex-1 h-14 px-6 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-primary/5 outline-none transition-all appearance-none"
                                    value={selectedDriverId}
                                    onChange={e => setSelectedDriverId(e.target.value)}
                                >
                                    <option value="">Select Command Unit...</option>
                                    {orgDrivers?.map(d => (
                                        <option key={d.id} value={d.id}>{d.displayName || d.email}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAssign}
                                    disabled={!selectedDriverId}
                                    className="h-14 px-10 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-hover disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-xl shadow-primary/20 active:scale-95"
                                >
                                    Deploy Asset
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {job.status === 'assigned' && (
                            <button
                                disabled={actionLoading === job.id}
                                onClick={() => onUpdateStatus(job.id, 'transit')}
                                className={`h-16 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 ${actionLoading === job.id
                                    ? 'bg-slate-100 text-slate-400'
                                    : 'bg-primary text-white hover:bg-primary-hover'
                                    }`}
                            >
                                {actionLoading === job.id ? 'Establishing link...' : (
                                    <><Truck className="w-5 h-5 mr-3" /> Initiate Transit</>
                                )}
                            </button>
                        )}

                        {job.status === 'transit' && (
                            <button
                                disabled={actionLoading === job.id}
                                onClick={() => onInitiateDelivery(job)}
                                className={`h-16 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center transition-all shadow-xl shadow-green-600/20 hover:-translate-y-1 ${actionLoading === job.id
                                    ? 'bg-slate-100 text-slate-400'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                {actionLoading === job.id ? 'Syncing Hub...' : (
                                    <><CheckCircle className="w-5 h-5 mr-3" /> Confirm Delivery</>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Empty Leg Recommendations */}
                    {job.status !== 'delivered' && returnLoads.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-slate-50">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <DollarSign className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Market Intelligence: Return Loads</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {returnLoads.map(returnJob => (
                                    <div key={returnJob.id} className="flex justify-between items-center bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all group">
                                        <div>
                                            <div className="text-xl font-black text-slate-900 flex items-start">
                                                <span className="text-xs text-primary mt-1 mr-0.5">$</span>
                                                {Number(returnJob.budget).toLocaleString()}
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">To {returnJob.destination.split(',')[0]}</div>
                                        </div>
                                        <button
                                            onClick={() => onAcceptJob(returnJob.id)}
                                            className="h-10 px-5 bg-white border border-slate-200 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm hover:border-primary group-hover:bg-primary group-hover:text-white transition-all"
                                        >
                                            Secure
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HaulerDashboard;
