import React, { useState, useEffect } from 'react';
import { Package, Truck, ArrowRight, Loader2 } from 'lucide-react';
import { db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const OnboardingPage = ({ user, onComplete }) => {
    const [loading, setLoading] = useState(null);

    // If the user clicked a role on the landing page, auto-select it
    useEffect(() => {
        const hint = sessionStorage.getItem('hintRole');
        if (hint) {
            sessionStorage.removeItem('hintRole');
            handleSelectRole(hint);
        }
    }, []);

    const handleSelectRole = async (role) => {
        setLoading(role);
        try {
            // Use setDoc with merge: true to handle cases where the user doc might not exist yet
            await setDoc(doc(db, "users", user.uid), {
                userType: role, // 'supplier' or 'hauler'
                role: 'admin', // Default to admin for the person who onboards
                onboardingCompleted: true,
                uid: user.uid,
                email: user.email || null,
                lastSeen: new Date().toISOString()
            }, { merge: true });

            toast.success(`Welcome to AutoDirect, ${role}!`);
            onComplete(role);
        } catch (error) {
            console.error("Error setting role:", error);
            toast.error("Failed to save selection. Please try again.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-white bg-grid-slate flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-2xl space-y-12 text-center relative z-10">

                <div className="space-y-4">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <div className="w-8 h-8 bg-orange-500 rounded-md"></div>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Define Your Role</h2>
                    <p className="text-slate-500 font-medium text-lg">Are you a supplier or a transporter?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Supplier - Orange */}
                    <button
                        onClick={() => handleSelectRole('supplier')}
                        disabled={loading !== null}
                        className="group relative p-10 bg-white border-4 border-orange-500 rounded-[2.5rem] text-left hover:bg-orange-500 transition-all duration-300 shadow-xl hover:shadow-orange-200 active:scale-[0.98]"
                    >
                        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white transition-colors">
                            <Package className="w-7 h-7 text-orange-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2 group-hover:text-white transition-colors">
                            Supplier
                        </h3>
                        <p className="text-slate-500 text-sm font-bold mb-8 leading-relaxed group-hover:text-orange-50 transition-colors">
                            I have cargo that needs to be transported locally or regionally.
                        </p>
                        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 group-hover:text-white transition-colors">
                            {loading === 'supplier' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Select Supplier Mode'}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                        </div>
                    </button>

                    {/* Transporter - Blue */}
                    <button
                        onClick={() => handleSelectRole('hauler')}
                        disabled={loading !== null}
                        className="group relative p-10 bg-white border-4 border-blue-600 rounded-[2.5rem] text-left hover:bg-blue-600 transition-all duration-300 shadow-xl hover:shadow-blue-200 active:scale-[0.98]"
                    >
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white transition-colors">
                            <Truck className="w-7 h-7 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2 group-hover:text-white transition-colors">
                            Transporter
                        </h3>
                        <p className="text-slate-500 text-sm font-bold mb-8 leading-relaxed group-hover:text-blue-50 transition-colors">
                            I have a fleet of trucks looking for high-pay cargo assignments.
                        </p>
                        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 group-hover:text-white transition-colors">
                            {loading === 'hauler' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Select Transporter Mode'}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                        </div>
                    </button>
                </div>

                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pt-8">
                    Powered By TechDevs
                </p>
            </div>
        </div>
    );
};

export default OnboardingPage;
