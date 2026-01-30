import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Trash2, Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function TeamManagement({ user }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, [user.organizationId]);

    const fetchMembers = async () => {
        try {
            if (!user.organizationId) return;
            const q = query(collection(db, "users"), where("organizationId", "==", user.organizationId));
            const snapshot = await getDocs(q);
            const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMembers(membersData);
        } catch (error) {
            console.error("Error fetching members:", error);
            toast.error("Failed to load team members");
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setIsInviting(true);
        const loadingToast = toast.loading(`Searching for ${inviteEmail}...`);

        try {
            const q = query(collection(db, "users"), where("email", "==", inviteEmail));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const foundUser = querySnapshot.docs[0];
                const userData = foundUser.data();

                if (userData.organizationId === user.organizationId) {
                    toast.error("User is already in your organization.", { id: loadingToast });
                    return;
                }

                if (window.confirm(`Found user ${userData.displayName || userData.email}. Add them to your team?`)) {
                    await updateDoc(doc(db, "users", foundUser.id), {
                        organizationId: user.organizationId,
                        role: 'driver' // Default
                    });

                    await updateDoc(doc(db, "organizations", user.organizationId), {
                        members: arrayUnion(foundUser.id)
                    });

                    toast.success(`${userData.displayName || inviteEmail} added!`, { id: loadingToast });
                    fetchMembers();
                    setInviteEmail('');
                } else {
                    toast.dismiss(loadingToast);
                }
            } else {
                // In a production app, we'd send an email invite.
                toast(`Invite request created for ${inviteEmail}. (Simulation)`, { id: loadingToast, icon: '📩' });
                setInviteEmail('');
            }
        } catch (e) {
            console.error("Invite error:", e);
            toast.error("Operation failed.", { id: loadingToast });
        } finally {
            setIsInviting(false);
        }
    };

    const handleUpdateRole = async (memberId, newRole) => {
        const loadingToast = toast.loading("Updating permissions...");
        try {
            await updateDoc(doc(db, "users", memberId), {
                role: newRole
            });
            setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
            toast.success("Role updated successfully!", { id: loadingToast });
        } catch (e) {
            console.error("Error updating role:", e);
            toast.error("Failed to update permissions.", { id: loadingToast });
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader className="w-8 h-8 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Scanning Network...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center">
                        <Users className="w-10 h-10 mr-4 text-primary" />
                        Command Team
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Scale your operations by adding dispatchers and drivers.</p>
                </div>
                <div className="px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 border border-slate-200 uppercase tracking-widest">
                    {members.length} Active Personnel
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Invite Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-24">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                            <UserPlus className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Recruit Member</h3>
                        <p className="text-xs text-slate-500 mb-6">Enter an email address to add a member to your organization.</p>

                        <form onSubmit={handleInvite} className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-4.5 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="email@company.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-sm transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isInviting}
                                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center text-[10px] uppercase tracking-[0.2em]"
                            >
                                Send Direct Invite
                            </button>
                        </form>

                        <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <div className="flex items-center space-x-2 mb-2">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span className="text-[10px] font-black uppercase text-amber-700 uppercase">Prototype Note</span>
                            </div>
                            <p className="text-[10px] leading-relaxed text-amber-600 font-medium">
                                In this environment, adding an existing user's email will instantly move them into your organization for testing purposes.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Personnel List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Active Manifest</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {members.length === 0 ? (
                                <div className="p-20 text-center">
                                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-slate-400">No personnel found.</p>
                                </div>
                            ) : (
                                members.map(member => (
                                    <div key={member.id} className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                                {member.displayName?.charAt(0) || <User className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 tracking-tight">{member.displayName || "Unregistered Alias"}</div>
                                                <div className="text-xs text-slate-500 font-medium">{member.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${member.role === 'admin' || member.role === 'owner' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                member.role === 'dispatcher' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                {member.role || 'Member'}
                                            </div>

                                            {member.id !== user.uid && (
                                                <div className="relative group/select">
                                                    <select
                                                        className="pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none hover:bg-white transition-all cursor-pointer"
                                                        value={member.role || 'driver'}
                                                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                                    >
                                                        <option value="driver">Driver</option>
                                                        <option value="dispatcher">Dispatcher</option>
                                                        <option value="accountant">Accountant</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
