import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
    User, Mail, Phone, Shield, FileText,
    CreditCard, LayoutDashboard, Truck,
    Settings, ShieldCheck, Zap, LogOut, ChevronRight,
    Lock, Building2, Briefcase
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const HaulerProfilePage = ({ userProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState(userProfile);
    const [activeTab, setActiveTab] = useState('profile');

    const isDispatcher = ['dispatcher', 'owner', 'admin'].includes(userProfile?.role);
    const isDriver = userProfile?.role === 'driver';

    useEffect(() => {
        if (!userProfile?.uid) return;
        const unsub = onSnapshot(doc(db, "users", userProfile.uid), (snap) => {
            if (snap.exists()) setProfileData({ ...snap.data(), id: snap.id });
        });
        return () => unsub();
    }, [userProfile]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Updating Profile Registry...");
        try {
            await updateDoc(doc(db, "users", userProfile.uid), {
                displayName: profileData.displayName,
                phoneNumber: profileData.phoneNumber,
                licenseClass: profileData.licenseClass || null
            });
            toast.success("Profile Updated", { id: loadingToast });
            setIsEditing(false);
        } catch (e) {
            toast.error("Update Failed", { id: loadingToast });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Sidebar remains consistent for Navigation */}
            <aside className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-slate-100 p-10 flex flex-col justify-between z-50">
                <div className="space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#121926] rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Shield size={24} />
                        </div>
                        <div>
                            <span className="block text-xl font-black text-[#121926] tracking-tighter uppercase italic">Security Center</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Auth Level: {userProfile?.role}</span>
                        </div>
                    </div>

                    <nav className="space-y-3">
                        <SidebarBtn active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="Identity" />
                        {isDispatcher && (
                            <>
                                <SidebarBtn active={activeTab === 'corporate'} onClick={() => setActiveTab('corporate')} icon={Building2} label="Corporate" />
                                <SidebarBtn active={activeTab === 'compliance'} onClick={() => setActiveTab('compliance')} icon={ShieldCheck} label="Compliance" />
                                <SidebarBtn active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={CreditCard} label="Finance" />
                            </>
                        )}
                        <SidebarBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label="System" />
                    </nav>
                </div>

                <button className="flex items-center gap-3 px-8 py-4 text-slate-400 hover:text-red-500 transition-colors group">
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Terminate Session</span>
                </button>
            </aside>

            <main className="pl-80 pt-12 pr-12 pb-24 max-w-[1400px] mx-auto">
                <header className="mb-16">
                    <h1 className="text-4xl font-black text-[#121926] uppercase tracking-tighter">Command Profile</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Manage your logistics identity and operational credentials.</p>
                </header>

                <div className="space-y-12">
                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* IDENTITY CARD */}
                            <div className="lg:col-span-2 space-y-8">
                                <section className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-premium">
                                    <div className="flex justify-between items-center mb-12">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl">
                                                <User size={32} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-[#121926] uppercase tracking-tighter">{profileData?.displayName}</h2>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Status: Fully Operational</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsEditing(!isEditing)}
                                            className="px-8 py-4 bg-slate-50 border border-slate-100 text-[#121926] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
                                        >
                                            {isEditing ? 'Cancel Edit' : 'Edit Identity'}
                                        </button>
                                    </div>

                                    <form onSubmit={handleUpdate} className="space-y-8">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Assigned Name</label>
                                                <input
                                                    disabled={!isEditing}
                                                    value={profileData?.displayName || ''}
                                                    onChange={e => setProfileData({ ...profileData, displayName: e.target.value })}
                                                    className="w-full h-16 px-8 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-xs font-black uppercase outline-none focus:ring-4 focus:ring-blue-600/5 transition-all disabled:opacity-50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Communications Link</label>
                                                <input
                                                    disabled={!isEditing}
                                                    value={profileData?.phoneNumber || ''}
                                                    onChange={e => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                                    className="w-full h-16 px-8 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-xs font-black uppercase outline-none focus:ring-4 focus:ring-blue-600/5 transition-all disabled:opacity-50"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Registry Email (Read-only)</label>
                                            <input
                                                disabled={true}
                                                value={profileData?.email || ''}
                                                className="w-full h-16 px-8 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] text-xs font-black uppercase opacity-50"
                                            />
                                        </div>

                                        {isDriver && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Operative License Class</label>
                                                <input
                                                    disabled={!isEditing}
                                                    value={profileData?.licenseClass || ''}
                                                    onChange={e => setProfileData({ ...profileData, licenseClass: e.target.value.toUpperCase() })}
                                                    className="w-full h-16 px-8 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-xs font-black uppercase outline-none focus:ring-4 focus:ring-blue-600/5 transition-all disabled:opacity-50"
                                                    placeholder="E.G. CLASS 4"
                                                />
                                            </div>
                                        )}

                                        {isEditing && (
                                            <button className="w-full h-16 bg-[#121926] text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-slate-200 mt-4 active:scale-95 transition-all">
                                                Confirm Sync
                                            </button>
                                        )}
                                    </form>
                                </section>
                            </div>

                            {/* ROLE PERMISSIONS CARD */}
                            <div className="space-y-8">
                                <section className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter mb-8">Access Level</h3>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Role</p>
                                                <p className="text-xs font-black uppercase">{userProfile?.role}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                                <Briefcase size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Node</p>
                                                <p className="text-xs font-black uppercase truncate">{userProfile?.organizationId || 'Independent Unit'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {isDriver && (
                                    <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-premium">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Lock size={16} className="text-slate-300" />
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Restricted Nodes</h4>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed tracking-widest">
                                            Your current access level prevents viewing Corporate Financials or Compliance Vaults. Contact your Dispatcher for elevation.
                                        </p>
                                    </section>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Placeholder for other tabs (Dispatcher only) */}
                    {isDispatcher && activeTab === 'wallet' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-20 rounded-[4rem] border border-slate-100 shadow-premium text-center">
                            <CreditCard size={64} className="mx-auto text-slate-200 mb-8" />
                            <h2 className="text-3xl font-black text-[#121926] uppercase tracking-tighter">Financial Command</h2>
                            <p className="max-w-md mx-auto text-sm font-bold text-slate-400 uppercase mt-4 tracking-widest">
                                Secure access to organization wallets, payment processing, and transaction telemetry.
                            </p>
                            <button className="mt-12 h-16 px-12 bg-[#121926] text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em]">Authorize Vault Link</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const SidebarBtn = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all duration-300 group ${active ? 'bg-[#121926] text-white shadow-2xl scale-105' : 'text-slate-400 hover:bg-slate-50'
            }`}
    >
        <div className="flex items-center gap-4">
            <Icon size={20} strokeWidth={active ? 3 : 2} />
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
        </div>
        {!active && <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
    </button>
);

export default HaulerProfilePage;
