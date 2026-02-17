import React, { useState } from 'react';
import { Camera, Building2, User, Mail, Phone, Lock, Bell, Shield, MapPin, Save } from 'lucide-react';
import { db, auth } from '../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const SettingsSection = ({ title, description, children }) => (
    <div className="card-premium-light p-8 space-y-6">
        <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">{description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
        </div>
    </div>
);

const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", disabled = false }) => (
    <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
        <div className="relative group">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors`}>
                <Icon size={18} />
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-600 transition-all font-medium text-slate-700 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
        </div>
    </div>
);

const SettingsView = ({ userProfile }) => {
    const [formData, setFormData] = useState({
        organizationName: userProfile?.organizationName || '',
        organizationReg: userProfile?.organizationReg || '',
        organizationAddress: userProfile?.organizationAddress || '',
        fullName: userProfile?.fullName || '',
        email: userProfile?.email || '',
        phone: userProfile?.phone || '',
    });

    const [saving, setSaving] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleUpdate = async () => {
        // Validation check
        if (!formData.organizationName || !formData.organizationAddress || !formData.fullName || !formData.phone) {
            return toast.error("Operational Protocol: Essential profile fields cannot be left blank.");
        }

        setSaving(true);
        const loadingToast = toast.loading("Saving changes...");
        try {
            const userRef = doc(db, "users", userProfile.uid);
            await updateDoc(userRef, {
                ...formData,
                updatedAt: new Date()
            });
            toast.success("Profile updated successfully!", { id: loadingToast });
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update profile.", { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // In a real app, upload to Firebase Storage and get URL
        // Here we'll simulate with a URL creation and update Firestore
        const loadingToast = toast.loading("Updating photo...");
        try {
            // Local preview for immediate feedback
            const localUrl = URL.createObjectURL(file);

            const userRef = doc(db, "users", userProfile.uid);
            await updateDoc(userRef, {
                photoURL: localUrl, // In reality, this would be the storage public URL
                updatedAt: new Date()
            });

            toast.success("Photo updated!", { id: loadingToast });
        } catch (error) {
            toast.error("Failed to upload photo.", { id: loadingToast });
        }
    };

    const [notifications, setNotifications] = useState({
        jobAlerts: userProfile?.notifications?.jobAlerts ?? true,
        paymentAlerts: userProfile?.notifications?.paymentAlerts ?? true,
        missionUpdates: userProfile?.notifications?.missionUpdates ?? false,
    });

    const toggleNotification = async (key) => {
        const newValue = !notifications[key];
        setNotifications(prev => ({ ...prev, [key]: newValue }));

        try {
            const userRef = doc(db, "users", userProfile.uid);
            await updateDoc(userRef, {
                [`notifications.${key}`]: newValue
            });
        } catch (error) {
            console.error("Failed to update preference:", error);
            // Optionally revert UI state if DB update fails
        }
    };

    const initials = userProfile?.organizationName
        ? userProfile.organizationName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : userProfile?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

    return (
        <div className="w-full space-y-10 animate-fade-in pb-20 overflow-hidden">
            {/* hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            {/* Profile Hero */}
            <div className="flex items-center gap-8 card-premium-tint p-10 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-100/50 ring-1 ring-blue-50/50">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-[#1A1A1A] flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white transition-all group-hover:shadow-blue-500/20">
                        {userProfile?.photoURL ? (
                            <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover rounded-3xl" />
                        ) : (
                            <span>{initials}</span>
                        )}
                        <button
                            onClick={handlePhotoClick}
                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white border-4 border-white shadow-lg hover:scale-110 transition-transform active:scale-95 z-10"
                        >
                            <Camera size={18} />
                        </button>
                    </div>
                </div>
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">{userProfile?.organizationName || userProfile?.fullName}</h2>
                    <div className="flex items-center gap-4 text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5"><Building2 size={16} />{userProfile?.role?.toUpperCase()}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center gap-1.5"><MapPin size={16} />{userProfile?.organizationAddress || 'No address set'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-10">
                    <SettingsSection
                        title="Company Information"
                        description="Update your business details and legal identification."
                    >
                        <InputField
                            label="Organization Name"
                            icon={Building2}
                            value={formData.organizationName}
                            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                            placeholder="e.g. Acme Logistics"
                        />
                        <InputField
                            label="Registration Number"
                            icon={Shield}
                            value={formData.organizationReg}
                            onChange={(e) => setFormData({ ...formData, organizationReg: e.target.value })}
                            placeholder="e.g. REG-123456"
                        />
                        <div className="md:col-span-2">
                            <InputField
                                label="Business Address"
                                icon={MapPin}
                                value={formData.organizationAddress}
                                onChange={(e) => setFormData({ ...formData, organizationAddress: e.target.value })}
                                placeholder="e.g. 123 Transport Way, Sandton"
                            />
                        </div>
                    </SettingsSection>

                    <SettingsSection
                        title="Personal Details"
                        description="Managed account holder information."
                    >
                        <InputField
                            label="Full Name"
                            icon={User}
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="e.g. John Doe"
                        />
                        <InputField
                            label="Email Address"
                            icon={Mail}
                            value={formData.email}
                            disabled
                            placeholder="john@example.com"
                        />
                        <InputField
                            label="Phone Number"
                            icon={Phone}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="e.g. +27 123 4567"
                        />
                    </SettingsSection>

                    <div className="flex justify-end gap-4">
                        <button className="px-8 py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold flex items-center gap-3 btn-interact disabled:opacity-50" onClick={handleUpdate} disabled={saving}>
                            <Save size={20} />
                            {saving ? "Saving Changes..." : "Save Settings"}
                        </button>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="card-premium-light p-8 space-y-6">
                        <div className="flex items-center gap-4 text-blue-600 bg-blue-50 p-4 rounded-2xl">
                            <Bell size={24} />
                            <div>
                                <h4 className="font-bold text-sm">Notifications</h4>
                                <p className="text-xs font-semibold opacity-70">Control your alerts</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'New Job Alerts', active: notifications.jobAlerts, key: 'jobAlerts' },
                                { label: 'Payment Notifications', active: notifications.paymentAlerts, key: 'paymentAlerts' },
                                { label: 'Mission Updates', active: notifications.missionUpdates, key: 'missionUpdates' },
                            ].map((pref, i) => (
                                <div key={i} className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0">
                                    <span className="text-sm font-bold text-slate-600">{pref.label}</span>
                                    <button
                                        onClick={() => toggleNotification(pref.key)}
                                        className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20 ${pref.active ? 'bg-blue-600' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${pref.active ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card-premium-dark p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Security</h3>
                            <Lock size={20} className="text-blue-400" />
                        </div>
                        <p className="text-sm text-white/60">Ensure your account remains secure with periodic security checks.</p>
                        <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm transition-all border border-white/5">
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
