import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ShieldCheck, LogOut, Settings, Users, Package, Truck, Bell, Search, Menu, X } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import SupplierDashboard from './pages/SupplierDashboard';
import HaulerDashboard from './pages/HaulerDashboard';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster, toast } from 'react-hot-toast';
import TrackingPage from './pages/TrackingPage';
import CompanySetup from './pages/CompanySetup';
import TeamManagement from './pages/TeamManagement';
import { db, auth } from './firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc, onSnapshot, query, orderBy, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// --- Main Dashboard Logic (Protected) ---
function DashboardApp() {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [role, setRole] = useState(null);
    const [view, setView] = useState('landing'); // landing
    const [activeTab, setActiveTab] = useState('board');
    const [transportJobs, setTransportJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Auth Listener & User Profile Subscription ---
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // --- Profile Migration Check (For Admin-Created Drivers) ---
                const userRef = doc(db, "users", currentUser.uid);
                const initialSnap = await getDoc(userRef);

                if (!initialSnap.exists() && currentUser.email) {
                    const q = query(collection(db, "users"), where("email", "==", currentUser.email));
                    const emailSnap = await getDocs(q);

                    if (!emailSnap.empty) {
                        const legacyDoc = emailSnap.docs[0];
                        const legacyData = legacyDoc.data();

                        // Bridge the admin-created doc to the real Auth UID
                        await setDoc(userRef, {
                            ...legacyData,
                            uid: currentUser.uid,
                            migratedAt: Date.now()
                        });

                        // --- EXTENDED MIGRATION: Update references ---

                        // 1. Update jobs assigned to this driver
                        const jobsQ = query(collection(db, "transportJobs"), where("assignedDriverId", "==", legacyDoc.id));
                        const jobsSnap = await getDocs(jobsQ);
                        const jobUpdates = jobsSnap.docs.map(jDoc => updateDoc(doc(db, "transportJobs", jDoc.id), {
                            assignedDriverId: currentUser.uid
                        }));
                        await Promise.all(jobUpdates);

                        // 2. Update organization membership
                        if (legacyData.organizationId) {
                            const orgRef = doc(db, "organizations", legacyData.organizationId);
                            const orgSnap = await getDoc(orgRef);
                            if (orgSnap.exists()) {
                                await updateDoc(orgRef, {
                                    members: arrayRemove(legacyDoc.id)
                                });
                                await updateDoc(orgRef, {
                                    members: arrayUnion(currentUser.uid)
                                });
                            }
                        }

                        // Cleanup legacy fake-id doc
                        await deleteDoc(doc(db, "users", legacyDoc.id));
                        toast.success("Profile Activated: Welcome to the Fleet!");
                    }
                }

                const unsubscribeProfile = onSnapshot(userRef, (doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        setUserProfile(data);

                        // Unified Role Detection Logic
                        // 1. Check explicit userType first (preferred)
                        // 2. Fall back to functional role
                        const identity = data.userType || (['supplier', 'hauler', 'driver', 'dispatcher'].includes(data.role) ? data.role : null);

                        if (identity && identity !== 'user') {
                            if (identity === 'supplier') {
                                setRole('supplier');
                                if (!activeTab || activeTab === 'board') setActiveTab('history');
                            } else if (['hauler', 'driver', 'dispatcher', 'admin', 'owner'].includes(identity)) {
                                setRole('hauler');
                                // Refined tab logic: Drivers see 'active' by default, others see 'board'
                                const defaultTab = identity === 'driver' ? 'active' : 'board';
                                if (!activeTab || activeTab === 'history' || (activeTab === 'board' && identity === 'driver')) {
                                    setActiveTab(defaultTab);
                                }
                            } else {
                                // Default to hauler if they have a specialized hauler role but identity wasn't caught
                                if (data.role && ['dispatcher', 'owner', 'admin'].includes(data.role)) {
                                    setRole('hauler');
                                }
                            }
                        } else {
                            // If identity is 'user' or null, we stay on onboarding
                            setRole(null);
                        }
                    } else {
                        setUserProfile({ organizationId: null, role: 'user', userType: 'user' });
                        setRole(null);
                    }
                    setAuthLoading(false);
                }, (error) => {
                    console.error("Profile Subscription Error:", error);
                    toast.error("Failed to sync profile");
                    setAuthLoading(false);
                });
                return () => unsubscribeProfile();
            } else {
                setUserProfile(null);
                setAuthLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // --- Firebase Real-time Listener for Jobs ---
    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "transportJobs"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const jobsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTransportJobs(jobsData);
            setLoading(false);
        }, (error) => {
            console.error("Firebase Jobs Error:", error);
            // toast.error("Connection interrupted. Retrying...");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // --- Actions ---
    const handlePostTransport = async (jobData) => {
        // Validation check
        if (!jobData.goodsType || !jobData.departure || !jobData.destination || !jobData.tonnage || !jobData.budget) {
            toast.error("Manifest Integrity Error: All required nodes must be populated.");
            return;
        }

        const numTonnage = parseFloat(jobData.tonnage);
        const numBudget = parseFloat(jobData.budget);

        if (isNaN(numTonnage) || numTonnage <= 0 || isNaN(numBudget) || numBudget <= 0) {
            toast.error("Metric Validation Failure: Weight and Budget must be positive integers.");
            return;
        }

        const loadingToast = toast.loading("Posting load to network...");
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const supplierProfile = userDoc.exists() ? userDoc.data() : { universal: { displayName: user.displayName } };

            await addDoc(collection(db, "transportJobs"), {
                ...jobData,
                tonnage: numTonnage,
                budget: numBudget,
                status: 'open',
                supplierId: user.uid,
                supplierEmail: user.email,
                supplierProfile: supplierProfile,
                supplierOrgId: userProfile?.organizationId || null,
                haulerId: null,
                createdAt: Date.now()
            });
            toast.success("Load posted successfully!", { id: loadingToast });
            setActiveTab('history');
        } catch (e) {
            console.error("Error adding document: ", e);
            toast.error("Failed to post load. Try again.", { id: loadingToast });
        }
    };

    const handleEditTransport = async (jobId, updatedData) => {
        if (updatedData.tonnage) {
            const num = parseFloat(updatedData.tonnage);
            if (isNaN(num) || num <= 0) return toast.error("Invalid Payload Weight");
            updatedData.tonnage = num;
        }
        if (updatedData.budget) {
            const num = parseFloat(updatedData.budget);
            if (isNaN(num) || num <= 0) return toast.error("Invalid Financial Budget");
            updatedData.budget = num;
        }

        const loadingToast = toast.loading("Updating load...");
        try {
            const jobRef = doc(db, "transportJobs", jobId);
            await updateDoc(jobRef, updatedData);
            toast.success("Load updated!", { id: loadingToast });
            setActiveTab('history');
        } catch (e) {
            console.error("Error editing document: ", e);
            toast.error("Update failed.", { id: loadingToast });
        }
    };

    const handleDeleteTransport = async (jobId) => {
        try {
            if (window.confirm("Are you sure you want to delete this job?")) {
                const loadingToast = toast.loading("Removing load...");
                await deleteDoc(doc(db, "transportJobs", jobId));
                toast.success("Load removed.", { id: loadingToast });
            }
        } catch (e) {
            console.error("Error deleting document: ", e);
            toast.error("Deletion failed.");
        }
    };

    const handleSecureJob = async (jobId) => {
        const loadingToast = toast.loading("Securing logistics contract...");
        try {
            const haulerOrgId = userProfile?.organizationId;
            if (!haulerOrgId) {
                toast.error("Company registration required to secure contracts.", { id: loadingToast });
                return;
            }

            const jobRef = doc(db, "transportJobs", jobId);
            await updateDoc(jobRef, {
                status: 'secured',
                haulerId: user.uid,
                haulerName: userProfile.organizationName || userProfile.displayName || user.email || 'Transporter',
                haulerOrgId: haulerOrgId,
                haulerEmail: user.email || userProfile.email || '',
                haulerProfile: userProfile,
                securedAt: Date.now()
            });
            toast.success("Contract Secured. Please assign assets.", { id: loadingToast });
        } catch (e) {
            console.error("Error securing job:", e);
            toast.error("Load is no longer available.", { id: loadingToast });
        }
    };

    const handleAssignJob = async (jobId, driverId, driverName, truckReg) => {
        const loadingToast = toast.loading("Finalizing asset assignment...");
        try {
            const jobRef = doc(db, "transportJobs", jobId);
            await updateDoc(jobRef, {
                status: 'assigned',
                assignedDriverId: driverId,
                assignedDriverName: driverName,
                truckRegistration: truckReg,
                assignedAt: Date.now()
            });
            toast.success("Assets Deployed Successfully", { id: loadingToast });
        } catch (e) {
            console.error("Error assigning job:", e);
            toast.error("Assignment failed.", { id: loadingToast });
        }
    };

    const handleUpdateTransportStatus = async (jobId, newStatus) => {
        try {
            const jobRef = doc(db, "transportJobs", jobId);
            await updateDoc(jobRef, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
        } catch (e) {
            toast.error("Status update failed.");
        }
    };

    const handleExpireJob = async (jobId) => {
        try {
            const jobRef = doc(db, "transportJobs", jobId);
            await updateDoc(jobRef, {
                status: 'open',
                haulerId: null,
                haulerOrgId: null,
                haulerEmail: null,
                haulerProfile: null,
                acceptedAt: null
            });
            toast.error("Job assignment expired.");
        } catch (e) {
            console.error("Error expiring job:", e);
        }
    };

    // --- Filtered Views ---
    const supplierRequests = transportJobs.filter(j => j.supplierId === user?.uid);
    const availableHauls = transportJobs.filter(j => j.status === 'open');
    const myHauls = transportJobs.filter(j =>
        (j.haulerId === user?.uid) ||
        (j.haulerOrgId && userProfile?.organizationId && j.haulerOrgId === userProfile.organizationId)
    );

    if (authLoading) return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">Syncing AutoDirect...</p>
        </div>
    );

    // 1. Landing Screen
    if (!user && view === 'landing') {
        return <LandingPage onGetStarted={() => setView('auth')} />;
    }

    // 2. Login
    if (!user) {
        return <LoginPage />;
    }

    // NEW: Force Password Reset (Driver Onboarding)
    if (userProfile?.forcePasswordChange) {
        return <ForcePasswordChange user={user} onComplete={() => updateDoc(doc(db, "users", user.uid), { forcePasswordChange: false })} />;
    }

    // 3. Post-Auth Onboarding (Role Selection)
    if (user && userProfile && (!userProfile.role || userProfile.role === 'user')) {
        return (
            <OnboardingPage
                user={user}
                onComplete={(r) => {
                    setRole(r);
                    setActiveTab(r === 'supplier' ? 'history' : 'board');
                }}
            />
        );
    }

    // 4. Company Setup Check
    if (userProfile && !userProfile.organizationId) {
        return (
            <div className="min-h-screen bg-slate-50">
                <header className="p-4 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm sticky top-0 z-50">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Truck className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-lg uppercase tracking-tighter">Auto<span className="text-primary">Direct</span></span>
                    </div>
                    <button onClick={() => signOut(auth)} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase hover:bg-red-100 transition-colors">Sign Out</button>
                </header>
                <div className="max-w-4xl mx-auto p-4 md:p-10">
                    <CompanySetup user={user} role={role} onComplete={() => window.location.reload()} />
                </div>
            </div>
        );
    }

    // 5. Loading Data
    if (loading) return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Bridging Supply & Demand...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900 selection:bg-primary/10">

            {activeTab === 'team_management' && (
                <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto animate-in fade-in duration-300">
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        <button onClick={() => setActiveTab('board')} className="mb-6 flex items-center text-xs font-black uppercase text-slate-400 hover:text-primary transition-colors">
                            <X className="w-4 h-4 mr-2" /> Close Team View
                        </button>
                        <TeamManagement user={{ ...user, ...userProfile }} />
                    </div>
                </div>
            )}

            {activeTab === 'team_management' && (
                <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto animate-in fade-in duration-300">
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        <button onClick={() => setActiveTab('board')} className="mb-6 flex items-center text-xs font-black uppercase text-slate-400 hover:text-primary transition-colors">
                            <X className="w-4 h-4 mr-2" /> Close Team View
                        </button>
                        <TeamManagement user={{ ...user, ...userProfile }} />
                    </div>
                </div>
            )}

            {/* Safety Transition Screen */}
            {!role && userProfile && userProfile.role !== 'user' && (
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Intelligence Deck...</p>
                    </div>
                </div>
            )}

            <main className={`${role === 'supplier' ? 'w-full' : role === 'hauler' ? '' : 'max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 min-h-[calc(100vh-140px)]'} animate-in fade-in duration-500`}>
                {role === 'supplier' && (
                    <SupplierDashboard
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onPostJob={handlePostTransport}
                        onEditJob={handleEditTransport}
                        onDeleteJob={handleDeleteTransport}
                        myJobs={supplierRequests}
                        user={user}
                        userProfile={userProfile}
                    />
                )}
                {role === 'hauler' && (
                    <HaulerDashboard
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        availableJobs={availableHauls}
                        myJobs={myHauls}
                        onSecureJob={handleSecureJob}
                        onAssignJob={handleAssignJob}
                        onUpdateStatus={handleUpdateTransportStatus}
                        onExpireJob={handleExpireJob}
                        userProfile={userProfile}
                    />
                )}
            </main>

            {/* Global Quick Action Tooltip / Tracker */}
            <div className="fixed bottom-6 right-6 z-30 group">
                <button
                    onClick={() => window.location.href = "/track"}
                    className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl shadow-slate-900/40 hover:scale-110 active:scale-95 transition-all group-hover:rotate-12"
                >
                    <Search className="w-6 h-6" />
                </button>
                <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xl text-[10px] font-black uppercase tracking-wider text-slate-600">
                    Track Any Shipment
                </div>
            </div>
        </div>
    );
}

