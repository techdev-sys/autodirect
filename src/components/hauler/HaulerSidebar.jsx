import React from 'react';
import { Truck, Home, ShoppingBag, Users, Activity, History, Settings, LogOut, Wallet } from 'lucide-react';
import { auth } from '../../firebaseConfig';

const SidebarPillItem = ({ active, onClick, icon: Icon, title }) => (
    <div className="relative flex items-center group">
        <button onClick={onClick} className={`pill-sidebar-item btn-interact ${active ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Icon size={20} strokeWidth={active ? 3 : 2} />
        </button>
        <div className="sidebar-tooltip group-hover:opacity-100 group-hover:visible">{title}</div>
    </div>
);

const HaulerSidebar = ({ activeTab, setActiveTab, userProfile, onLogout }) => {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="fixed left-8 top-8 bottom-8 hidden md:flex flex-col items-center justify-between z-30 font-sans">
                <div className="flex flex-col gap-8 items-center">
                    <div className="w-12 h-12 flex items-center justify-center btn-interact">
                        <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white">
                            <Truck size={20} />
                        </div>
                    </div>

                    <div className="pill-sidebar-container">
                        <SidebarPillItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={Home} title="Home" />
                        <SidebarPillItem active={activeTab === 'board'} onClick={() => setActiveTab('board')} icon={ShoppingBag} title="Job Market" />
                        <SidebarPillItem active={activeTab === 'active'} onClick={() => setActiveTab('active')} icon={Activity} title="Active Missions" />
                    </div>

                    <div className="pill-sidebar-container">
                        <SidebarPillItem active={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} icon={Users} title="Fleet Management" />
                        <SidebarPillItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} title="History" />
                        <SidebarPillItem active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={Wallet} title="Wallet" />
                        <SidebarPillItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} title="Settings" />
                    </div>
                </div>

                <div className="pill-sidebar-container">
                    <div className="relative flex items-center group">
                        <button onClick={onLogout} className="pill-sidebar-item btn-interact hover:bg-red-50 text-slate-400 hover:text-red-500">
                            <LogOut size={20} />
                        </button>
                        <div className="sidebar-tooltip">Log Out</div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md btn-interact bg-[#1A1A1A] flex items-center justify-center text-white font-bold text-lg">
                        {userProfile?.photoURL ? (
                            <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>
                                {userProfile?.organizationName
                                    ? userProfile.organizationName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                    : userProfile?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                            </span>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-black/5 z-[100] md:hidden px-6 py-3 pb-8 flex justify-between items-center shadow-2xl">
                <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-[#1A1A1A] text-white' : 'text-slate-400'}`}>
                    <Home size={22} />
                </button>
                <button onClick={() => setActiveTab('board')} className={`p-3 rounded-2xl transition-all ${activeTab === 'board' ? 'bg-[#1A1A1A] text-white' : 'text-slate-400'}`}>
                    <ShoppingBag size={22} />
                </button>
                <button onClick={() => setActiveTab('active')} className={`p-3 rounded-2xl transition-all ${activeTab === 'active' ? 'bg-[#1A1A1A] text-white' : 'text-slate-400'}`}>
                    <Activity size={22} />
                </button>
                <button onClick={() => setActiveTab('wallet')} className={`p-3 rounded-2xl transition-all ${activeTab === 'wallet' ? 'bg-[#1A1A1A] text-white' : 'text-slate-400'}`}>
                    <Wallet size={22} />
                </button>
                <button onClick={() => setActiveTab('settings')} className={`p-3 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-[#1A1A1A] text-white' : 'text-slate-400'}`}>
                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/20 bg-[#1A1A1A] flex items-center justify-center text-white text-[10px] font-bold">
                        {userProfile?.photoURL ? (
                            <img src={userProfile.photoURL} alt="P" className="w-full h-full object-cover" />
                        ) : (
                            userProfile?.organizationName?.charAt(0) || '?'
                        )}
                    </div>
                </button>
            </nav>
        </>
    );
};

export default HaulerSidebar;
