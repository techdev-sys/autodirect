import React, { useMemo } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, DollarSign, TrendingUp, ChevronRight } from 'lucide-react';

const WalletView = ({ myJobs }) => {
    // Analytics
    const completedJobs = useMemo(() =>
        myJobs.filter(j => j.status === 'delivered' || j.status === 'paid')
        , [myJobs]);

    const activeJobs = useMemo(() =>
        myJobs.filter(j => j.status !== 'delivered' && j.status !== 'paid')
        , [myJobs]);

    const totalBalance = useMemo(() =>
        completedJobs.reduce((acc, j) => acc + (Number(j.budget) || 0), 0)
        , [completedJobs]);

    const escrowBalance = useMemo(() =>
        activeJobs.reduce((acc, j) => acc + (Number(j.budget) || 0), 0)
        , [activeJobs]);

    const recentTransactions = useMemo(() => {
        return myJobs
            .filter(j => j.status !== 'open')
            .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
            .slice(0, 10);
    }, [myJobs]);

    return (
        <div className="w-full space-y-12 md:space-y-24 animate-fade-in pb-20 overflow-hidden">
            {/* Header / Top Stats - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 w-full">
                <div className="card-premium-dark p-6 md:p-12 flex flex-col justify-between relative overflow-hidden group min-h-[160px] md:min-h-0">
                    <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-blue-600/20 rounded-full blur-2xl md:blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 md:gap-3 text-white/50 mb-6 md:mb-10 font-bold text-[9px] md:text-xs uppercase tracking-[0.2em]">
                            <Wallet size={16} className="text-blue-400" />
                            Transporter Balance
                        </div>
                        <h2 className="text-3xl md:text-6xl font-black tabular-nums tracking-tighter text-white">
                            USD {totalBalance.toLocaleString()}
                        </h2>
                        <div className="mt-8 md:mt-12">
                            <button className="w-fit px-8 py-4 bg-white text-[#1A1A1A] rounded-2xl font-black flex items-center justify-center gap-3 btn-interact shadow-2xl text-xs md:text-sm uppercase tracking-widest">
                                <ArrowUpRight size={18} />
                                Withdraw Assets
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-premium-tint p-6 md:p-12 flex flex-col justify-between border-blue-200/30 bg-gradient-to-br from-[#E9E4DB] to-[#DED9D0]">
                    <div>
                        <div className="flex items-center gap-2 md:gap-3 text-slate-500 mb-6 md:mb-10 font-bold text-[9px] md:text-xs uppercase tracking-[0.2em]">
                            <Clock size={16} className="text-amber-600" />
                            Escrow Account
                        </div>
                        <h3 className="text-2xl md:text-5xl font-black tabular-nums text-[#1A1A1A] tracking-tight">
                            USD {escrowBalance.toLocaleString()}
                        </h3>
                        <p className="text-[10px] md:text-sm font-bold text-slate-400 mt-2 md:mt-4 uppercase tracking-widest">
                            {activeJobs.length} Operations In-Flight
                        </p>
                    </div>
                </div>

                <div className="card-premium-light p-6 md:p-12 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 md:gap-3 text-slate-400 mb-6 md:mb-10 font-bold text-[9px] md:text-xs uppercase tracking-[0.2em]">
                            <TrendingUp size={16} className="text-blue-600" />
                            Velocity
                        </div>
                        <h3 className="text-2xl md:text-5xl font-black tabular-nums text-[#1A1A1A] tracking-tight">
                            +18.4%
                        </h3>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-50">
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-[65%] rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Analytics - Consistent Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {[
                    { label: 'Weekly Delta', value: `USD ${(totalBalance * 0.4).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Settlement Rate', value: '98.4%', icon: CheckCircle2, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Avg Monthly', value: `USD ${(totalBalance * 1.2).toLocaleString()}`, icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Pending Keys', value: activeJobs.length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="card-premium-light p-6 md:p-8 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                        <div className={`w-12 h-12 md:w-14 md:h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] truncate mb-1">{stat.label}</p>
                            <p className="text-base md:text-lg font-black text-[#1A1A1A] truncate tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Transaction History - Mobile List / Desktop Table */}
            <div className="card-premium-light p-0 overflow-hidden">
                <div className="p-5 md:p-8 border-b border-slate-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg md:text-xl font-bold font-black">History</h3>
                        <p className="hidden md:block text-sm font-medium text-slate-400 mt-1">Details of settlements</p>
                    </div>
                    <button className="text-[10px] md:text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                        Statement <ChevronRight size={14} />
                    </button>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentTransactions.map((job, i) => (
                                <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${job.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {job.status === 'paid' ? <ArrowDownLeft size={18} /> : <Clock size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1A1A1A]">{job.pickupLocation?.split(',')[0]} → {job.dropoffLocation?.split(',')[0]}</p>
                                                <p className="text-xs font-medium text-slate-400">{job.updatedAt?.toDate?.() ? job.updatedAt.toDate().toLocaleDateString() : 'Syncing...'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6"><span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full uppercase">{job.goodsType}</span></td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${job.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                            <span className="text-[10px] font-bold uppercase text-slate-700">{job.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right font-black tabular-nums">USD {job.budget?.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View List */}
                <div className="md:hidden divide-y divide-slate-50">
                    {recentTransactions.map((job, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${job.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {job.status === 'paid' ? <ArrowDownLeft size={14} /> : <Clock size={14} />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#1A1A1A] max-w-[140px] truncate">{job.pickupLocation?.split(',')[0]} → {job.dropoffLocation?.split(',')[0]}</p>
                                    <p className="text-[9px] font-medium text-slate-400">{job.updatedAt?.toDate?.() ? job.updatedAt.toDate().toLocaleDateString() : 'Syncing...'}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-xs font-black text-[#1A1A1A]">USD {job.budget?.toLocaleString()}</p>
                                <p className={`text-[9px] font-bold uppercase ${job.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{job.status}</p>
                            </div>
                        </div>
                    ))}
                    {recentTransactions.length === 0 && (
                        <div className="p-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">No activity</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletView;
