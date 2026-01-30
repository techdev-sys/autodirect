import React, { useState } from 'react';
import { Star, ShieldCheck, Truck, Building, Zap, Clock, Verified, FileText, ChevronDown, CheckCircle, Navigation, Award, AlertTriangle } from 'lucide-react';

const ProfileCard = ({ profileData, role, expanded = false }) => {
    // Default Mock Data if none provided
    const data = profileData || {
        universal: {
            displayName: "Unknown User",
            photoURL: null,
            verified: false,
            rating: 0,
            memberSince: new Date().getFullYear()
        },
        hauler: {},
        supplier: {}
    };

    const isHauler = role === 'hauler';

    // Theme Config
    const theme = isHauler ? {
        border: 'border-amber-500/50',
        bg: 'bg-slate-900',
        text: 'text-white',
        accent: 'text-amber-400',
        subtext: 'text-slate-400',
        badge: 'bg-amber-400/10 text-amber-400 border-amber-400/20'
    } : {
        border: 'border-slate-300',
        bg: 'bg-white',
        text: 'text-slate-900',
        accent: 'text-blue-600',
        subtext: 'text-slate-500',
        badge: 'bg-blue-50 text-blue-600 border-blue-200'
    };

    return (
        <div className={`w-full relative overflow-hidden rounded-2xl border-2 ${theme.border} ${theme.bg} shadow-xl transition-all duration-300`}>
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none"></div>

            {/* Header / Hero Section */}
            <div className="p-5 flex items-start space-x-4 relative z-10">
                {/* Avatar / Logo */}
                <div className="relative">
                    <div className={`w-16 h-16 rounded-xl border-2 ${isHauler ? 'border-slate-700' : 'border-slate-100'} overflow-hidden shadow-lg bg-slate-200 flex items-center justify-center`}>
                        {data.universal.photoURL ? (
                            <img src={data.universal.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            isHauler ? <Truck className="w-8 h-8 text-slate-400" /> : <Building className="w-8 h-8 text-slate-400" />
                        )}
                    </div>
                    {data.universal.verified && (
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verified Identity">
                            <Verified className="w-3 h-3" />
                        </div>
                    )}
                </div>

                {/* Identity Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <h3 className={`text-lg font-black uppercase truncate ${theme.text}`}>
                            {isHauler ? (data.universal.displayName || "Unregistered Driver") : (data.supplier?.companyName || data.universal.displayName || "Unknown Company")}
                        </h3>
                        {isHauler && data.hauler?.fleetType && (
                            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-700 text-slate-300 border border-slate-600">
                                {data.hauler.fleetType}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center space-x-1">
                            <Star className={`w-3.5 h-3.5 ${theme.accent} fill-current`} />
                            <span className={`text-xs font-bold ${theme.text}`}>{data.universal.rating || "New"}</span>
                            <span className={`text-[10px] ${theme.subtext}`}>({data.universal.reviewsCount || 0})</span>
                            <span className={`text-[10px] ${theme.subtext}`}>• Member since {data.universal.memberSince}</span>
                        </div>
                    </div>

                    {/* Quick Badges (Compact View) */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {isHauler ? (
                            <>
                                {data.hauler?.insuranceStatus && (
                                    <Badge icon={ShieldCheck} text="Insured" theme={theme} />
                                )}
                                {data.hauler?.onTimeRate && (
                                    <Badge icon={Clock} text={`${data.hauler.onTimeRate}% On-Time`} theme={theme} />
                                )}
                            </>
                        ) : (
                            <>
                                {data.supplier?.isEscrowFunded && (
                                    <Badge icon={Zap} text="Instant Pay" theme={theme} />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Details Section */}
            {expanded && (
                <div className={`px-5 pb-5 pt-0 relative z-10 animate-in slide-in-from-top-2`}>
                    <div className={`w-full h-px ${isHauler ? 'bg-slate-800' : 'bg-slate-100'} my-4`}></div>

                    {isHauler ? (
                        <div className="grid grid-cols-2 gap-4">
                            {/* Fleet Specs */}
                            <div className="space-y-2">
                                <h4 className={`text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>Fleet Asset</h4>
                                <div className="space-y-1">
                                    <DetailRow label="Vehicle" value={data.hauler?.fleetType} theme={theme} />
                                    <DetailRow label="Capacity" value={data.hauler?.maxTonnage ? `${data.hauler.maxTonnage} Tons` : null} theme={theme} />
                                    <DetailRow label="Bed Length" value={data.hauler?.bedLength ? `${data.hauler.bedLength}m` : null} theme={theme} />
                                </div>
                            </div>

                            {/* Performance */}
                            <div className="space-y-2">
                                <h4 className={`text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>Performance</h4>
                                <div className="space-y-1">
                                    <DetailRow label="Distance" value={data.hauler?.totalDistance ? `${data.hauler.totalDistance} km` : null} theme={theme} />
                                    <DetailRow label="Cancel Rate" value={data.hauler?.cancelRate ? `${data.hauler.cancelRate}%` : null} theme={theme} warning={parseInt(data.hauler?.cancelRate) > 10} />
                                </div>
                            </div>

                            {/* Equipment Tags */}
                            {data.hauler?.equipmentTags && data.hauler.equipmentTags.length > 0 && (
                                <div className="col-span-2 pt-2">
                                    <div className="flex flex-wrap gap-1">
                                        {data.hauler.equipmentTags.map(tag => (
                                            <span key={tag} className={`px-2 py-1 rounded text-[9px] font-bold uppercase border ${isHauler ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Supplier Specifics */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className={`text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>Business</h4>
                                    <div className="space-y-1">
                                        <DetailRow label="Industry" value={data.supplier?.industry} theme={theme} />
                                        <DetailRow label="Payment" value={data.supplier?.paymentTerms || "Net 30"} theme={theme} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className={`text-[10px] font-black uppercase tracking-wider ${theme.subtext}`}>Facility</h4>
                                    <div className="space-y-1">
                                        <DetailRow label="Hours" value={data.supplier?.loadingHours} theme={theme} />
                                    </div>
                                </div>
                            </div>

                            {/* Facilities Tags */}
                            {data.supplier?.facilities && data.supplier.facilities.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {data.supplier.facilities.map(tag => (
                                        <span key={tag} className="px-2 py-1 rounded text-[9px] font-bold uppercase border bg-slate-50 border-slate-200 text-slate-600">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Badge = ({ icon: Icon, text, theme }) => (
    <div className={`flex items-center space-x-1 px-2 py-0.5 rounded border ${theme.badge}`}>
        <Icon className="w-3 h-3" />
        <span className="text-[9px] font-black uppercase">{text}</span>
    </div>
);

const DetailRow = ({ label, value, theme, warning }) => {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center text-xs">
            <span className={`${theme.subtext}`}>{label}</span>
            <span className={`font-bold ${warning ? 'text-red-500' : theme.text}`}>{value}</span>
        </div>
    );
};

export default ProfileCard;
