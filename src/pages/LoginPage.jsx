import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebaseConfig';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Smartphone, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Auth sub-modes
    const [showPhone, setShowPhone] = useState(false);

    // Form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);

    useEffect(() => {
        if (showPhone && !window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible'
            });
        }
    }, [showPhone]);

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                toast.success("Account created!");
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success("Welcome back!");
            }
        } catch (err) {
            console.error(err);
            setError(err.code === 'auth/user-not-found' ? 'No account found' :
                err.code === 'auth/wrong-password' ? 'Incorrect password' : err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(confirmation);
            toast.success("Verification code sent!");
        } catch (err) {
            setError("Failed to send code. Ensure number format is +263...");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await confirmationResult.confirm(verificationCode);
            toast.success("Phone verified!");
        } catch (err) {
            setError("Invalid verification code");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            toast.success("Signed in with Google");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white bg-grid-slate flex flex-col items-center justify-center p-6 relative font-sans">
            <div id="recaptcha-container"></div>

            {/* Main Unified Card */}
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl relative z-10">

                {/* Branding */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                        <div className="w-6 h-6 bg-orange-500 rounded-sm"></div>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">AutoDirect</h1>
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 mt-2">Logistics Operating System</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Combined Auth Section */}
                {!showPhone ? (
                    <div className="space-y-6">
                        {/* Tabs for Email Mode */}
                        <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100">
                            <button
                                onClick={() => setIsSignUp(false)}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400'}`}
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => setIsSignUp(true)}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${isSignUp ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400'}`}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-slate-900 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-slate-900 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{isSignUp ? 'Create Corporate Account' : 'Access Dashboard'}</span>}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Phone Auth Flow */}
                        {!confirmationResult ? (
                            <form onSubmit={handlePhoneSignIn} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Phone Number</label>
                                    <div className="relative group">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                        <input
                                            type="tel"
                                            placeholder="+263 77 123 4567"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-slate-900 transition-all"
                                            required
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-2 font-medium">Identity code will be sent via encrypted SMS.</p>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowPhone(false)}
                                        className="flex-1 py-4 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Send Code</span>}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyCode} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verification Code</label>
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-slate-900 text-center tracking-[0.5em] font-black"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 shadow-xl shadow-green-500/20"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Verify Account</span>}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Social Below Form (Always Visible if not in verify step) */}
                {(!confirmationResult || !showPhone) && (
                    <>
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center px-10">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <span className="relative bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest block mx-auto w-fit">External Identity</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleGoogleLogin}
                                className="flex items-center justify-center space-x-2 py-3.5 bg-black text-white rounded-2xl hover:bg-slate-900 active:scale-95 transition-all"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 1.56-1.56 2.73-3.21 2.73-2.1 0-3.81-1.71-3.81-3.81s1.71-3.81 3.81-3.81c.84 0 1.65.3 2.28.81l2.13-2.13C18.66 6.54 16.5 5.4 14.18 5.4c-4.41 0-8 3.59-8 8s3.59 8 8 8c4.59 0 7.83-3.03 7.83-7.83 0-.48-.06-.93-.15-1.37z" />
                                </svg>
                                <span className="text-xs font-bold">Google</span>
                            </button>
                            <button
                                onClick={() => setShowPhone(true)}
                                className="flex items-center justify-center space-x-2 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all"
                            >
                                <Smartphone className="w-4 h-4" />
                                <span className="text-xs font-bold">Phone</span>
                            </button>
                        </div>
                    </>
                )}

                <div className="mt-10 text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                        Powered By TechDevs
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
