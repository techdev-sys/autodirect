import React, { useState } from 'react';
import { Building, Users, ArrowRight, User, Briefcase, AlertTriangle, CheckCircle } from 'lucide-react';
import { db } from '../firebaseConfig';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function CompanySetup({ user, onComplete, role }) {
    const [mode, setMode] = useState('select'); // select, create_company, create_individual
    const [companyName, setCompanyName] = useState('');
    const [companyEmail, setCompanyEmail] = useState(user.email || '');
    const [loading, setLoading] = useState(false);

    // Helper to Create Org
    const createOrg = async (name, type, emailToUse) => {
        setLoading(true);
        const loadingToast = toast.loading("Configuring your organization...");
        try {
            const orgRef = doc(db, 'organizations', `org_${user.uid}_${Date.now()}`);
            const orgData = {
                name: name,
                type: type, // 'company' or 'personal'
                email: emailToUse, // Official contact email
                adminUserId: user.uid,
                createdAt: serverTimestamp(),
                members: [user.uid]
            };
            await setDoc(orgRef, orgData);

            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                organizationId: orgRef.id,
                role: type === 'personal' ? 'owner' : 'admin',
                isCompanySetupComplete: true
            });
            toast.success("Organization setup successfully!", { id: loadingToast });
            onComplete();
        } catch (error) {
            console.error("Error creating org:", error);
            toast.error("Initialization failed. Please try again.", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        // Soft check for generic email
        if (companyEmail.includes('gmail.com') || companyEmail.includes('yahoo.com')) {
            if (!window.confirm("Pro Tip: Using a generic email (Gmail/Yahoo) is not recommended for official Companies. Continue anyway?")) {
                return;
            }
        }
        await createOrg(companyName, 'company', companyEmail);
    };

    const handleCreateIndividual = async () => {
        const name = user.displayName ? `${user.displayName}'s Practice` : 'My Logistics Practice';
        await createOrg(name, 'personal', user.email);
    };

    if (mode === 'select') {
        return (
            <div className="max-w-xl mx-auto mt-10 md:mt-20 p-6 md:p-10 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center animate-in zoom-in duration-500">
                <div className="relative inline-block mb-8">
                    <div className="absolute -inset-4 bg-blue-100 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl rotate-3">
                        <Briefcase className="w-10 h-10 text-white" />
                    </div>
                </div>

                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Onboarding Terminal</h2>
                <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Select your operational model to configure your marketplace profile.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => setMode('create_company')}
                        className="flex flex-col items-center p-8 bg-slate-50 border-2 border-transparent rounded-[2rem] hover:border-blue-500 hover:bg-white hover:shadow-xl transition-all group text-center"
                    >
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                            <Building className="w-7 h-7 text-blue-600" />
                        </div>
                        <div className="font-black text-slate-900 text-xl mb-2 tracking-tight">Organization</div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Team-based operation with multiple units, drivers, or centralized dispatch.
                        </p>
                    </button>

                    <button
                        onClick={handleCreateIndividual}
                        className="flex flex-col items-center p-8 bg-slate-50 border-2 border-transparent rounded-[2rem] hover:border-amber-500 hover:bg-white hover:shadow-xl transition-all group text-center"
                    >
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                            <User className="w-7 h-7 text-amber-600" />
                        </div>
                        <div className="font-black text-slate-900 text-xl mb-2 tracking-tight">Solo Operator</div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Freelance driver or individual broker. Ideal for fast, simple setup.
                        </p>
                    </button>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100">
                    <button
                        onClick={() => toast("Contact your Administrator for an invite link.", { icon: '💡' })}
                        className="flex items-center justify-center mx-auto text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors py-2 px-4 rounded-full border border-transparent hover:border-slate-200"
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Joining an existing team?
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'create_company') {
        return (
            <div className="max-w-md mx-auto mt-10 md:mt-20 p-8 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in slide-in-from-bottom-6 duration-500">
                <button onClick={() => setMode('select')} className="flex items-center text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 mb-8 tracking-widest transition-colors">
                    <ArrowRight className="w-3 h-3 mr-2 rotate-180" /> Back to Terminal
                </button>

                <div className="flex items-center space-x-4 mb-8">
                    <div className="p-4 bg-blue-50 rounded-2xl">
                        <Building className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Workspace Build</h2>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em] mt-2">Establish Identity</p>
                    </div>
                </div>

                <form onSubmit={handleCreateCompany} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest ml-1">Legal Entity Name</label>
                        <input
                            type="text"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-900 placeholder:font-medium transition-all"
                            placeholder="e.g. Skyline Logistics LLC"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest ml-1">Corporate Email</label>
                        <input
                            type="email"
                            required
                            value={companyEmail}
                            onChange={(e) => setCompanyEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-900 placeholder:font-medium transition-all"
                            placeholder="ops@company.com"
                        />
                        {(companyEmail.includes('gmail') || companyEmail.includes('yahoo')) && (
                            <div className="mt-3 flex items-start space-x-3 text-amber-600 text-[10px] font-bold bg-amber-50 p-3 rounded-2xl border border-amber-100">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span className="uppercase tracking-tight leading-normal">Notice: Business domains (e.g., @fasttrack.com) receive higher visibility in the marketplace.</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center shadow-xl shadow-slate-900/20"
                    >
                        {loading ? 'Initializing...' : 'Construct Workspace'}
                    </button>
                </form>
            </div>
        );
    }

    return null;
}
