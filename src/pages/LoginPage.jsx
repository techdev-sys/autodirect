import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebaseConfig';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ShieldCheck, Truck, Mail, Activity, Globe, Zap, ArrowRight, Lock, ChevronRight, User, Smartphone } from 'lucide-react';

const LiveTicker = () => {
    const messages = [
        "LIVE: 48 New Loads Available",
        "DISPATCH: Harare → Bulawayo Assigned",
        "NETWORK: Regional Coverage 100%",
        "SECURE: Instant Digital Payouts"
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % messages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2 rounded-full shadow-2xl shadow-slate-900/20 animate-in fade-in zoom-in duration-700 mx-auto w-fit mb-10 border border-white/10">
            <Zap className="w-3.5 h-3.5 text-primary fill-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {messages[index]}
            </span>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping ml-1"></div>
        </div>
    );
};

const LoginPage = () => {
    const [authMode, setAuthMode] = useState('options');
    const [isSignUp, setIsSignUp] = useState(false);

    // Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [error, setError] = useState('');

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isSignUp) {
                // Create User
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Update Profile
                await updateProfile(user, {
                    displayName: fullName,
                });

                // Save extended details to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    displayName: fullName,
                    email: email,
                    phoneNumber: phoneNumber,
                    createdAt: new Date().toISOString(),
                    role: 'user' // Default to user, selected later in WelcomePage
                });

            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-slate-900 selection:bg-primary/10">

            {/* Ambient Background - Premium & Dynamic */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-blue-100/30 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
            </div>

            {/* App Container */}
            <div className="w-full max-w-md relative z-10 flex flex-col items-center">

                {/* Header Section */}
                <div className="text-center mb-10 w-full">
                    <LiveTicker />

                    <div className="relative inline-block mb-8 shadow-premium rounded-[2.5rem] group cursor-pointer hover:scale-105 transition-all duration-700">
                        <div className="relative bg-white rounded-[2rem] w-28 h-28 flex items-center justify-center border border-slate-100 overflow-hidden shadow-inner">
                            <img src="/app-logo.png" alt="AutoDirect" className="w-full h-full object-cover p-2" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2 uppercase">
                        Auto<span className="text-primary tracking-[-0.05em]">Direct</span>
                    </h1>
                    <p className="text-slate-400 font-black text-[10px] tracking-[0.3em] uppercase opacity-80">
                        Logistics Operating System
                    </p>
                </div>

                {/* Main Action Card */}
                <div className="w-full bg-white/70 backdrop-blur-2xl border border-white rounded-[2.5rem] p-10 shadow-premium">

                    {/* Error Message */}
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 text-red-600 text-xs font-bold text-center rounded-2xl border border-red-100 animate-in shake duration-500">
                            <Activity className="w-4 h-4 inline mr-2" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95 shadow-sm group"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4 mr-4 group-hover:scale-110 transition-transform" />
                            <span className="tracking-wide text-sm whitespace-nowrap">Continue with Google</span>
                        </button>

                        {/* Divider */}
                        {authMode === 'options' && (
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
                                    <span className="bg-white px-4 text-slate-300 font-bold">Security Pass</span>
                                </div>
                            </div>
                        )}

                        {authMode === 'options' && (
                            <button
                                onClick={() => setAuthMode('email')}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-95 flex items-center justify-center group"
                            >
                                <Mail className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
                                <span className="text-sm">Access with Email</span>
                            </button>
                        )}

                        {/* Email Form */}
                        {authMode === 'email' && (
                            <form onSubmit={handleEmailAuth} className="space-y-5 animate-in slide-in-from-bottom-6 fade-in duration-500">
                                <div className="space-y-3">
                                    {isSignUp && (
                                        <>
                                            <div className="group relative">
                                                <User className="absolute left-5 top-5 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="w-full pl-12 pr-5 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl text-black placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm"
                                                    required
                                                />
                                            </div>
                                            <div className="group relative">
                                                <Smartphone className="absolute left-5 top-5 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="tel"
                                                    placeholder="Phone Number"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    className="w-full pl-12 pr-5 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl text-black placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="group relative">
                                        <Mail className="absolute left-5 top-5 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-5 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl text-black placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="group relative">
                                        <Lock className="absolute left-5 top-5 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-5 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl text-black placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-primary-hover hover:-translate-y-1 active:scale-95 flex items-center justify-center group transition-all"
                                >
                                    <span>{isSignUp ? 'Create Corporate ID' : 'Authorize Access'}</span>
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <div className="flex items-center justify-between pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setAuthMode('options')}
                                        className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors"
                                    >
                                        <ChevronRight className="w-3 h-3 inline rotate-180 mr-1" />
                                        Methods
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsSignUp(!isSignUp)}
                                        className="text-primary text-[10px] font-black uppercase tracking-[0.2em] bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-all border border-primary/10"
                                    >
                                        {isSignUp ? 'Log In Instead' : 'Register New ID'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Bottom Trust Pills */}
                <div className="mt-12 flex items-center justify-center space-x-6">
                    <div className="flex items-center px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm opacity-60 hover:opacity-100 transition-opacity cursor-default">
                        <ShieldCheck className="w-3 h-3 text-primary mr-2" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ISO 27001 Secure</span>
                    </div>
                    <div className="flex items-center px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm opacity-60 hover:opacity-100 transition-opacity cursor-default">
                        <Globe className="w-3 h-3 text-primary mr-2" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Regional Network</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
