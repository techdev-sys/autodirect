import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { User, Truck, Building, Save, CheckCircle, Shield, AlertCircle, Camera, Upload, Briefcase, MapPin } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import InputGroup from '../components/InputGroup';
import { toast } from 'react-hot-toast';

const ProfilePage = ({ user, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('universal'); // universal, hauler, supplier
    const [previewRole, setPreviewRole] = useState('hauler'); // To toggle card preview

    // Schema structure mirroring the requirements
    const [profileData, setProfileData] = useState({
        universal: {
            displayName: user.displayName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            photoURL: user.photoURL || '',
            verified: false,
            rating: 5.0, // Default for new users
            reviewsCount: 0,
            memberSince: new Date().getFullYear()
        },
        hauler: {
            fleetType: 'Flatbed',
            maxTonnage: '',
            bedLength: '',
            equipmentTags: [],
            licenseStatus: 'Valid',
            insuranceStatus: true,
            onTimeRate: 100,
            totalDistance: 0,
            cancelRate: 0
        },
        supplier: {
            companyName: '',
            industry: 'General Logistics',
            paymentTerms: 'Net 30',
            isEscrowFunded: false,
            loadingHours: '08:00 - 17:00',
            facilities: []
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.uid) return;
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Merge existing data with structure to prevent undefined errors
                    setProfileData(prev => ({
                        universal: { ...prev.universal, ...data.universal },
                        hauler: { ...prev.hauler, ...data.hauler },
                        supplier: { ...prev.supplier, ...data.supplier }
                    }));
                    // Set preview based on saved role if available
                    if (data.role) setPreviewRole(data.role);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        const loadingToast = toast.loading("Updating your secure profile...");
        try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                role: previewRole,
                universal: profileData.universal,
                hauler: profileData.hauler,
                supplier: profileData.supplier,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            toast.success("Profile credentials synchronized!", { id: loadingToast });
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("Security synchronization failed. Try again.", { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    const updateField = (category, field, value) => {
        setProfileData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const toggleTag = (category, listName, tag) => {
        setProfileData(prev => {
            const currentList = prev[category][listName] || [];
            const newList = currentList.includes(tag)
                ? currentList.filter(t => t !== tag)
                : [...currentList, tag];
            return {
                ...prev,
                [category]: {
                    ...prev[category],
                    [listName]: newList
                }
            };
        });
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Profile...</div>;

    return (
        <div className="fixed inset-0 z-40 bg-slate-50 overflow-y-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-3">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <AlertCircle className="w-5 h-5 rotate-180" /> {/* Back Iconish */}
                    </button>
                    <h1 className="text-lg font-black uppercase text-slate-800 tracking-tight">Edit Profile</h1>
                </div>
                <button
                    onClick={async () => {
                        if (window.confirm("DEBUG: This will clear your Org ID and reset your account setup status. Reload?")) {
                            await updateDoc(doc(db, "users", user.uid), {
                                organizationId: null,
                                isCompanySetupComplete: false
                            });
                            window.location.reload();
                        }
                    }}
                    className="mr-2 px-3 py-2 bg-red-100 text-red-600 rounded-xl font-bold uppercase text-[10px] hover:bg-red-200 transition-colors"
                >
                    Reset Setup
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-primary text-white rounded-xl font-bold uppercase text-xs shadow-lg hover:bg-slate-800 transition-all flex items-center"
                >
                    {saving ? 'Saving...' : <>Save Changes <Save className="w-4 h-4 ml-2" /></>}
                </button>
            </div>

            <div className="max-w-5xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Editor */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Tabs */}
                    <div className="flex space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                        {['universal', 'hauler', 'supplier'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'bg-slate-100 text-primary shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {tab === 'universal' ? 'Identity & Base' : tab === 'hauler' ? 'Hauler Asset' : 'Supplier Biz'}
                            </button>
                        ))}
                    </div>

                    {/* Universal Form */}
                    {activeTab === 'universal' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-left-4">
                            <div className="flex items-center space-x-2 mb-4">
                                <User className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-lg text-slate-800">Identity Verification</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup
                                    label="Full Legal Name"
                                    icon={User}
                                    value={profileData.universal.displayName}
                                    onChange={v => updateField('universal', 'displayName', v)}
                                />
                                <InputGroup
                                    label="Phone Number"
                                    icon={Briefcase}
                                    value={profileData.universal.phoneNumber}
                                    onChange={v => updateField('universal', 'phoneNumber', v)}
                                />
                                <InputGroup
                                    label="Public Photo URL"
                                    icon={Camera}
                                    value={profileData.universal.photoURL}
                                    onChange={v => updateField('universal', 'photoURL', v)}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-700 uppercase">Verification Status</p>
                                        <p className="text-[10px] text-slate-500">Government ID & Face Match</p>
                                    </div>
                                    {profileData.universal.verified ? (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full border border-green-200 flex items-center">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Verified
                                        </span>
                                    ) : (
                                        <button className="px-3 py-1 bg-slate-200 text-slate-500 text-[10px] font-black uppercase rounded-full border border-slate-300 hover:bg-slate-300 transition-colors">
                                            Request Check
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hauler Form */}
                    {activeTab === 'hauler' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-left-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <Truck className="w-5 h-5 text-amber-500" />
                                    <h3 className="font-bold text-lg text-slate-800">Fleet & Equipment</h3>
                                </div>
                                <button onClick={() => setPreviewRole('hauler')} className="text-[10px] font-bold text-amber-600 uppercase hover:underline">Preview Card</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Vehicle Class</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary"
                                        value={profileData.hauler.fleetType}
                                        onChange={e => updateField('hauler', 'fleetType', e.target.value)}
                                    >
                                        {['Flatbed', 'Box Truck', 'Refrigerated', 'Tanker', 'Lowboy', 'Van'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <InputGroup label="Max Tonnage" icon={Briefcase} type="number" value={profileData.hauler.maxTonnage} onChange={v => updateField('hauler', 'maxTonnage', v)} />
                                <InputGroup label="Bed Length (Meters)" icon={Briefcase} type="number" value={profileData.hauler.bedLength} onChange={v => updateField('hauler', 'bedLength', v)} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Equipment Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Straps', 'Tarps', 'Chains', 'Liftgate', 'Pallet Jack', 'Ramps'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag('hauler', 'equipmentTags', tag)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${profileData.hauler.equipmentTags.includes(tag)
                                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Compliance Section */}
                            <div className="p-4 bg-slate-800 rounded-xl text-white space-y-4">
                                <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
                                    <Shield className="w-4 h-4 text-green-400" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider">Compliance Wallet</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold">Driver License</span>
                                        <span className="text-[10px] text-green-400 font-bold uppercase">{profileData.hauler.licenseStatus}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold">Cargo Insurance</span>
                                        <span className={`text-[10px] font-bold uppercase ${profileData.hauler.insuranceStatus ? 'text-green-400' : 'text-red-400'}`}>
                                            {profileData.hauler.insuranceStatus ? 'Active' : 'Missing'}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => toast("Vault access restricted. Enterprise credentials required.", { icon: '🔐' })} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center justify-center">
                                    <Upload className="w-3 h-3 mr-2" /> Manage Documents
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Supplier Form */}
                    {activeTab === 'supplier' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-left-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <Building className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-lg text-slate-800">Business Identity</h3>
                                </div>
                                <button onClick={() => setPreviewRole('supplier')} className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Preview Card</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup label="Company Name" icon={Building} value={profileData.supplier.companyName} onChange={v => updateField('supplier', 'companyName', v)} />
                                <InputGroup label="Industry Type" icon={Briefcase} value={profileData.supplier.industry} onChange={v => updateField('supplier', 'industry', v)} />
                                <InputGroup label="Loading Hours" icon={Briefcase} value={profileData.supplier.loadingHours} onChange={v => updateField('supplier', 'loadingHours', v)} />
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Payment Terms</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary"
                                        value={profileData.supplier.paymentTerms}
                                        onChange={e => updateField('supplier', 'paymentTerms', e.target.value)}
                                    >
                                        {['Instant (Escrow)', 'Net 7', 'Net 15', 'Net 30', 'COD'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Facility Amenities</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Forklift', 'Loading Dock', 'Overnight Parking', 'Restrooms', 'Crane', '24/7 Access'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag('supplier', 'facilities', tag)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${profileData.supplier.facilities.includes(tag)
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-blue-900 uppercase">Escrow Status</h4>
                                    <p className="text-[10px] text-blue-700 max-w-[200px]">Drivers prioritize 100% funded loads. Verify your payment method.</p>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={profileData.supplier.isEscrowFunded}
                                        onChange={e => updateField('supplier', 'isEscrowFunded', e.target.checked)}
                                        className="w-5 h-5 accent-blue-600"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Live Preview */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Live Preview</h4>
                            <div className="flex space-x-2">
                                <button onClick={() => setPreviewRole('hauler')} className={`w-3 h-3 rounded-full ${previewRole === 'hauler' ? 'bg-amber-500' : 'bg-slate-200'}`} title="Trucker View" />
                                <button onClick={() => setPreviewRole('supplier')} className={`w-3 h-3 rounded-full ${previewRole === 'supplier' ? 'bg-blue-600' : 'bg-slate-200'}`} title="Supplier View" />
                            </div>
                        </div>

                        <ProfileCard
                            profileData={profileData}
                            role={previewRole}
                            expanded={true}
                        />

                        <div className="pt-6 border-t border-slate-100">
                            <button
                                onClick={async () => {
                                    if (window.confirm("RESET SETUP: This will clear your organization and force you through onboarding. Continue?")) {
                                        const loadingToast = toast.loading("Clearing operational links...");
                                        try {
                                            const userRef = doc(db, "users", user.uid);
                                            await updateDoc(userRef, { organizationId: null, isCompanySetupComplete: false });
                                            toast.success("Identity Reset. Reloading...", { id: loadingToast });
                                            setTimeout(() => window.location.reload(), 1000);
                                        } catch (e) {
                                            toast.error("Wipe failed.");
                                        }
                                    }
                                }}
                                className="w-full py-2 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            >
                                Reset Operational Setup
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
