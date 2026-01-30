import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ShieldCheck, LogOut, Settings, Users, Package, Truck, Bell, Search, Menu, X } from 'lucide-react';
import WelcomePage from './pages/WelcomePage';
import SupplierDashboard from './pages/SupplierDashboard';
import HaulerDashboard from './pages/HaulerDashboard';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster, toast } from 'react-hot-toast';
import TrackingPage from './pages/TrackingPage';
import CompanySetup from './pages/CompanySetup';
import TeamManagement from './pages/TeamManagement';
import { db, auth } from './firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// --- Main Dashboard Logic (Protected) ---
function DashboardApp() {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [role, setRole] = useState(null);
    const [activeTab, setActiveTab] = useState('board');
    const [transportJobs, setTransportJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Auth Listener & User Profile Subscription ---
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const userRef = doc(db, "users", currentUser.uid);
                const unsubscribeProfile = onSnapshot(userRef, (doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        setUserProfile(data);
                        // Auto-set role if not set and exists in profile
                        if (!role && data.role && data.role !== 'user') {
                            setRole(data.role === 'supplier' ? 'supplier' : 'hauler');
                            setActiveTab(data.role === 'supplier' ? 'history' : 'board');
                        }
                    } else {
                        setUserProfile({ organizationId: null });
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
    }, [role]);

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
            toast.error("Connection interrupted. Retrying...");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // --- Actions ---
    const handlePostTransport = async (jobData) => {
        const loadingToast = toast.loading("Posting load to network...");
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const supplierProfile = userDoc.exists() ? userDoc.data() : { universal: { displayName: user.displayName } };

            await addDoc(collection(db, "transportJobs"), {
                ...jobData,
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
            // Using toast for confirmation could be complex, keeping confirm for now but styled nicely would be better.
            // However, the request is for UI/UX improvement, so let's stick to standard confirm but maybe a modal later.
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

    const handleAcceptTransport = async (jobId) => {
        const loadingToast = toast.loading("Accepting load...");
        try {
            const haulerOrgId = userProfile?.organizationId;
            if (!haulerOrgId) {
                toast.error("Subscription required: Join a company to accept loads.", { id: loadingToast });
                return;
            }

            const jobRef = doc(db, "transportJobs", jobId);
            await updateDoc(jobRef, {
                status: 'assigned',
                haulerId: user.uid,
                haulerOrgId: haulerOrgId,
                haulerEmail: user.email,
                haulerProfile: userProfile,
                acceptedAt: Date.now()
            });
            toast.success("Job accepted! Drive safe.", { id: loadingToast });
        } catch (e) {
            console.error("Error accepting job:", e);
            toast.error("This load is no longer available.", { id: loadingToast });
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

    // 1. Role Selection
    if (!role) {
        return (
            <WelcomePage
                onSelectRole={(r) => {
                    setRole(r);
                    setActiveTab(r === 'supplier' ? 'post' : 'board');
                }}
            />
        );
    }

    // 2. Login
    if (!user) {
        return <LoginPage />;
    }

    // 3. Company Setup Check
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

    // 4. Loading Data
    if (loading) return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Bridging Supply & Demand...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900 selection:bg-primary/10">
            {activeTab === 'profile_editor' && (
                <ProfilePage
                    user={user}
                    onClose={() => setActiveTab(role === 'supplier' ? 'history' : 'board')}
                />
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

            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="relative group cursor-pointer lg:hover:scale-105 transition-transform" onClick={() => setActiveTab(role === 'supplier' ? 'history' : 'board')}>
                            <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-blue-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative w-10 h-10 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                                <img src="/app-logo.png" alt="AutoDirect" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="font-black text-xl uppercase tracking-tighter text-slate-900">
                                Auto<span className="text-primary">Direct</span>
                            </span>
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mt-0.5">Logistics OS</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Dynamic Role Indicator */}
                        <div className={`hidden md:flex items-center text-[10px] font-black uppercase px-3 py-1.5 rounded-full border shadow-sm transition-all ${role === 'supplier'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100/50'
                            : 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100/50'
                            }`}>
                            {role === 'supplier' ? <Package className="w-3.5 h-3.5 mr-2" /> : <Truck className="w-3.5 h-3.5 mr-2" />}
                            {role === 'supplier' ? 'Supplier Portal' : 'Hauler Network'}
                        </div>

                        <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

                        {/* Control Center */}
                        <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200/60">
                            {userProfile?.role === 'admin' && (
                                <button
                                    onClick={() => setActiveTab('team_management')}
                                    className={`p-2.5 rounded-xl transition-all ${activeTab === 'team_management' ? 'bg-white text-primary shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-900'}`}
                                    title="Team Management"
                                >
                                    <Users className="w-4 h-4" />
                                </button>
                            )}

                            <button
                                onClick={() => setActiveTab('profile_editor')}
                                className={`p-2.5 rounded-xl transition-all ${activeTab === 'profile_editor' ? 'bg-white text-primary shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-900'}`}
                                title="Settings"
                            >
                                <Settings className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => {
                                    setRole(null);
                                    toast.success("Switched to role selection");
                                }}
                                className="p-2.5 text-slate-500 hover:text-slate-900 rounded-xl transition-all items-center flex"
                                title="Switch Identity"
                            >
                                <Users className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => {
                                    signOut(auth);
                                    toast.success("Signed out successfully");
                                }}
                                className="p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Secure Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 min-h-[calc(100vh-140px)] animate-in fade-in duration-500">
                {role === 'supplier' && (
                    <SupplierDashboard
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onPostJob={handlePostTransport}
                        onEditJob={handleEditTransport}
                        onDeleteJob={handleDeleteTransport}
                        myJobs={supplierRequests}
                    />
                )}
                {role === 'hauler' && (
                    <HaulerDashboard
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        availableJobs={availableHauls}
                        myJobs={myHauls}
                        onAcceptJob={handleAcceptTransport}
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
            <BrowserRouter>
                <Routes>
                    <Route path="/track" element={<TrackingPage />} />
                    <Route path="/track/:jobId" element={<TrackingPage />} />
                    <Route path="/*" element={<DashboardApp />} />
                </Routes>
            </BrowserRouter>
        </NotificationProvider>
    );
}

