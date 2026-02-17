import React, { useMemo } from 'react';
import { Plus, TrendingUp, DollarSign, Activity, ChevronRight, Calendar as CalendarIcon, Package, Truck } from 'lucide-react';
import { SummaryLegend, StatsBubble } from '../../components/hauler/SharedComponents';

const HomeView = ({ activeMissions, completedMissions, totalFleetTonnage }) => {
    // Analytics derivations
    const totalEarnings = useMemo(() =>
        completedMissions.reduce((acc, j) => acc + (Number(j.budget) || 0), 0)
        , [completedMissions]);

    const pipelineValue = useMemo(() =>
        activeMissions.reduce((acc, j) => acc + (Number(j.budget) || 0), 0)
        , [activeMissions]);

    const averageLoadValue = useMemo(() =>
        completedMissions.length > 0 ? (totalEarnings / completedMissions.length).toFixed(0) : 0
        , [totalEarnings, completedMissions]);

    // Calendar Heatmap Data (Simulated based on completed missions)
    // In a real app, we'd map mission.deliveredAt to specific dates
    const missionDensity = useMemo(() => {
        const density = {};
        // Mocking some density for the last 30 days
        [5, 8, 12, 14, 15, 17, 21, 22, 25].forEach(day => {
            density[day] = Math.floor(Math.random() * 3) + 1;
        });
        return density;
    }, []);

    const today = new Date().getDate();

    return (
        <div className="w-full space-y-12 md:space-y-20 animate-fade-in pb-20 overflow-hidden">
            {/* Top Analysis Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 w-full">
                {[
                    { label: 'Gross Revenue', value: `USD ${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'border-l-blue-600', trend: '+12.5%' },
                    { label: 'In Pipeline', value: `USD ${pipelineValue.toLocaleString()}`, icon: Activity, color: 'border-l-indigo-600' },
                    { label: 'Avg Load', value: `USD ${Number(averageLoadValue).toLocaleString()}`, icon: Package, color: 'border-l-amber-600' },
                    { label: 'Fleet Tons', value: `${totalFleetTonnage.toLocaleString()} T`, icon: Truck, color: 'border-l-emerald-600' },
                ].map((stat, i) => (
                    <div key={i} className={`card-premium-light p-6 md:p-10 flex flex-col justify-between border-l-4 ${stat.color} hover:-translate-y-1 transition-transform`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 md:p-4 bg-slate-50 text-slate-900 rounded-xl md:rounded-2xl shrink-0 shadow-sm">
                                <stat.icon size={20} className="md:w-6 md:h-6" />
                            </div>
                            <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">{stat.label}</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-[9px] md:hidden font-black uppercase tracking-tight text-slate-400 mb-1">{stat.label}</p>
                            <h4 className="text-sm md:text-3xl font-black tabular-nums tracking-tighter truncate">{stat.value}</h4>
                            {stat.trend && (
                                <p className="text-[10px] md:text-xs font-bold text-emerald-500 flex items-center gap-1 mt-1.5">
                                    <TrendingUp size={12} /> {stat.trend}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Hero Visualization - Optimized for Mobile */}
            <div className="card-premium-tint min-h-0 md:h-[380px] relative overflow-hidden flex flex-col md:flex-row items-center p-6 md:p-12 gap-8">
                <div className="relative z-10 space-y-4 md:space-y-8 max-w-2xl text-center md:text-left">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1 md:mb-2 block">Performance Pulse</span>
                        <h2 className="text-2xl md:text-5xl font-black leading-tight tracking-tighter">Optimization Insights</h2>
                        <p className="mt-2 md:mt-4 text-slate-600 font-medium text-sm md:text-lg leading-relaxed">
                            Operating at <span className="text-[#1A1A1A] font-extrabold">84% efficiency</span>.
                            <span className="text-blue-600 font-extrabold"> {activeMissions.length} assets</span> in fulfillment.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center md:justify-start">
                        <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-[#1A1A1A] text-white rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 btn-interact shadow-xl text-xs md:text-base">
                            Optimize Routes <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Hide complex graphic on mobile to keep it app-like */}
                <div className="hidden md:flex relative md:absolute md:right-0 md:top-0 md:bottom-0 w-full md:w-1/2 h-full items-center justify-center">
                    <div className="relative w-[400px] h-[400px]">
                        <div className="absolute top-0 right-0 w-80 h-80 blob-blue rounded-full mix-blend-multiply opacity-20 animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-125">
                            <div className="relative">
                                <StatsBubble value={activeMissions.length} suffix="Missions" />
                                <div className="absolute -right-24 top-14">
                                    <StatsBubble value={completedMissions.length} suffix="Loads" dark />
                                </div>
                                <div className="absolute -left-20 -bottom-14">
                                    <StatsBubble value={(totalFleetTonnage / 1000).toFixed(1)} suffix="k Tons" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Calendar - Compact Mobile */}
            <div className="card-premium-dark flex flex-col shadow-2xl shadow-blue-900/10 border border-white/5 overflow-hidden">
                <div className="p-5 md:p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-blue-600/10 text-blue-400 rounded-xl md:rounded-[1.5rem] flex items-center justify-center border border-blue-400/20">
                            <CalendarIcon size={20} className="md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h3 className="text-base md:text-2xl font-bold">Operational Heatmap</h3>
                            <p className="text-white/40 font-medium mt-0.5 uppercase tracking-widest text-[7px] md:text-[10px]">February 2026 monitoring</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center justify-end gap-8 pt-0">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Efficiency</p>
                            <p className="text-2xl font-black text-emerald-400">92%</p>
                        </div>
                        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center gap-2 transition-all border border-white/5 text-sm">
                            <Plus size={16} /> Log Entry
                        </button>
                    </div>
                </div>

                <div className="p-3 md:p-10">
                    <div className="grid grid-cols-7 gap-1 md:gap-4 text-center">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                            <span key={i} className="text-[8px] md:text-[10px] font-black text-white/20 uppercase mb-1 md:mb-4 tracking-normal md:tracking-[0.2em]">{d}</span>
                        ))}

                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => {
                            const density = missionDensity[day] || 0;
                            const isToday = day === today;

                            return (
                                <div key={day} className="h-10 md:h-24 flex flex-col items-center justify-center relative group cursor-pointer border border-white/5 rounded-lg md:rounded-[2rem] hover:bg-white/5 transition-all">
                                    {/* Activity Indicator Dots */}
                                    <div className="flex gap-0.5 absolute top-1 md:top-4">
                                        {Array.from({ length: density }).map((_, idx) => (
                                            <div key={idx} className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                        ))}
                                    </div>

                                    <span className={`
                                        w-6 h-6 md:w-12 md:h-12 flex items-center justify-center rounded-md md:rounded-2xl text-[10px] md:text-lg font-black transition-all
                                        ${isToday ? 'bg-white text-[#1A1A1A] shadow-xl md:scale-110' : 'text-white/40 group-hover:text-white'}
                                        ${density > 0 && !isToday ? 'text-white border border-blue-500/30 bg-blue-500/5' : ''}
                                    `}>
                                        {day}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeView;
