import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Package, Truck, MapPin, CheckCircle, Search, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import LiveMap from '../components/LiveMap';
import StatusBadge from '../components/StatusBadge';
import ProofOfDelivery from '../components/ProofOfDelivery';

export default function TrackingPage() {
    const { jobId } = useParams();
    const navigate = useNavigate();

    // State
    const [searchTerm, setSearchTerm] = useState(jobId || '');
    const [jobData, setJobData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Effect: Listen to Job ID if present
    useEffect(() => {
        if (!jobId) {
            setJobData(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const jobRef = doc(db, "transportJobs", jobId);

        const unsubscribe = onSnapshot(jobRef, (docSnap) => {
            setLoading(false);
            if (docSnap.exists()) {
                setJobData({ id: docSnap.id, ...docSnap.data() });
                setError(null);
            } else {
                setError("Tracking ID not found. Please check and try again.");
                setJobData(null);
            }
        }, (err) => {
            console.error(err);
            setLoading(false);
            setError("Unable to fetch shipment data. Please try again later.");
        });

        return () => unsubscribe();
    }, [jobId]);

    // Handlers
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/track/${searchTerm.trim()}`);
        }
    };

    // Derived UI Data
    const getStepStatus = (step) => {
        if (!jobData) return 'idle';
        const statusOrder = ['open', 'assigned', 'in_transit', 'delivered'];
        const currentIdx = statusOrder.indexOf(jobData.status);
        const stepIdx = statusOrder.indexOf(step);

        if (currentIdx > stepIdx) return 'completed';
        if (currentIdx === stepIdx) return 'active';
        return 'pending';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-amber-100 p-1.5 rounded-lg border border-amber-200">
                            <Truck className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="leading-none">
                            <h1 className="font-black text-lg uppercase tracking-tight text-slate-900">Auto<span className="text-amber-600">Direct</span></h1>
                            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest block">Recipient Portal</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">

                {/* Search Hero */}
                {!jobId && (
                    <div className="text-center py-16 space-y-6">
                        <h2 className="text-3xl font-extrabold text-slate-900">Track your shipment</h2>
                        <p className="text-slate-500 max-w-md mx-auto">Enter your tracking ID below to see the real-time status of your delivery.</p>
                        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2 relative">
                            <input
                                type="text"
                                placeholder="Enter Job ID (e.g. 8x9d...)"
                                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 rounded-lg font-bold transition-colors">
                                <Search className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                )}

                {/* Job View */}
                {jobId && (
                    <>
                        {/* Search Bar Condensed */}
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div className="flex items-center space-x-3 px-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">Tracking ID</span>
                                <code className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{jobId}</code>
                            </div>
                            <form onSubmit={handleSearch} className="flex">
                                <input
                                    className="text-sm border-none focus:ring-0 text-right text-slate-600 placeholder:text-slate-300 w-32 md:w-48"
                                    placeholder="Track another..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg ml-2 transition-colors">
                                    <Search className="w-4 h-4" />
                                </button>
                            </form>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-20">
                                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Locating shipment data...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4">
                                <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-red-900">Shipment Not Found</h3>
                                    <p className="text-red-600">{error}</p>
                                </div>
                                <button onClick={() => navigate('/track')} className="text-sm font-bold underline hover:no-underline text-red-800">
                                    Try a different ID
                                </button>
                            </div>
                        )}

                        {/* Success State */}
                        {jobData && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                                {/* Status Card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                                            <h2 className="text-2xl md:text-3xl font-black text-slate-800 capitalize flex items-center gap-3">
                                                {jobData.status.replace('_', ' ')}
                                                <StatusBadge status={jobData.status} />
                                            </h2>
                                        </div>
                                        {jobData.haulerProfile && (
                                            <div className="text-right hidden md:block">
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Carrier</p>
                                                <p className="font-bold text-slate-700">{jobData.haulerProfile.universal?.displayName || 'Unknown Hauler'}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stepper */}
                                    <div className="relative flex justify-between items-center mb-4">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full -z-0"></div>

                                        {/* Step 1 */}
                                        <StepIndicator
                                            icon={Package}
                                            label="Posted"
                                            status={getStepStatus('open')}
                                            activeColor="bg-blue-500"
                                        />

                                        {/* Step 2 */}
                                        <StepIndicator
                                            icon={Truck}
                                            label="Assigned"
                                            status={getStepStatus('assigned')}
                                            activeColor="bg-amber-500"
                                        />

                                        {/* Step 3 */}
                                        <StepIndicator
                                            icon={MapPin}
                                            label="In Transit"
                                            status={getStepStatus('in_transit')}
                                            activeColor="bg-primary"
                                        />

                                        {/* Step 4 */}
                                        <StepIndicator
                                            icon={CheckCircle}
                                            label="Delivered"
                                            status={getStepStatus('delivered')}
                                            activeColor="bg-emerald-500"
                                        />
                                    </div>
                                </div>

                                {/* Map & Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Map Column */}
                                    <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[400px]">
                                        {jobData.originLocation && jobData.destinationLocation ? (
                                            <LiveMap
                                                startPos={[jobData.originLocation.lat, jobData.originLocation.lng]}
                                                endPos={[jobData.destinationLocation.lat, jobData.destinationLocation.lng]}
                                                driverPos={jobData.driverLocation ? [jobData.driverLocation.lat, jobData.driverLocation.lng] : null}
                                            />
                                        ) : (
                                            <div className="h-full flex items-center justify-center bg-slate-50 text-slate-400">
                                                <p>Map data unavailable</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details Column */}
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <Package className="w-4 h-4 text-amber-500" /> Shipment Details
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="relative pl-6 border-l-2 border-slate-100 pb-4">
                                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500"></div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase">From</p>
                                                    <p className="font-semibold text-slate-700">{jobData.origin}</p>
                                                </div>
                                                <div className="relative pl-6 border-l-2 border-slate-100">
                                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-emerald-500"></div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase">To</p>
                                                    <p className="font-semibold text-slate-700">{jobData.destination}</p>
                                                </div>
                                            </div>

                                            {jobData.cargoType && (
                                                <div className="mt-6 pt-4 border-t border-slate-100 text-sm">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-slate-500">Cargo</span>
                                                        <span className="font-medium text-slate-800">{jobData.cargoType}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Weight</span>
                                                        <span className="font-medium text-slate-800">{jobData.weight}kg</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {jobData.status === 'delivered' && (
                                            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6">
                                                <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" /> Proof of Delivery
                                                </h3>
                                                <p className="text-xs text-emerald-700 mb-4">
                                                    Delivered on {jobData.completedAt ? new Date(jobData.completedAt.seconds * 1000).toLocaleString() : 'N/A'}
                                                </p>
                                                {/* If we had the Photo URL stored directly on job or fetching subcollection, we'd show it here. 
                                                    For MVP showing the status is key. */}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

// Helper Component for the Stepper
function StepIndicator({ icon: Icon, label, status, activeColor }) {
    const isCompleted = status === 'completed';
    const isActive = status === 'active';

    let circleClass = "bg-white border-2 border-slate-200 text-slate-300";
    if (isCompleted) circleClass = `${activeColor} border-transparent text-white`;
    if (isActive) circleClass = "bg-white border-4 border-amber-400 text-amber-600 shadow-lg scale-110";

    return (
        <div className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${circleClass}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] md:text-xs font-bold uppercase mt-2 transition-colors duration-300 ${isActive || isCompleted ? 'text-slate-800' : 'text-slate-300'}`}>
                {label}
            </span>
        </div>
    );
}
