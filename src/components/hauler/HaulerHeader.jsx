import React from 'react';
import { Search, LogOut } from 'lucide-react';

const HaulerHeader = ({ activeTab, userProfile, searchQuery, setSearchQuery, onLogout }) => {
    const getTitle = () => {
        switch (activeTab) {
            case 'dashboard': return `Hi, ${userProfile?.displayName?.split(' ')[0] || userProfile?.fullName?.split(' ')[0] || 'Operator'}!`;
            case 'board': return 'Market Terminal';
            case 'map': return 'LIVE MAP FEED';
            case 'fleet': return 'Fleet Management';
            case 'active': return 'Active Missions';
            case 'history': return 'System Archives';
            default: return 'Account Config';
        }
    };

    const getDescription = () => {
        switch (activeTab) {
            case 'dashboard': return "Let's review your operational performance";
            case 'board': return "Analyzing available logistics signals for securement";
            case 'map': return "Real-time telemetry of all assets currently in fulfillment";
            case 'fleet': return "Manage your operatives and logistics hardware";
            default: return "Monitoring the AutoDirect logistics infrastructure";
        }
    };

    return (
        <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mt-2 md:mt-0 overflow-hidden">
            <div className="min-w-0">
                <h1 className="text-xl md:text-3xl font-black tracking-tight">{getTitle()}</h1>
                <p className="text-slate-500 font-medium text-[10px] md:text-sm mt-0.5">{getDescription()}</p>
            </div>
            <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto mt-2 md:mt-0">
                <div className="relative group flex-1 md:flex-none">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5 md:w-4 md:h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={activeTab === 'map' ? "Asset Registration..." : "Search data..."}
                        className="pl-10 pr-6 py-2.5 md:py-3 bg-white border-none rounded-xl md:rounded-2xl text-xs md:text-sm font-medium w-full md:w-64 shadow-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    />
                </div>
                <button
                    onClick={onLogout}
                    className="p-2.5 md:p-3 bg-white text-slate-400 hover:text-red-500 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center transition-all btn-interact shrink-0"
                >
                    <LogOut size={18} className="md:w-5 md:h-5" />
                </button>
            </div>
        </header>
    );
};

export default HaulerHeader;
