import React from 'react';
import { TrendingUp, ShoppingBag } from 'lucide-react';
import { SearchPill } from '../../components/hauler/SharedComponents';
import HaulerJobCard from '../../components/HaulerJobCard';

const MarketplaceView = ({
    filteredAvailableJobs,
    marketplaceFilter,
    setMarketplaceFilter,
    priceSort,
    setPriceSort,
    userProfile,
    handleJobAction,
    isDispatcher,
    isDriver
}) => {
    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
            {/* Background Decorations */}
            <div className="fixed top-1/2 left-1/4 w-[500px] h-[500px] blob-blue opacity-[0.03] -z-10 blur-[100px] pointer-events-none" />
            <div className="fixed bottom-1/4 right-1/4 w-[600px] h-[600px] blob-indigo opacity-[0.03] -z-10 blur-[120px] pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md p-1.5 rounded-[1.8rem] shadow-sm border border-slate-200/50 overflow-x-auto no-scrollbar">
                    {['All', 'Tipper', 'Flatbed', 'Link', 'Mining'].map(type => (
                        <SearchPill key={type} label={type} active={marketplaceFilter === type} onClick={() => setMarketplaceFilter(type)} />
                    ))}
                </div>
                <div className="flex items-center justify-between gap-6 bg-white/60 backdrop-blur-md p-1.5 rounded-[1.8rem] shadow-sm border border-slate-200/50 px-5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sort Strategy</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPriceSort('desc')}
                            className={`p-2.5 rounded-2xl transition-all btn-interact ${priceSort === 'desc' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                            title="Highest Price First"
                        >
                            <TrendingUp size={20} />
                        </button>
                        <button
                            onClick={() => setPriceSort('asc')}
                            className={`p-2.5 rounded-2xl transition-all btn-interact ${priceSort === 'asc' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                            title="Lowest Price First"
                        >
                            <TrendingUp size={20} className="rotate-180" />
                        </button>
                    </div>
                </div>
            </div>

            {filteredAvailableJobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 pb-12">
                    {filteredAvailableJobs.map((job, index) => (
                        <div key={job.id}
                            className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                            style={{ animationDelay: `${index * 100}ms` }}>
                            <HaulerJobCard
                                job={job}
                                userProfile={userProfile}
                                onAction={(action) => handleJobAction(job, action)}
                                isDispatcher={isDispatcher}
                                isDriver={isDriver}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 animate-in fade-in zoom-in-95 duration-700">
                    <div className="w-20 h-20 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center text-slate-100 mb-2">
                        <ShoppingBag size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Market is Quiet</h3>
                    <p className="text-slate-400 font-medium max-w-md">No logistics signals currently match your filters. Check back later for new payload securement opportunities.</p>
                    <button
                        onClick={() => setMarketplaceFilter('All')}
                        className="mt-4 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:shadow-md transition-all active:scale-95"
                    >
                        Reset All Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default MarketplaceView;
