import React, { useState } from 'react';
import { Camera, Building2, User, Mail, Phone, Lock, Bell, Shield, MapPin, Save, BadgeCheck, Smartphone, FileText, Globe, Trash2, X, Plus } from 'lucide-react';
import { db, auth } from '../../firebaseConfig';
import { doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const SettingsSection = ({ title, description, children }) => (
    <div className="bg-white rounded-3xl md:rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">{description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
        </div>
    </div>
);

const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", disabled = false }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors`}>
                <Icon size={18} />
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-orange-500 focus:bg-white transition-all font-medium text-slate-700 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
        </div>
    </div>
);

const HubsManager = ({ user, savedLocations }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [newLoc, setNewLoc] = useState({ label: '', address: '', coords: null });

    const handleAdd = async () => {
        if (!newLoc.label || !newLoc.address) {
            toast.error("Hub label and address required.");
            return;
        }
        const loadingToast = toast.loading("Indexing hub...");
        try {
            await updateDoc(doc(db, "users", user.uid), {
                savedLocations: arrayUnion({ ...newLoc, id: Date.now().toString() })
            });
            setShowAdd(false);
            setNewLoc({ label: '', address: '', coords: null });
            toast.success("Strategic Hub Linked", { id: loadingToast });
        } catch (e) {
            toast.error("Hub indexing failed.", { id: loadingToast });
        }
    };

    const handleDelete = async (loc) => {
        if (!window.confirm("Terminate link to this logistics hub?")) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                savedLocations: arrayRemove(loc)
            });
            toast.success("Hub Link Terminated");
        } catch (e) { toast.error("Update failed."); }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Saved Hub Nodes</h3>
                    <p className="text-sm font-medium text-slate-400 mt-1">Pre-validated terminals for expedited deployment.</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 hover:scale-110 active:scale-95 transition-all"
                >
                    {showAdd ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </button>
            </div>

            {showAdd && (
                <div className="bg-slate-50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 space-y-6 animate-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Hub Label" icon={MapPin} placeholder="Site Alpha / HQ Yard" value={newLoc.label} onChange={e => setNewLoc({ ...newLoc, label: e.target.value })} />
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grid Location</label>
                            <input
                                className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 px-4 outline-none focus:border-orange-500 transition-all font-medium text-slate-700"
                                placeholder="Identify Terminal..."
                                value={newLoc.address}
                                onChange={e => setNewLoc({ ...newLoc, address: e.target.value })}
                            />
                        </div>
                    </div>
                    <button onClick={handleAdd} className="w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-lg shadow-slate-200">Index Terminal Node</button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {savedLocations?.length > 0 ? savedLocations.map(loc => (
                    <div key={loc.id} className="p-4 md:p-6 bg-white border border-slate-100 rounded-xl md:rounded-2xl flex items-center justify-between group hover:border-orange-500 transition-all duration-300 shadow-sm">
                        <div className="flex items-center space-x-6">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-orange-500 shadow-sm transition-all">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">{loc.label}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 truncate max-w-[200px] opacity-60 italic">{loc.address}</p>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(loc)} className="p-3 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )) : (
                    <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-40">Zero Logistics Hubs Indexed</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SettingsView = ({ userProfile }) => {
    const [subTab, setSubTab] = useState('business');
    const [formData, setFormData] = useState({
        companyName: userProfile?.universal?.displayName || '',
        legalName: userProfile?.legalName || '',
        jobTitle: userProfile?.jobTitle || '',
        phoneNumber: userProfile?.phoneNumber || '',
        industry: userProfile?.industry || 'Mining',
        taxId: userProfile?.taxId || '',
    });

    const [notifications, setNotifications] = useState(userProfile?.notifications || {
        matches: true,
        transit: true,
        delivery: true
    });

    const [saving, setSaving] = useState(false);

    const handleUpdate = async () => {
        // Validation check
        if (!formData.companyName || !formData.legalName || !formData.phoneNumber) {
            return toast.error("Security Requirement: Business identity details cannot be blank.");
        }

        setSaving(true);
        const loadingToast = toast.loading("Syncing business intelligence...");
        try {
            const userRef = doc(db, "users", userProfile.uid);
            await updateDoc(userRef, {
                "universal.displayName": formData.companyName,
                ...formData,
                notifications,
                updatedAt: serverTimestamp()
            });
            toast.success("Enterprise Profile Updated", { id: loadingToast });
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Correction failed. Check Uplink.", { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const initials = userProfile?.universal?.displayName
        ? userProfile.universal.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : userProfile?.email?.charAt(0).toUpperCase() || '??';

    return (
        <div className="w-full space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Profile Hero */}
            <div className="flex items-center gap-8 bg-orange-50/50 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-orange-100/50 shadow-sm">
                <div className="relative group">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-900 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
                        {userProfile?.photoURL ? (
                            <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover rounded-3xl" />
                        ) : (
                            <span>{initials}</span>
                        )}
                        <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white border-4 border-white shadow-lg hover:scale-110 transition-transform active:scale-95 z-10">
                            <Camera size={18} />
                        </button>
                    </div>
                </div>
                <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
                        {userProfile?.universal?.displayName || 'Supplier Partner'}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><BadgeCheck size={16} className="text-orange-500" />SUPPLIER ENTITY</span>
                        <span className="hidden md:block w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center gap-1.5"><Mail size={16} />{userProfile?.email}</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div className="flex items-center space-x-2 md:space-x-4">
                    {[
                        { id: 'business', label: 'Business Identity', icon: Building2 },
                        { id: 'locations', label: 'Saved Locations', icon: MapPin },
                        { id: 'ops', label: 'Notifications', icon: Bell }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id)}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 md:px-6 py-3 rounded-xl transition-all ${subTab === tab.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'text-slate-400 hover:bg-slate-100'}`}
                        >
                            <tab.icon size={14} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 md:px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    <Save size={16} />
                    <span>{saving ? 'Syncing...' : 'Save Settings'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-10">
                    {subTab === 'business' && (
                        <div className="space-y-10 animate-in slide-in-from-left-4">
                            <SettingsSection title="Personnel Credentials" description="Managed account holder information.">
                                <InputField label="Full Legal Name" icon={User} value={formData.legalName} onChange={e => setFormData({ ...formData, legalName: e.target.value })} placeholder="First & Last Name" />
                                <InputField label="Job Title" icon={BadgeCheck} value={formData.jobTitle} onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} placeholder="e.g. Logistics Director" />
                                <div className="md:col-span-2">
                                    <InputField label="Verified Phone Number" icon={Smartphone} value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="+263..." />
                                </div>
                            </SettingsSection>

                            <SettingsSection title="Legal Business Entity" description="Update your business details and legal identification.">
                                <InputField label="Legal Company Name" icon={Building2} value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} placeholder="Pvt Ltd Entity Name" />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry Classification</label>
                                    <select
                                        value={formData.industry}
                                        onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                        className="w-full h-[52px] px-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-sm text-slate-700 appearance-none"
                                    >
                                        <option>Mining</option>
                                        <option>Construction</option>
                                        <option>Agriculture</option>
                                        <option>Retail</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <InputField label="Tax/VAT Registration Number" icon={FileText} value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })} placeholder="BP Number / VAT reg" />
                                </div>
                            </SettingsSection>
                        </div>
                    )}

                    {subTab === 'locations' && (
                        <div className="animate-in slide-in-from-left-4">
                            <HubsManager user={auth.currentUser} savedLocations={userProfile?.savedLocations || []} />
                        </div>
                    )}

                    {subTab === 'ops' && (
                        <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2rem] border border-slate-200 shadow-sm space-y-8 animate-in slide-in-from-left-4">
                            <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-100 pb-6">
                                <Bell className="w-5 h-5 text-orange-500" strokeWidth={3} />
                                <h3 className="text-sm font-black uppercase tracking-widest">Logistics Telemetry Alerts</h3>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { id: 'matches', label: 'New Driver Match', desc: 'Alert when a hauler accepts your manifest.' },
                                    { id: 'transit', label: 'Transit Updates', desc: 'Push notifications for loading and progress.' },
                                    { id: 'delivery', label: 'Proof of Delivery', desc: 'Instant notification when POD is uploaded.' }
                                ].map(notif => (
                                    <div key={notif.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-orange-500 transition-all">
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest group-hover:text-orange-600 transition-colors">{notif.label}</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">{notif.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleNotification(notif.id)}
                                            className={`shrink-0 w-12 h-6 rounded-full p-1 transition-all ${notifications[notif.id] ? 'bg-orange-500' : 'bg-slate-200'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${notifications[notif.id] ? 'translate-x-6' : ''}`}></div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Security Sidecard */}
                <div className="space-y-10">
                    <div className="bg-slate-900 rounded-3xl md:rounded-[2rem] p-8 text-white space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Security Uplink</h3>
                            <Lock size={20} className="text-orange-500" />
                        </div>
                        <p className="text-sm text-slate-400 font-medium">Ensure your enterprise node remains secure with periodic protocol updates.</p>
                        <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border border-white/5">
                            Rotate Access Key
                        </button>
                        <div className="pt-6 border-t border-white/10 space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-500">2FA Status</span>
                                <span className="text-green-500 flex items-center gap-1.5"><Shield size={12} /> ENCRYPTED</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-4 text-orange-600 bg-orange-50 p-4 rounded-2xl">
                            <Globe size={24} />
                            <div>
                                <h4 className="font-bold text-sm">Portal Visibility</h4>
                                <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">Network status</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Your business profile is currently visible to the global transporter network.</p>
                        <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            View Public Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
