import React, { useState } from 'react';
import SectionCard from '../components/SectionCard';
import EmptyState from '../components/EmptyState';
import InputGroup from '../components/InputGroup';
import LocationPicker from '../components/LocationPicker';
import TabBtn from '../components/TabBtn';
import StatusBadge from '../components/StatusBadge';
import { Package, Truck, MapPin, DollarSign, Plus, History, ShieldCheck, Link, Check, Pencil, Trash2, Clock, ChevronDown, X, FileText } from 'lucide-react';
import LiveMap from '../components/LiveMap';
import ProfileCard from '../components/ProfileCard';
import { getCoordinates, interpolatePosition } from '../utils/locationUtils';
import BillOfLading from '../components/BillOfLading';
import BulkUploadModal from '../components/BulkUploadModal';
import { toast } from 'react-hot-toast';

const SupplierDashboard = ({ activeTab, setActiveTab, onPostJob, onEditJob, onDeleteJob, myJobs }) => {
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [bolJob, setBolJob] = useState(null);

    const [formData, setFormData] = useState({
        goodsType: '',
        fleetType: 'Flatbed Truck',
        departure: null,
        destination: null,
        tonnage: '',
        budget: ''
    });

    const [editingId, setEditingId] = useState(null);
    const [expandedJobIds, setExpandedJobIds] = useState([]);

    const toggleJobExpansion = (id) => {
        setExpandedJobIds(prev =>
            prev.includes(id) ? prev.filter(jobId => jobId !== id) : [...prev, id]
        );
    };

    const handleBulkUpload = async (jobs) => {
        const loadingToast = toast.loading(`Importing ${jobs.length} loads...`);
        try {
            for (const job of jobs) {
                await onPostJob({
                    ...job,
                    departureCoords: null,
                    destinationCoords: null
                });
            }
            toast.success("Bulk import complete!", { id: loadingToast });
            setShowBulkUpload(false);
            setActiveTab('history');
        } catch (e) {
            toast.error("Bulk import failed partially.", { id: loadingToast });
        }
    };

    const activeJobs = myJobs.filter(job => ['open', 'assigned', 'transit'].includes(job.status));
    const pastJobs = myJobs.filter(job => ['delivered', 'cancelled'].includes(job.status));

    const FLEET_TYPES = [
        'Flatbed Truck',
        'Box Truck (3 Ton)',
        'Box Truck (10 Ton)',
        'Refrigerated Truck',
        'Tanker (Liquid/Fuel)',
        'Container Carrier (20ft)',
        'Container Carrier (40ft)',
        'Tipper / Dump Truck',
        'Livestock Carrier',
        'Car Carrier',
        'Van',
        'Other'
    ];

    const [viewState, setViewState] = useState('idle'); // idle, posting, success

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.departure || !formData.destination) {
            toast.error("Please select both Pickup and Drop-off locations.");
            return;
        }

        setViewState('posting');

        const payload = {
            goodsType: formData.goodsType,
            fleetType: formData.fleetType,
            tonnage: formData.tonnage,
            budget: formData.budget,
            departure: formData.departure.address,
            departureCoords: formData.departure.coords,
            destination: formData.destination.address,
            destinationCoords: formData.destination.coords
        };

        try {
            if (editingId) {
                await onEditJob(editingId, payload);
            } else {
                await onPostJob(payload);
            }

            setFormData({ goodsType: '', fleetType: 'Flatbed Truck', departure: null, destination: null, tonnage: '', budget: '' });
            setEditingId(null);
            setViewState('success');

            setTimeout(() => {
                setActiveTab('history');
                setViewState('idle');
            }, 1500);
        } catch (error) {
            toast.error("Failed to process request.");
            setViewState('idle');
        }
    };

    const handleEditClick = (job) => {
        setEditingId(job.id);
        setFormData({
            goodsType: job.goodsType || '',
            fleetType: job.fleetType,
            departure: {
                address: job.departure,
                coords: job.departureCoords || getCoordinates(job.departure)
            },
            destination: {
                address: job.destination,
                coords: job.destinationCoords || getCoordinates(job.destination)
            },
            tonnage: job.tonnage,
            budget: job.budget
        });
        setActiveTab('post');
        toast.dismiss();
        toast("Editing mode active", { icon: '✏️' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ goodsType: '', fleetType: 'Flatbed Truck', departure: null, destination: null, tonnage: '', budget: '' });
        setActiveTab('history');
        toast.dismiss();
    };

    return (
        <div className="space-y-10 pb-12">
            {bolJob && <BillOfLading job={bolJob} onClose={() => setBolJob(null)} />}
            {showBulkUpload && <BulkUploadModal onClose={() => setShowBulkUpload(false)} onUpload={handleBulkUpload} />}

            {/* Premium Header / Navigation */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-3 glass-effect rounded-[2rem] gap-4">
                <div className="flex space-x-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                    <TabBtn
                        active={activeTab === 'post'}
                        onClick={() => { setActiveTab('post'); setEditingId(null); setFormData({ goodsType: '', fleetType: 'Flatbed Truck', departure: null, destination: null, tonnage: '', budget: '' }); }}
                        icon={Plus}
                        label="List Load"
                    />
                    <TabBtn
                        active={activeTab === 'history'}
                        onClick={() => setActiveTab('history')}
                        icon={History}
                        label="Your History"
                    />
                </div>

                <div className="flex items-center space-x-3 w-full lg:w-auto">
                    <button
                        onClick={() => setShowBulkUpload(true)}
                        className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                    >
                        <FileText className="w-4 h-4 text-primary" />
                        <span>Bulk Import</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('post')}
                        className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Direct Listing</span>
                    </button>
                </div>
            </div>

            {activeTab === 'post' && (
                <div className="premium-card p-10 space-y-10 animate-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="space-y-2 relative z-10">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                            <ShieldCheck className="w-3 h-3 mr-2" />
                            Secure Market Listing
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                            {editingId ? 'Modify Your ' : 'Create New '}
                            <span className="gradient-text">Load Listing</span>
                        </h2>
                        <p className="text-sm font-medium text-slate-500">
                            {editingId ? 'Update your requirements to attract the best hauling partners.' : 'Detail your cargo to connect with professional verified haulers instantly.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        <div className="group transition-all">
                            <InputGroup
                                label="Cargo Description"
                                icon={Package}
                                placeholder="e.g. 500x Cases of Bottled Water (Fragile)"
                                value={formData.goodsType}
                                onChange={v => setFormData({ ...formData, goodsType: v })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Logistics Mode</label>
                                <div className="relative group">
                                    <Truck className="absolute left-5 top-5 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <select
                                        className="w-full pl-14 pr-5 py-5 bg-slate-50/50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-sm appearance-none text-slate-900"
                                        value={formData.fleetType}
                                        onChange={e => setFormData({ ...formData, fleetType: e.target.value })}
                                    >
                                        {FLEET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-5 w-5 h-5 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <InputGroup label="Tonnage (Est)" icon={ShieldCheck} type="number" placeholder="5.4" value={formData.tonnage} onChange={v => setFormData({ ...formData, tonnage: v })} />
                                <InputGroup label="Load Budget ($)" icon={DollarSign} type="number" placeholder="1250" value={formData.budget} onChange={v => setFormData({ ...formData, budget: v })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-1.5 bg-slate-50/50 rounded-[2.5rem] border border-slate-200/50 shadow-inner">
                            <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-premium">
                                <LocationPicker
                                    label="Collection Network Point"
                                    placeholder="Select Pickup..."
                                    value={formData.departure}
                                    onChange={val => setFormData({ ...formData, departure: val })}
                                />
                            </div>
                            <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-premium">
                                <LocationPicker
                                    label="Target Delivery Point"
                                    placeholder="Select Drop-off..."
                                    value={formData.destination}
                                    onChange={val => setFormData({ ...formData, destination: val })}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-6">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="flex-1 py-5 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-50 hover:text-slate-900 transition-all uppercase text-xs tracking-widest"
                                >
                                    Discard Changes
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={viewState !== 'idle'}
                                className={`flex-[2] py-5 font-black rounded-3xl shadow-xl transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 ${viewState === 'success' ? 'bg-green-500 text-white scale-[1.02]' :
                                    viewState === 'posting' ? 'bg-slate-200 text-slate-400 cursor-wait' :
                                        'bg-primary hover:bg-primary-hover text-white hover:shadow-primary/30 hover:-translate-y-1'
                                    } `}
                            >
                                {viewState === 'posting' && <div className="w-5 h-5 border-[3px] border-slate-300 border-t-white rounded-full animate-spin"></div>}
                                {viewState === 'success' && <Check className="w-5 h-5 animate-in zoom-in" strokeWidth={4} />}
                                <span>
                                    {viewState === 'posting' ? 'Processing Transaction...' :
                                        viewState === 'success' ? 'Listing Confirmed' :
                                            editingId ? 'Update Network Listing' : 'Publish Load Directly'}
                                </span>
                                {viewState === 'idle' && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={3} />}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {activeJobs.length === 0 && pastJobs.length === 0 && (
                        <EmptyState icon={Package} title="Marketplace History" desc="You haven't listed any transport requests yet. Your future activity will appear here." />
                    )}

                    {activeJobs.length > 0 && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Marketplace Listings</h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2.5 py-1 rounded-full">{activeJobs.length} Live</span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {activeJobs.map(job => (
                                    <JobCard key={job.id} job={job} expanded={true} onEdit={() => handleEditClick(job)} onDelete={() => onDeleteJob(job.id)} onViewBOL={() => setBolJob(job)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {pastJobs.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 px-2">
                                <History className="w-4 h-4 text-slate-400" />
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Past Fulfillment</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-3 opacity-80 hover:opacity-100 transition-opacity">
                                {pastJobs.map(job => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        expanded={expandedJobIds.includes(job.id)}
                                        onToggleExpand={() => toggleJobExpansion(job.id)}
                                        readOnly={true}
                                        onViewBOL={() => setBolJob(job)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SupplierDashboard;

const JobCard = ({ job, expanded, onToggleExpand, readOnly, onEdit, onDelete, onViewBOL }) => {
    const [showProfile, setShowProfile] = useState(false);

    // Collapsed View
    if (!expanded) {
        return (
            <div
                className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-premium flex items-center justify-between group hover:border-primary/30 hover:shadow-premium-hover transition-all cursor-pointer"
                onClick={onToggleExpand}
            >
                <div className="flex items-center space-x-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${job.status === 'delivered' ? 'bg-green-50 text-green-500' : 'bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white'
                        }`}>
                        {job.status === 'delivered' ? <CheckCircle className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                    </div>

                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <h4 className="font-black text-slate-900 text-base">{job.goodsType || 'General Cargo'}</h4>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                ID-{job.id.slice(-4).toUpperCase()}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] flex items-center">
                            <MapPin className="w-3 h-3 mr-1 text-primary/50" />
                            {job.departure?.split(',')[0] || 'Unknown Origin'}
                            <ChevronRight className="w-3 h-3 mx-2 text-slate-300" />
                            {job.destination?.split(',')[0] || 'Unknown Target'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="hidden md:block text-right">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Last Update</p>
                        <p className="text-xs font-bold text-slate-600">
                            {job.completedAt ? new Date(job.completedAt.seconds * 1000).toLocaleDateString() : 'Active Now'}
                        </p>
                    </div>
                    <StatusBadge status={job.status} />
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                        <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-primary transition-all group-hover:translate-y-0.5" />
                    </div>
                </div>
            </div>
        );
    }

    // Full Expanded View
    const steps = ['open', 'assigned', 'transit', 'delivered'];
    let currentStepIdx = steps.indexOf(job.status);
    if (currentStepIdx === -1) currentStepIdx = 0;

    const startCoords = job.departureCoords || getCoordinates(job.departure);
    const endCoords = job.destinationCoords || getCoordinates(job.destination);

    const showMap = (job.status === 'assigned' || job.status === 'transit') &&
        startCoords && endCoords &&
        !isNaN(startCoords[0]) && !isNaN(endCoords[0]);

    return (
        <div className="premium-card p-10 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10"></div>

            <div className="flex flex-col lg:flex-row justify-between items-start mb-10 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                        <span className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/10 uppercase tracking-widest">
                            Tracking: {job.id.slice(-8).toUpperCase()}
                        </span>
                        {startCoords && (
                            <span className="flex items-center bg-green-50 text-green-600 text-[10px] font-black px-3 py-1 rounded-full border border-green-100 uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                Live Signal
                            </span>
                        )}
                    </div>
                    <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{job.goodsType || 'General Cargo'}</h4>
                    <p className="text-sm text-slate-500 font-medium">
                        <span className="text-primary font-black uppercase text-xs mr-2">{job.fleetType}</span>
                        • Specialized Tonnage: {job.tonnage}T
                    </p>
                </div>
                <div className="flex items-center space-x-3 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
                    {job.status === 'open' && !readOnly && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200" title="Edit Job">
                                <Pencil className="w-5 h-5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200" title="Delete Job">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    <button onClick={(e) => { e.stopPropagation(); onViewBOL(); }} className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200" title="Digital BOL">
                        <FileText className="w-5 h-5" />
                    </button>

                    {readOnly && (
                        <button onClick={onToggleExpand} className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200" title="Collapse">
                            <ChevronDown className="w-6 h-6 rotate-180" />
                        </button>
                    )}

                    {!readOnly && <StatusBadge status={job.status} />}
                </div>
            </div>

            {showMap && (
                <div className="w-full h-80 mb-10 rounded-[2rem] overflow-hidden shadow-premium border border-slate-200 relative z-0">
                    <LiveMap
                        startPos={startCoords}
                        endPos={endCoords}
                        driverPos={job.status === 'assigned' ? startCoords : interpolatePosition(startCoords, endCoords, 0.4)}
                    />
                    <div className="absolute top-4 right-4 glass-effect px-4 py-2 rounded-2xl text-[10px] font-black uppercase text-slate-800 shadow-xl z-[400] border border-white/50 flex items-center">
                        <Globe className="w-3 h-3 mr-2 animate-spin-slow" />
                        Live Network Feed
                    </div>
                </div>
            )}

            {/* Logistics Detail Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Hauler Connection */}
                <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>

                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center space-x-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${job.status === 'open' ? 'bg-primary animate-pulse' : 'bg-green-500'}`}></div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest"> Hauling Authority</span>
                        </div>
                        {job.status !== 'open' && (
                            <div className="flex items-center text-[9px] text-green-400 font-black bg-white/5 px-3 py-1 rounded-full border border-white/10 tracking-widest">
                                <ShieldCheck className="w-3 h-3 mr-1.5" />
                                SECURE IDENTITY
                            </div>
                        )}
                    </div>

                    {job.status === 'open' ? (
                        <div className="flex items-center space-x-4 relative z-10 py-2">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 animate-pulse flex items-center justify-center">
                                <Search className="w-6 h-6 text-slate-600" />
                            </div>
                            <div className="space-y-2">
                                <div className="w-32 h-3 bg-white/5 rounded-full animate-pulse"></div>
                                <div className="w-20 h-2 bg-white/5 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10">
                            {job.haulerProfile ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 rounded-2xl border-2 border-primary/30 overflow-hidden bg-slate-800 shadow-lg group-hover:scale-105 transition-transform duration-500">
                                                {job.haulerProfile.universal?.photoURL ? (
                                                    <img src={job.haulerProfile.universal.photoURL} alt="Driver" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                        <User className="w-8 h-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-white uppercase group-hover:text-primary transition-colors">
                                                    {job.haulerProfile.universal?.displayName || "Regional Driver"}
                                                </h4>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connection Active</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowProfile(!showProfile)}
                                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all"
                                        >
                                            <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${showProfile ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>

                                    {showProfile && (
                                        <div className="pt-4 border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
                                            <ProfileCard profileData={job.haulerProfile} role="hauler" expanded={true} dark={true} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                                            <Truck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight">Driver Assigned</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID: {job.haulerId?.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center space-x-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                                        <span className="text-[10px] font-mono text-slate-500">{job.id.slice(-4).toUpperCase()}</span>
                                        <div className="w-4 h-[1px] bg-white/10"></div>
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <Link className="w-3 h-3 text-white" />
                                        </div>
                                        <div className="w-4 h-[1px] bg-white/10"></div>
                                        <span className="text-[10px] font-mono text-slate-500">{job.haulerId?.slice(-4).toUpperCase() || '????'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tracking Progress */}
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3 text-slate-900">
                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                <History className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Fulfillment Pipeline</span>
                        </div>
                        {job.status !== 'open' && (
                            <div className="flex items-center space-x-2 bg-white text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-slate-200 shadow-sm tracking-widest">
                                <Clock className="w-3.5 h-3.5" />
                                <span>2-Day Delivery</span>
                            </div>
                        )}
                    </div>

                    <div className="relative flex items-center justify-between px-2 py-4">
                        <div className="absolute left-6 right-6 top-1/2 -translate-y-[1.4rem] h-1.5 bg-slate-200 rounded-full -z-10"></div>
                        <div
                            className="absolute left-6 top-1/2 -translate-y-[1.4rem] h-1.5 bg-primary rounded-full -z-10 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                            style={{ width: `${(currentStepIdx / (steps.length - 1)) * 90}%` }}
                        ></div>

                        {steps.map((step, idx) => {
                            const isCompleted = currentStepIdx > idx;
                            const isCurrent = currentStepIdx === idx;
                            return (
                                <div key={step} className="flex flex-col items-center relative z-0 w-2">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-4 transition-all duration-700 shadow-lg ${isCompleted ? 'bg-primary border-primary scale-100' :
                                            isCurrent ? 'bg-white border-primary scale-125 ring-8 ring-primary/5 shadow-primary/20' :
                                                'bg-white border-slate-200'
                                        }`}>
                                        {isCompleted ? <Check className="w-5 h-5 text-white" strokeWidth={4} /> :
                                            isCurrent ? <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" /> :
                                                <div className="w-2.5 h-2.5 bg-slate-200 rounded-full" />}
                                    </div>
                                    <div className={`absolute top-14 flex flex-col items-center transition-all duration-500 w-24 ${isCurrent ? 'translate-y-1' : ''}`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest text-center leading-3 ${isCurrent ? 'text-primary' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                                            }`}>
                                            {step === 'open' ? 'Posted' : step === 'assigned' ? 'Security Match' : step === 'transit' ? 'In Transit' : 'Final Delivery'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Context Message */}
            <div className="text-center p-6 bg-slate-50 border border-slate-200 rounded-[2rem] shadow-inner mb-8">
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                    {job.status === 'open' && "Network active: Identifying verified carriers in your hub..."}
                    {job.status === 'assigned' && `Carrier ${job.haulerEmail || 'Protocol'} has authorized secure pickup.`}
                    {job.status === 'transit' && "Cargo integrity verified. Real-time telemetry active on map."}
                    {job.status === 'delivered' && "Transaction complete. Proof of Delivery cloud-stored."}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Network Genesis</p>
                    <p className="text-sm font-black text-white uppercase">{job.departure}</p>
                </div>
                <div className="text-left md:text-right space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Fulfillment Target</p>
                    <p className="text-sm font-black text-white uppercase">{job.destination}</p>
                </div>
            </div>
        </div>
    );
};
