import React, { useState, useEffect, useMemo } from 'react';
import {
    collection, query, where, doc, updateDoc,
    onSnapshot, serverTimestamp, setDoc, addDoc, deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { toast } from 'react-hot-toast';

// Layout & Navigation
import HaulerSidebar from '../components/hauler/HaulerSidebar';
import HaulerHeader from '../components/hauler/HaulerHeader';

// Views
import HomeView from './hauler/HomeView';
import MarketplaceView from './hauler/MarketplaceView';
import FleetView from './hauler/FleetView';
import ActiveOpsView from './hauler/ActiveOpsView';
import ArchivesView from './hauler/ArchivesView';
import SettingsView from './hauler/SettingsView';
import WalletView from './hauler/WalletView';

// Components
import ProofOfDelivery from '../components/ProofOfDelivery';
import ResourceModal from '../components/hauler/ResourceModal';
import AssignmentModal from '../components/hauler/AssignmentModal';
import LogoutModal from '../components/hauler/LogoutModal';

const HaulerDashboard = ({
    userProfile,
    availableJobs: propsAvailableJobs,
    myJobs: propsMyJobs,
    onSecureJob,
    onAssignJob,
    activeTab: propsActiveTab,
    setActiveTab: propsSetActiveTab
}) => {
    // State Management
    const [internalActiveTab, setInternalActiveTab] = useState('dashboard');
    const activeTab = propsActiveTab || internalActiveTab;
    const setActiveTab = propsSetActiveTab || setInternalActiveTab;

    const [internalAvailableJobs, setAvailableJobs] = useState([]);
    const [internalMyJobs, setMyJobs] = useState([]);
    const [fleetAssets, setFleetAssets] = useState([]);
    const [orgDrivers, setOrgDrivers] = useState([]);

    const [marketplaceFilter, setMarketplaceFilter] = useState('All');
    const [priceSort, setPriceSort] = useState('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Modals & Selection
    const [showAssignModal, setShowAssignModal] = useState(null);
    const [showPODModal, setShowPODModal] = useState(null);
    const [selectedMapJob, setSelectedMapJob] = useState(null);
    const [showResourceModal, setShowResourceModal] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const isDispatcher = ['dispatcher', 'owner', 'admin'].includes(userProfile?.role);
    const isDriver = userProfile?.role === 'driver';

    const availableJobsFromProps = propsAvailableJobs || internalAvailableJobs;
    const myJobs = propsMyJobs || internalMyJobs;

    // Derived Data
    const filteredAvailableJobs = useMemo(() => {
        let jobs = [...availableJobsFromProps];
        if (marketplaceFilter !== 'All') {
            jobs = jobs.filter(j =>
                j.fleetType?.toLowerCase().includes(marketplaceFilter.toLowerCase()) ||
                j.goodsType?.toLowerCase().includes(marketplaceFilter.toLowerCase())
            );
        }
        jobs.sort((a, b) => {
            const valA = a.budget || 0;
            const valB = b.budget || 0;
            return priceSort === 'desc' ? valB - valA : valA - valB;
        });
        return jobs;
    }, [availableJobsFromProps, marketplaceFilter, priceSort]);

    const activeMissions = myJobs.filter(j => j.status !== 'delivered' && j.status !== 'paid');
    const completedMissions = myJobs.filter(j => j.status === 'delivered' || j.status === 'paid');
    const totalFleetTonnage = myJobs.reduce((acc, j) => acc + (Number(j.tonnage) || 0), 0);

    // Firebase Listeners
    useEffect(() => {
        if (!userProfile?.uid) return;

        let unsubOpen = () => { };
        if (isDispatcher) {
            const qOpen = query(collection(db, "transportJobs"), where("status", "==", "open"));
            unsubOpen = onSnapshot(qOpen, (snap) => {
                setAvailableJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            });
        }

        let qMy;
        if (isDispatcher) {
            qMy = query(collection(db, "transportJobs"), where("haulerOrgId", "==", userProfile?.organizationId));
        } else {
            qMy = query(collection(db, "transportJobs"), where("assignedDriverId", "==", userProfile?.uid));
        }

        const unsubMy = onSnapshot(qMy, (snap) => {
            setMyJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });

        let unsubDrivers = () => { };
        let unsubFleet = () => { };
        if (isDispatcher && userProfile?.organizationId) {
            const qDrivers = query(
                collection(db, "users"),
                where("organizationId", "==", userProfile?.organizationId),
                where("role", "==", "driver")
            );
            unsubDrivers = onSnapshot(qDrivers, (snap) => {
                setOrgDrivers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            });

            const qFleet = query(
                collection(db, "fleet"),
                where("organizationId", "==", userProfile?.organizationId)
            );
            unsubFleet = onSnapshot(qFleet, (snap) => {
                setFleetAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            });
        }

        return () => {
            unsubOpen();
            unsubMy();
            unsubDrivers();
            unsubFleet();
        };
    }, [userProfile, isDispatcher]);

    // Handlers
    const handleJobAction = async (job, action, extra = {}) => {
        const jobRef = doc(db, "transportJobs", job.id);
        const loadingToast = toast.loading("Processing...");

        try {
            switch (action) {
                case 'secure':
                    if (onSecureJob) {
                        await onSecureJob(job.id);
                        setShowAssignModal(job);
                    }
                    toast.dismiss(loadingToast);
                    return;
                case 'assign_confirm':
                    if (onAssignJob) {
                        await onAssignJob(job.id, extra.driverId, extra.driverName, extra.truckReg);
                        setShowAssignModal(null);
                    }
                    toast.dismiss(loadingToast);
                    break;
                case 'loading':
                    await updateDoc(jobRef, { status: 'loading', loadedAt: serverTimestamp() });
                    toast.success("Job status: Loading", { id: loadingToast });
                    break;
                case 'transit':
                    await updateDoc(jobRef, { status: 'in_transit', transitStartedAt: serverTimestamp() });
                    toast.success("Job status: In Transit", { id: loadingToast });
                    break;
                case 'fulfillment':
                    setShowPODModal(job);
                    toast.dismiss(loadingToast);
                    break;
                default:
                    toast.error("Operation unrecognized", { id: loadingToast });
            }
        } catch (e) {
            console.error(e);
            toast.error("Cloud action failed", { id: loadingToast });
        }
    };

    const handleManageResource = async (type, mode, data) => {
        // --- Validation Layer ---
        if (type === 'driver') {
            if (!data.displayName || !data.email || !data.phoneNumber) {
                return toast.error("Personnel Error: All driver credentials must be populated.");
            }
            if (!data.email.includes('@')) {
                return toast.error("Identity Error: Invalid email format detected.");
            }
        } else {
            if (!data.registration || !data.tonnageCap) {
                return toast.error("Hardware Error: Asset registration and capacity required.");
            }
            const ton = parseFloat(data.tonnageCap);
            if (isNaN(ton) || ton <= 0) {
                return toast.error("Metric Error: Payload capacity must be a positive integer.");
            }
            data.tonnageCap = ton; // Ensure numeric storage
        }

        const loadingToast = toast.loading(`${mode === 'create' ? 'Inscribing' : 'Calibrating'} resource node...`);
        try {
            if (type === 'driver') {
                if (mode === 'create') {
                    const newId = doc(collection(db, "users")).id;
                    await setDoc(doc(db, "users", newId), {
                        ...data,
                        role: 'driver',
                        userType: 'hauler',
                        organizationId: userProfile.organizationId,
                        organizationName: userProfile.organizationName,
                        createdAt: serverTimestamp(),
                        forcePasswordChange: true
                    });
                } else {
                    await updateDoc(doc(db, "users", data.id), data);
                }
            } else {
                if (mode === 'create') {
                    await addDoc(collection(db, "fleet"), {
                        ...data,
                        organizationId: userProfile.organizationId,
                        createdAt: serverTimestamp(),
                        status: 'Available'
                    });
                } else {
                    await updateDoc(doc(db, "fleet", data.id), data);
                }
            }
            toast.success("Network Synchronization Successful", { id: loadingToast });
            setShowResourceModal(null);
        } catch (e) {
            console.error(e);
            toast.error("Resource link failed. Check downlink.", { id: loadingToast });
        }
    };

    const handleDeleteResource = async (type, id) => {
        if (!window.confirm("Permanent erasure. Are you sure?")) return;
        const loadingToast = toast.loading("Executing data purge...");
        try {
            if (type === 'driver') await deleteDoc(doc(db, "users", id));
            else await deleteDoc(doc(db, "fleet", id));
            toast.success("Node deleted", { id: loadingToast });
        } catch (e) {
            toast.error("Purge aborted", { id: loadingToast });
        }
    };

    if (!userProfile) return (
        <div className="min-h-screen bg-[#F4F2EE] flex flex-col items-center justify-center p-6 text-slate-400">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest">Bridging Cloud Node...</p>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#F4F2EE] text-[#1A1A1A] font-sans antialiased overflow-x-hidden">
            <HaulerSidebar activeTab={activeTab} setActiveTab={setActiveTab} userProfile={userProfile} onLogout={() => setShowLogoutModal(true)} />

            <main className={`flex-1 md:ml-24 max-w-[1600px] mx-auto px-8 md:px-12 py-8 md:py-12 space-y-6 md:space-y-10 pb-32 md:pb-12 min-w-0`}>
                <HaulerHeader activeTab={activeTab} userProfile={userProfile} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onLogout={() => setShowLogoutModal(true)} />

                <div className="space-y-10">
                    {activeTab === 'dashboard' && (
                        <HomeView
                            activeMissions={activeMissions}
                            completedMissions={completedMissions}
                            totalFleetTonnage={totalFleetTonnage}
                        />
                    )}

                    {activeTab === 'board' && (
                        <MarketplaceView
                            filteredAvailableJobs={filteredAvailableJobs}
                            marketplaceFilter={marketplaceFilter}
                            setMarketplaceFilter={setMarketplaceFilter}
                            priceSort={priceSort}
                            setPriceSort={setPriceSort}
                            userProfile={userProfile}
                            handleJobAction={handleJobAction}
                            isDispatcher={isDispatcher}
                            isDriver={isDriver}
                        />
                    )}

                    {activeTab === 'fleet' && (
                        <FleetView
                            drivers={orgDrivers}
                            trucks={fleetAssets}
                            onAddDriver={() => setShowResourceModal({ type: 'driver', mode: 'create' })}
                            onEditDriver={(d) => setShowResourceModal({ type: 'driver', mode: 'edit', data: d })}
                            onDeleteDriver={(id) => handleDeleteResource('driver', id)}
                            onAddTruck={() => setShowResourceModal({ type: 'truck', mode: 'create' })}
                            onEditTruck={(t) => setShowResourceModal({ type: 'truck', mode: 'edit', data: t })}
                            onDeleteTruck={(id) => handleDeleteResource('truck', id)}
                        />
                    )}

                    {activeTab === 'active' && (
                        <ActiveOpsView
                            missions={activeMissions}
                            userProfile={userProfile}
                            onAction={handleJobAction}
                            isDispatcher={isDispatcher}
                            isDriver={isDriver}
                        />
                    )}

                    {activeTab === 'history' && (
                        <ArchivesView missions={completedMissions} />
                    )}

                    {activeTab === 'settings' && (
                        <SettingsView userProfile={userProfile} />
                    )}

                    {activeTab === 'wallet' && (
                        <WalletView myJobs={myJobs} />
                    )}
                </div>
            </main>

            {/* Modals */}
            {showAssignModal && (
                <AssignmentModal
                    job={showAssignModal}
                    drivers={orgDrivers}
                    assets={fleetAssets}
                    onClose={() => setShowAssignModal(null)}
                    onConfirm={(driverId, driverName, truckReg) => handleJobAction(showAssignModal, 'assign_confirm', { driverId, driverName, truckReg })}
                />
            )}

            {showPODModal && (
                <ProofOfDelivery
                    job={showPODModal}
                    onClose={() => setShowPODModal(null)}
                    onSuccess={() => { setShowPODModal(null); toast.success("Mission verified."); }}
                />
            )}

            {showResourceModal && (
                <ResourceModal
                    type={showResourceModal.type}
                    mode={showResourceModal.mode}
                    data={showResourceModal.data}
                    onClose={() => setShowResourceModal(null)}
                    onConfirm={(data) => handleManageResource(showResourceModal.type, showResourceModal.mode, data)}
                />
            )}

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={() => auth.signOut()}
            />
        </div>
    );
};

export default HaulerDashboard;
