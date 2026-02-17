import React, { useState } from 'react';
import { Building, MapPin, FileText, User, Phone, ArrowRight, Loader2, Landmark } from 'lucide-react';
import { db } from '../firebaseConfig';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function CompanySetup({ user, onComplete, role }) {
    const isSupplier = role === 'supplier';
    const accentColor = isSupplier ? 'orange' : 'blue';
    const accentHex = isSupplier ? '#FF4D00' : '#2563EB';

    const [loading, setLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        companyName: '',
        regNumber: '',
        physicalAddress: '',
        contactPerson: user.displayName || '',
        contactNumber: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOnboard = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading("Initializing Corporate Profile...");

        try {
            // 1. Create Organization Document
            const orgId = `org_${user.uid}_${Date.now()}`;
            const orgRef = doc(db, 'organizations', orgId);

            const orgData = {
                name: formData.companyName,
                regNumber: formData.regNumber,
                address: formData.physicalAddress,
                contactPerson: formData.contactPerson,
                contactNumber: formData.contactNumber,
                type: 'company',
                industry: isSupplier ? 'Supply/Mining' : 'Logistics/Transport',
                adminUserId: user.uid,
                createdAt: serverTimestamp(),
                members: [user.uid],
                status: 'pending_verification'
            };

            await setDoc(orgRef, orgData);

            // 2. Update User Profile
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                organizationId: orgId,
                role: 'admin',
                isCompanySetupComplete: true,
                companyName: formData.companyName,
                updatedAt: serverTimestamp()
            }, { merge: true });

            toast.success("Corporate Profile Created!", { id: loadingToast });
            onComplete();
        } catch (error) {
            console.error("Onboarding Error:", error);
            toast.error("Process failed. Please verify your connection.", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white bg-grid-slate flex flex-col items-center justify-center p-6 font-sans">

            <div className="w-full max-w-xl mb-6 relative z-10">
                <button
                    onClick={async () => {
                        // Reset role in firestore to allow going back to OnboardingPage
                        const userRef = doc(db, "users", user.uid);
                        await updateDoc(userRef, { role: 'user' });
                        onComplete(); // Trigger re-evaluation of setup status
                    }}
                    className="flex items-center text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 tracking-widest transition-all group"
                >
                    <ArrowRight className="w-3 h-3 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Change User Role
                </button>
            </div>

            <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">

                {/* Header Section */}
                <div className="mb-10 text-center">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3 transition-transform hover:rotate-0`} style={{ backgroundColor: accentHex }}>
                        <Landmark className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                        {isSupplier ? 'Supplier' : 'Transporter'} Identity
                    </h2>
                    <p className="text-slate-500 font-medium text-sm">Verify your corporate credentials to access the terminal.</p>
                </div>

                <form onSubmit={handleOnboard} className="space-y-6">

                    {/* Company Basics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center">
                                <Building className="w-3 h-3 mr-1" /> Corporate Entity Name
                            </label>
                            <input
                                required
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="e.g. Skyline Logistics Ltd."
                                className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-${accentColor}-500/10 focus:border-${accentColor}-500 transition-all`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center">
                                <FileText className="w-3 h-3 mr-1" /> Certificate of Incorporation
                            </label>
                            <input
                                required
                                name="regNumber"
                                value={formData.regNumber}
                                onChange={handleChange}
                                placeholder="Registration #"
                                className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-${accentColor}-500/10 focus:border-${accentColor}-500 transition-all`}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" /> Registered Office Address
                        </label>
                        <textarea
                            required
                            name="physicalAddress"
                            value={formData.physicalAddress}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Full physical office location in Zimbabwe..."
                            className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-${accentColor}-500/10 focus:border-${accentColor}-500 transition-all resize-none`}
                        />
                    </div>

                    {/* Contact Person Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center">
                                <User className="w-3 h-3 mr-1" /> Representative Name
                            </label>
                            <input
                                required
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                placeholder="Executive / Ops Manager"
                                className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-${accentColor}-500/10 focus:border-${accentColor}-500 transition-all`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center">
                                <Phone className="w-3 h-3 mr-1" /> Official Contact Line
                            </label>
                            <input
                                required
                                type="tel"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder="+263..."
                                className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-${accentColor}-500/10 focus:border-${accentColor}-500 transition-all`}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-900 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center shadow-xl shadow-slate-900/20"
                        style={{ backgroundColor: loading ? '#000' : accentHex }}
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Finalize Onboarding <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Powered By TechDevs
                    </p>
                </div>

            </div>
        </div>
    );
}
