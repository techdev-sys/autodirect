import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Shield } from 'lucide-react';
import { auth } from '../firebaseConfig';
import { toast } from 'react-hot-toast';

const TeamManagementSection = ({ userProfile }) => {
    const [newDriver, setNewDriver] = useState({ name: '', email: '', password: '', license: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleCreateDriver = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const loadingToast = toast.loading("Deploying Driver Protocol...");

        try {
            const idToken = await auth.currentUser.getIdToken();
            const FUNCTION_URL = window.location.hostname === 'localhost'
                ? 'http://localhost:5001/autodirect-5320e/us-central1/createOrgUser'
                : 'https://us-central1-autodirect-5320e.cloudfunctions.net/createOrgUser';

            const response = await fetch(FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    email: newDriver.email,
                    password: newDriver.password,
                    displayName: newDriver.name,
                    role: 'driver',
                    licenseNumber: newDriver.license,
                    organizationId: userProfile.organizationId || userProfile.uid
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Recruitment Failed");
            }

            toast.success("Driver Operationalized", { id: loadingToast });
            setNewDriver({ name: '', email: '', password: '', license: '' });
        } catch (e) {
            toast.error(e.message, { id: loadingToast });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-4">
                <Shield className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                    <p className="text-xs font-bold text-blue-900 uppercase">Organization Command</p>
                    <p className="text-[10px] text-blue-700">Add drivers to your organization. They will be linked to your Organization ID: {userProfile.organizationId || userProfile.uid}</p>
                </div>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Driver Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                required
                                value={newDriver.name}
                                onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tinashe M."
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">License Number</label>
                        <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                required
                                value={newDriver.license}
                                onChange={e => setNewDriver({ ...newDriver, license: e.target.value.toUpperCase() })}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="CLASS 4"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                required
                                type="email"
                                value={newDriver.email}
                                onChange={e => setNewDriver({ ...newDriver, email: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="driver@company.com"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Initial Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                required
                                type="password"
                                value={newDriver.password}
                                onChange={e => setNewDriver({ ...newDriver, password: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                <button
                    disabled={submitting}
                    className="w-full py-4 bg-[#121926] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <UserPlus size={16} />
                    {submitting ? 'Generating Account...' : 'Recruit Operative'}
                </button>
            </form>
        </div>
    );
};

export default TeamManagementSection;