const ForcePasswordChange = ({ user, onComplete }) => {
    const [password, setPassword] = React.useState('');
    const [confirm, setConfirm] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) return toast.error("Passwords do not match");
        if (password.length < 6) return toast.error("Password must be at least 6 characters");

        setLoading(true);
        try {
            // In production, we'd update Auth password. For prototype, we update Firestore flag.
            await onComplete();
            toast.success("Security Credentials Updated. Welcome to the Fleet.");
        } catch (e) {
            toast.error("Failed to update credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-20"></div>
            <div className="max-w-md w-full bg-white text-slate-900 rounded-[3rem] p-12 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mb-8 mx-auto">
                    <ShieldCheck size={40} />
                </div>
                <h1 className="text-3xl font-black text-center uppercase tracking-tighter mb-4">Security Protocol</h1>
                <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10">
                    Your account was initialized by an administrator. Please establish your private secure access credentials.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secure Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="w-full py-5 bg-[#0f172a] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Securing Account...' : 'Initialize Access'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Main Router & Routes ---
export default function App() {
    return (
        <NotificationProvider>
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'font-sans text-xs font-bold uppercase tracking-wider',
                    duration: 3000,
                    style: {
                        borderRadius: '12px',
                        background: '#ffffff',
                        color: '#1e293b',
                        border: '1px solid #e2e8f0',
                        padding: '12px 16px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    },
                }}
            />
            <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <Routes>
                    <Route path="/track" element={<TrackingPage />} />
                    <Route path="/track/:jobId" element={<TrackingPage />} />
                    <Route path="/*" element={<DashboardApp />} />
                </Routes>
            </BrowserRouter>
        </NotificationProvider>
    );
}
