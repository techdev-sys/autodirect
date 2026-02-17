import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Home,
    Plus,
    History,
    Wallet,
    Settings,
    CheckCircle,
    Search,
    Package,
    Truck,
    MapPin,
    DollarSign,
    ShieldCheck,
    Activity,
    PlusCircle,
    TrendingUp,
    Bell,
    Smartphone,
    Clock,
    ChevronRight,
    Filter,
    Download,
    Globe,
    Trash2,
    X,
    User,
    Camera,
    BadgeCheck,
    Check,
    Upload,
    FileText,
    Lock,
    Building2,
    BellRing,
    MoreVertical,
    Save,
    Menu,
    LogOut,
    ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SectionCard from '../components/SectionCard';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import EmptyState from '../components/EmptyState';
import LocationPicker from '../components/LocationPicker';
import InputGroup from '../components/InputGroup';
import StatusBadge from '../components/StatusBadge';
import BillOfLading from '../components/BillOfLading';
import BulkUploadModal from '../components/BulkUploadModal';
import LogoutModal from '../components/hauler/LogoutModal';
import { auth } from '../firebaseConfig';
import SettingsView from './supplier/SettingsView';

const SupplierDashboard = ({
    activeTab: propsActiveTab,
    setActiveTab: propsSetActiveTab,
    onPostJob,
    onEditJob,
    onDeleteJob,
    myJobs,
    user,
    userProfile
}) => {
    const [internalActiveTab, setInternalActiveTab] = useState('dashboard');
    const activeTab = propsActiveTab || internalActiveTab;
    const setActiveTab = propsSetActiveTab || setInternalActiveTab;

    const [isPosting, setIsPosting] = useState(false);
    const [showPostSuccess, setShowPostSuccess] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showBOL, setShowBOL] = useState(null);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        goodsType: 'Manganese Ore',
        tonnage: '',
        fleetType: 'Side Tipper',
        departure: '',
        destination: '',
        budget: '',
        instructions: ''
    });

    // Real-time Jobs
    const activeJobs = myJobs.filter(j => j.status !== 'delivered' && j.status !== 'paid');
    const historyJobs = myJobs.filter(j => j.status === 'delivered' || j.status === 'paid');

    // Stats
    const totalTonnage = myJobs.reduce((acc, j) => acc + (Number(j.tonnage) || 0), 0);
    const activePipelineValue = activeJobs.reduce((acc, j) => acc + (Number(j.budget) || 0), 0);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // --- Validation Layer ---
        const { goodsType, tonnage, departure, destination, budget } = formData;

        if (!goodsType || !departure || !destination) {
            return toast.error("Operational requirement: All manifest nodes must be identified.");
        }

        const numTonnage = parseFloat(tonnage);
        const numBudget = parseFloat(budget);

        if (isNaN(numTonnage) || numTonnage <= 0) {
            return toast.error("Invalid Payload: Weight must be a positive numerical value.");
        }

        if (isNaN(numBudget) || numBudget <= 0) {
            return toast.error("Finanacial Error: Target budget must be a valid currency value.");
        }

        setIsPosting(true);
        try {
            // Clean data before submission
            const cleanData = {
                ...formData,
                tonnage: numTonnage,
                budget: numBudget
            };

            if (editingId) {
                await onEditJob(editingId, cleanData);
                setEditingId(null);
                setActiveTab('history');
            } else {
                await onPostJob(cleanData);
                setShowPostSuccess(true);
            }
            setFormData({
                goodsType: 'Manganese Ore',
                tonnage: '',
                fleetType: 'Side Tipper',
                departure: '',
                destination: '',
                budget: '',
                instructions: ''
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleBulkUpload = async (jobs) => {
        const loadingToast = toast.loading(`Broadcasting ${jobs.length} manifests...`);
        try {
            for (const job of jobs) {
                await onPostJob({
                    ...job,
                    status: 'open',
                    createdAt: Date.now()
                });
            }
            toast.success("Network Synchronized Successfully", { id: loadingToast });
            setShowBulkModal(false);
            setActiveTab('history');
        } catch (error) {
            toast.error("Batch transmission failed", { id: loadingToast });
        }
    };

    return (
        <div className="flex min-h-screen bg-theme-bg font-sans selection:bg-orange-100 selection:text-orange-600 px-4 sm:px-8 md:px-12 py-6 md:py-12 gap-8 overflow-x-hidden pb-32 md:pb-12">
            {/* Desktop Sidebar - Left Floating Bar */}
            <aside className="fixed left-8 top-8 bottom-8 hidden md:flex flex-col items-center justify-between z-30 font-sans">
                <div className="flex flex-col gap-8 items-center">
                    <div className="w-12 h-12 flex items-center justify-center btn-interact">
                        <div className="w-10 h-10 bg-theme-card-dark rounded-xl flex items-center justify-center text-white">
                            <Truck className="text-theme-accent-yellow w-5 h-5" />
                        </div>
                    </div>

                    <div className="pill-sidebar-container">
                        <SidebarIcon
                            active={activeTab === 'dashboard'}
                            onClick={() => setActiveTab('dashboard')}
                            icon={Home}
                            title="Home"
                        />
                        <SidebarIcon
                            active={activeTab === 'post'}
                            onClick={() => { setActiveTab('post'); setEditingId(null); }}
                            icon={PlusCircle}
                            title="Upload Job"
                        />
                    </div>

                    <div className="pill-sidebar-container">
                        <SidebarIcon
                            active={activeTab === 'history'}
                            onClick={() => setActiveTab('history')}
                            icon={Activity}
                            title="Active Jobs"
                        />
                        <SidebarIcon
                            active={activeTab === 'wallet'}
                            onClick={() => setActiveTab('wallet')}
                            icon={Wallet}
                            title="Wallet"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4 items-center">
                    <div className="pill-sidebar-container">
                        <SidebarIcon
                            active={activeTab === 'settings'}
                            onClick={() => setActiveTab('settings')}
                            icon={Settings}
                            title="Settings"
                        />
                        <div className="relative group">
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all btn-interact"
                            >
                                <LogOut size={20} />
                            </button>
                            <div className="sidebar-tooltip">Log Out</div>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md btn-interact">
                        <img src={`https://ui-avatars.com/api/?name=${userProfile?.universal?.displayName || user.email}&background=random`} alt="User" className="w-full h-full object-cover" />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-40 flex flex-col gap-16 max-w-[1600px] mx-auto w-full px-4 sm:px-8 md:px-20 py-12 md:py-24 pb-40 md:pb-24">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-12 mt-4 overflow-hidden">
                    <div>
                        <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">
                            Hi, {userProfile?.universal?.displayName?.split(' ')[0] || 'Partner'}!
                        </h1>
                        <p className="text-slate-400 font-bold text-[10px] md:text-sm mt-3 uppercase tracking-[0.2em]">Operational Status: Optimal Performance</p>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto mt-2 md:mt-0">
                        <div className="relative group flex-1 md:flex-none">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5 md:w-4 md:h-4" />
                            <input
                                type="text"
                                placeholder="Search manifests..."
                                className="pl-10 pr-6 py-2.5 md:py-3 bg-white border-none rounded-xl md:rounded-2xl text-xs md:text-sm font-medium w-full md:w-64 shadow-sm focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                            />
                        </div>
                        <button
                            onClick={() => setActiveTab('post')}
                            className="bg-theme-card-dark text-white px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all shadow-lg btn-interact hidden md:block"
                        >
                            Broadcast Load
                        </button>
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="p-2.5 md:p-3 bg-white text-slate-400 hover:text-red-500 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center transition-all btn-interact shrink-0"
                        >
                            <LogOut size={18} className="md:w-5 md:h-5" />
                        </button>
                    </div>
                </header>

                {/* Dashboard View */}
                {(activeTab === 'dashboard' || activeTab === 'board') && (
                    <div className="flex flex-col gap-16 animate-in fade-in duration-700">

                        {/* Top Grid: Hero Stats & Calendar */}
                        <div className="grid grid-cols-12 gap-12">

                            {/* Main Results Card */}
                            <div className="col-span-12 lg:col-span-8 bg-theme-card-beige rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 relative overflow-hidden h-[380px] md:h-[450px] shadow-premium">
                                {/* Abstract Blobs */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-80">
                                    <div className="absolute top-10 left-1/4 w-40 md:w-60 h-40 md:h-60 bg-theme-accent-red rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
                                    <div className="absolute top-20 right-1/4 w-52 md:w-72 h-52 md:h-72 bg-theme-accent-yellow rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
                                    <div className="absolute -bottom-10 left-1/2 w-44 md:w-64 h-44 md:h-64 bg-slate-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                                </div>

                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold text-slate-800">Your Logistics</h3>
                                        <p className="text-base md:text-lg font-medium text-slate-600">Results for Today</p>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <StatIndicator color="bg-theme-accent-yellow" label="Delivered" value={`${activeJobs.filter(j => j.status === 'delivered').length} Loads`} />
                                        <StatIndicator color="bg-theme-accent-red" label="In Transit" value={`${activeJobs.filter(j => j.status === 'in_transit').length} Loads`} />
                                        <StatIndicator color="bg-theme-card-dark" label="Active Value" value={`USD ${(activePipelineValue / 1000).toFixed(1)}k`} />
                                    </div>

                                    {/* Central Data Visualization Overlay */}
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-center">
                                        <div className="w-24 h-24 bg-theme-card-dark rounded-full flex flex-col items-center justify-center text-white shadow-2xl">
                                            <span className="text-xl font-bold">{activeJobs.length}</span>
                                            <span className="text-[10px] uppercase font-bold opacity-60">Loads</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Black Schedule Card */}
                            <div className="col-span-12 lg:col-span-4 bg-theme-card-dark rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 text-white shadow-2xl flex flex-col justify-between h-[400px] md:h-[450px]">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold">Upcoming Orders</h3>
                                    <span className="text-slate-400 font-bold text-sm">February</span>
                                </div>

                                <div className="grid grid-cols-7 gap-y-4 text-center">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                        <span key={i} className="text-[10px] font-bold text-slate-500">{d}</span>
                                    ))}
                                    {Array.from({ length: 14 }).map((_, i) => (
                                        <div key={i} className={`flex items-center justify-center h-10 w-10 mx-auto rounded-full text-sm font-bold transition-all ${i === 4 ? 'bg-theme-accent-yellow text-slate-900 shadow-lg shadow-theme-accent-yellow/20' : i === 8 ? 'border-2 border-slate-700' : 'text-slate-400'}`}>
                                            {i + 1}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full border border-slate-500"></div>
                                        <span>Current</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-theme-accent-yellow shadow-sm shadow-theme-accent-yellow/50"></div>
                                        <span>Scheduled</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Row: Detailed Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
                            {/* Live Tonnage Card */}
                            <div className="col-span-12 md:col-span-4 bg-white rounded-2xl md:rounded-[3rem] p-5 md:p-8 shadow-premium border border-white flex flex-col justify-between h-52 md:h-56">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">Tonnage Today</h4>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Payload</p>
                                    </div>
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                        <div className="w-4 h-4 rounded-full border-2 border-theme-accent-red animate-pulse"></div>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-black text-slate-900 tracking-tighter italic">8,500 <span className="text-sm not-italic opacity-40 uppercase">Tons</span></span>
                                        <button className="mt-2 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 flex items-center gap-1 group">
                                            Adjust Target <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                                        </button>
                                    </div>
                                    {/* Small Circular Progress */}
                                    <div className="relative w-16 h-16">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-slate-100" />
                                            <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray="176" strokeDashoffset="44" className="text-theme-accent-red" strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">75%</div>
                                    </div>
                                </div>
                            </div>

                            {/* Revenue Plan Card */}
                            <div className="col-span-12 md:col-span-4 bg-white rounded-2xl md:rounded-[3rem] p-5 md:p-8 shadow-premium border border-white flex flex-col justify-between h-52 md:h-56">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">Revenue Plan</h4>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Monthly Quota</p>
                                    </div>
                                    <span className="text-lg font-bold text-slate-900">68% <span className="text-[10px] text-slate-400">Completed</span></span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>USD 58k</span>
                                        <span>USD 150k</span>
                                    </div>
                                    <div className="h-6 bg-slate-50 rounded-full p-1 relative">
                                        <div className="h-full bg-slate-900 rounded-full transition-all duration-1000" style={{ width: '68%' }}></div>
                                        {/* Floating Label */}
                                        <div className="absolute left-[68%] -top-8 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold py-1 px-3 rounded-full flex items-center gap-1">
                                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-theme-accent-yellow"></span>
                                            $102.3k
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Insights Card */}
                            <div className="col-span-12 md:col-span-4 bg-white rounded-2xl md:rounded-[3rem] p-5 md:p-8 shadow-premium border border-white flex flex-col justify-between h-52 md:h-56">
                                <h4 className="text-lg font-bold text-slate-800">Fleet Insights</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">On-Time</p>
                                        <p className="text-xl font-bold text-slate-900 tracking-tight">98.4%</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                                        <p className="text-xl font-bold text-slate-900 tracking-tight">+12.4%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section: Operations Table/List */}
                        <div className="bg-white rounded-3xl md:rounded-[4rem] p-6 md:p-10 shadow-premium border border-white flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-800">Operational Pulse</h3>
                                <button className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all group">
                                    <div className="w-8 h-8 flex items-center justify-center font-bold text-slate-600">Add New</div>
                                    <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {activeJobs.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                                        <Package className="w-16 h-16 mb-4" />
                                        <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">No Active Operations Detected</p>
                                    </div>
                                ) : (
                                    activeJobs.slice(0, 5).map(job => (
                                        <div key={job.id} className="group flex flex-col md:flex-row items-center justify-between p-5 md:p-6 bg-slate-50/50 hover:bg-white border hover:border-slate-200 rounded-2xl md:rounded-[2.5rem] transition-all cursor-pointer">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                                    <Truck className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-slate-900">{job.goodsType}</h5>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{job.haulerName || 'Awaiting Transporter'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-12">
                                                <div className="hidden md:flex flex-col items-end">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Progress</span>
                                                    <div className="flex gap-1 mt-1">
                                                        {Array.from({ length: 12 }).map((_, i) => (
                                                            <div key={i} className={`w-1.5 h-6 rounded-full ${i < 8 ? 'bg-theme-accent-red' : 'bg-slate-200'}`}></div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sub-pages container (Wallet, Settings, etc.) */}
                {activeTab !== 'dashboard' && activeTab !== 'board' && (
                    <div className="animate-in slide-in-from-bottom-8 duration-700">
                        {activeTab === 'post' && !showPostSuccess && (
                            <div className="max-w-3xl mx-auto space-y-10">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Manifest Details</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure your transport requirements</p>
                                    </div>
                                    <button onClick={() => setShowBulkModal(true)} className="px-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase border border-slate-100 hover:bg-white hover:border-orange-200 transition-all flex items-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        Bulk Import
                                    </button>
                                </div>
                                <form onSubmit={handleFormSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <InputGroup label="Cargo Identification" icon={Package} value={formData.goodsType} onChange={v => setFormData({ ...formData, goodsType: v })} placeholder="e.g. Iron Ore, Coal" />
                                        <InputGroup type="number" label="Payload Weight (Tons)" icon={TrendingUp} value={formData.tonnage} onChange={v => setFormData({ ...formData, tonnage: v })} placeholder="0.00" />
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logistics Asset Type</label>
                                            <select
                                                value={formData.fleetType}
                                                onChange={(e) => setFormData({ ...formData, fleetType: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:outline-none focus:border-slate-900 focus:bg-white transition-all appearance-none"
                                            >
                                                {['Side Tipper', 'Flatbed', 'Super-Link', 'Abnormal Load', 'Rigid Truck'].map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <InputGroup type="number" label="Target Budget (USD)" icon={DollarSign} value={formData.budget} onChange={v => setFormData({ ...formData, budget: v })} placeholder="Market Price" />
                                    </div>
                                    <div className="space-y-8">
                                        <LocationPicker label="Collection Point" placeholder="Search Loading Terminal..." value={formData.departure ? { address: formData.departure } : null} onChange={v => setFormData({ ...formData, departure: v.address })} />
                                        <LocationPicker label="Offloading Node" placeholder="Search Destination Terminal..." value={formData.destination ? { address: formData.destination } : null} onChange={v => setFormData({ ...formData, destination: v.address })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Special Directives</label>
                                        <textarea
                                            value={formData.instructions}
                                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-medium focus:outline-none focus:border-slate-900 focus:bg-white transition-all min-h-[120px]"
                                            placeholder="Enter any specific safety or delivery requirements..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isPosting}
                                        className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center space-x-3"
                                    >
                                        {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                <span>Broadcast Manifest</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* History View */}
                        {activeTab === 'history' && (
                            <div className="space-y-12">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-10">
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Fleet History</h3>
                                    <div className="flex items-center gap-3">
                                        <button className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"><Filter className="w-4 h-4" /></button>
                                        <button className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"><Download className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                {myJobs.length === 0 ? (
                                    <EmptyState icon={History} title="Archive Empty" desc="No logistics history currently detected in the portal." />
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
                                        {myJobs.map(job => (
                                            <ModernJobCard key={job.id} job={job} onViewBOL={() => setShowBOL(job)} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Wallet View */}
                        {activeTab === 'wallet' && (
                            <div className="space-y-10">
                                <div className="bg-slate-900 rounded-3xl md:rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-theme-accent-yellow/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-12">
                                        <div className="space-y-8">
                                            <div className="flex items-center space-x-3 text-theme-accent-yellow">
                                                <Wallet className="w-6 h-6" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Escrow Balance</span>
                                            </div>
                                            <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">USD {userProfile?.walletBalance?.toLocaleString() || '0.00'}</h2>
                                            <div className="flex items-center space-x-4">
                                                <button className="px-8 py-4 bg-theme-accent-yellow text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-theme-accent-yellow/20 hover:scale-105 transition-transform">Top Up Funds</button>
                                                <button className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">Logs</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <SettingsView userProfile={userProfile} />
                        )}
                    </div>
                )}
            </main>

            {/* Mobile Nav - Hidden on desktop */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-black/5 z-[100] md:hidden px-6 py-3 pb-8 flex justify-between items-center shadow-2xl">
                <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-[#1A1A1A] text-white' : 'text-slate-400'}`}>
                    <LayoutDashboard size={22} />
                </button>
                <button onClick={() => setActiveTab('post')} className={`p-3 rounded-2xl transition-all ${activeTab === 'post' ? 'bg-[#1A1A1A] text-white' : 'text-slate-400'}`}>
                    <PlusCircle size={22} />
                </button>
                <button onClick={() => setActiveTab('history')} className={`p-3 rounded-2xl transition-all ${activeTab === 'history' ? 'bg-[#1A1A1A] text-white' : 'text-slate-400'}`}>
                    <Activity size={22} />
                </button>
                <button onClick={() => setActiveTab('wallet')} className={`p-3 rounded-2xl transition-all ${activeTab === 'wallet' ? 'bg-[#1A1A1A] text-white' : 'text-slate-400'}`}>
                    <Wallet size={22} />
                </button>
                <button onClick={() => setActiveTab('settings')} className={`p-3 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-[#1A1A1A] text-white' : 'text-slate-400'}`}>
                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/20 bg-[#1A1A1A] flex items-center justify-center text-white text-[10px] font-bold">
                        {userProfile?.universal?.displayName?.charAt(0) || 'P'}
                    </div>
                </button>
            </nav>

            {/* Overlays */}
            {showBOL && <BillOfLading job={showBOL} onClose={() => setShowBOL(null)} />}
            {showBulkModal && <BulkUploadModal onClose={() => setShowBulkModal(false)} onUpload={handleBulkUpload} />}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={() => auth.signOut()}
            />
        </div>
    );
};

/* --- Design System Sub-components --- */

const SidebarIcon = ({ active, onClick, icon: Icon, title }) => (
    <div className="relative flex items-center group">
        <button
            onClick={onClick}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group relative btn-interact ${active ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:bg-slate-50'}`}
        >
            <Icon className={`w-5 h-5 ${active ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`} strokeWidth={active ? 2.5 : 2} />
        </button>
        <div className="sidebar-tooltip group-hover:opacity-100 group-hover:visible group-hover:translate-x-0">{title}</div>
    </div>
);

const StatIndicator = ({ color, label, value }) => (
    <div className="flex items-center gap-4">
        <div className={`w-12 h-10 rounded-xl ${color} shadow-sm`}></div>
        <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</span>
            <span className="text-sm font-bold text-slate-800">{value}</span>
        </div>
    </div>
);

const ModernJobCard = ({ job, onViewBOL }) => {
    const statusConfig = {
        open: { color: 'bg-theme-accent-yellow/10 text-slate-900 border-theme-accent-yellow/20', pulse: true },
        secured: { color: 'bg-theme-card-dark text-white border-slate-900', pulse: false },
        assigned: { color: 'bg-blue-600 text-white border-blue-700', pulse: false },
        loading: { color: 'bg-theme-accent-red text-white border-theme-accent-red', pulse: true },
        in_transit: { color: 'bg-theme-card-dark text-white border-theme-card-dark', pulse: true },
        delivered: { color: 'bg-green-100 text-green-700 border-green-200', pulse: false }
    };
    const config = statusConfig[job.status] || statusConfig.open;

    return (
        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 md:p-12 shadow-premium hover:shadow-2xl hover:scale-[1.02] transition-all group relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10 relative z-10">
                <div className="min-w-0">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-tight truncate mb-3">{job.goodsType}</h3>
                    <div className="flex items-center space-x-6 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        <span className="flex items-center gap-2"><TrendingUp size={14} className="text-theme-accent-red shrink-0" />{job.tonnage} Tons</span>
                        <span className="flex items-center gap-2"><Truck size={14} className="text-theme-accent-yellow shrink-0" />{job.fleetType}</span>
                    </div>
                </div>
                <div className={`shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${config.color}`}>
                    {config.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>}
                    {job.status?.replace('_', ' ')}
                </div>
            </div>

            <div className="space-y-4 mb-10 relative z-10">
                <RouteIndicator from={job.departure} to={job.destination} />
            </div>

            <button
                onClick={onViewBOL}
                className="w-full py-3 md:py-4 bg-theme-bg border border-slate-100 text-slate-900 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] transform active:scale-95 transition-all hover:bg-theme-card-dark hover:text-white flex items-center justify-center gap-2 shadow-sm btn-interact"
            >
                <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Inspect Proof Documents
            </button>
        </div>
    );
};

const RouteIndicator = ({ from, to }) => (
    <div className="flex items-center gap-6 py-6 px-8 bg-theme-bg border border-slate-100 rounded-2xl md:rounded-3xl group-hover:bg-white transition-colors duration-500">
        <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full border-2 border-theme-accent-red"></div>
            <div className="w-0.5 h-8 md:h-10 bg-slate-200"></div>
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-theme-accent-yellow shadow-lg"></div>
        </div>
        <div className="flex-1 overflow-hidden space-y-5 md:space-y-6">
            <div className="space-y-1 min-w-0">
                <p className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tighter truncate leading-none">{from?.split(',')[0] || 'Origin Terminal'}</p>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60 leading-none">Loading Node</p>
            </div>
            <div className="space-y-1 min-w-0">
                <p className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tighter truncate leading-none">{to?.split(',')[0] || 'Destination Node'}</p>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60 leading-none">Offloading Node</p>
            </div>
        </div>
    </div>
);

const MobileTab = ({ active, onClick, icon: Icon }) => (
    <button onClick={onClick} className={`p-4 rounded-2xl transition-all ${active ? 'bg-orange-50 text-orange-600' : 'text-slate-400'}`}>
        <Icon className={`w-6 h-6 ${active ? 'animate-pulse' : ''}`} />
    </button>
);

const SwitchOption = ({ title, desc, active, onClick }) => (
    <div onClick={onClick} className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-orange-500 transition-all cursor-pointer">
        <div>
            {title && <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest group-hover:text-orange-600 transition-colors">{title}</h4>}
            {desc && <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest mt-1 opacity-60">{desc}</p>}
        </div>
        <div className={`shrink-0 w-12 h-6 rounded-full p-1 transition-all ${active ? 'bg-orange-500' : 'bg-slate-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${active ? 'translate-x-6' : ''}`}></div>
        </div>
    </div>
);

const Loader2 = ({ className }) => (
    <Activity className={`animate-spin ${className}`} />
);

export default SupplierDashboard;
