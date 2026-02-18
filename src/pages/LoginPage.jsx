import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebaseConfig';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Smartphone, Mail, Lock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LoginPage = ({ defaultMode = 'signup', onBack }) => {
    const [isSignUp, setIsSignUp] = useState(defaultMode !== 'login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPhone, setShowPhone] = useState(false);

    // Form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Read role hint from sessionStorage to theme the page
    const hintRole = sessionStorage.getItem('hintRole') || null;
    const isSupplier = hintRole === 'supplier';
    const isHauler = hintRole === 'hauler';

    // Theme colours based on role hint
    const accent = isHauler ? '#2563EB' : '#F97316'; // blue for hauler, orange for supplier/default
    const accentHover = isHauler ? '#1d4ed8' : '#ea6700';
    const accentGlow = isHauler ? 'rgba(37,99,235,0.25)' : 'rgba(249,115,22,0.25)';
    const accentBg = isHauler ? 'rgba(37,99,235,0.08)' : 'rgba(249,115,22,0.08)';
    const accentBorder = isHauler ? 'rgba(37,99,235,0.35)' : 'rgba(249,115,22,0.35)';
    const roleLabel = isHauler ? 'Transporter' : isSupplier ? 'Supplier' : null;

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
                await createUserWithEmailAndPassword(auth, email, password);
                toast.success("Account created!");
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success("Welcome back!");
            }
        } catch (err) {
            console.error(err);
            setError(
                err.code === 'auth/user-not-found' ? 'No account found with this email.' :
                    err.code === 'auth/wrong-password' ? 'Incorrect password. Try again.' :
                        err.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' :
                            err.message
            );
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
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: "'Barlow Condensed', sans-serif",
            position: 'relative',
            overflow: 'hidden',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
            `}</style>

            <div id="recaptcha-container"></div>

            {/* Background glow based on role */}
            <div style={{
                position: 'absolute', top: '-200px', left: '-200px',
                width: '600px', height: '600px',
                background: `radial-gradient(circle, ${accentGlow} 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-200px', right: '-100px',
                width: '500px', height: '500px',
                background: `radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            {/* Grid overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `linear-gradient(${accentBorder.replace('0.35', '0.04')} 1px, transparent 1px), linear-gradient(90deg, ${accentBorder.replace('0.35', '0.04')} 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
                maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
                pointerEvents: 'none',
            }} />

            {/* Card */}
            <div style={{
                width: '100%',
                maxWidth: '440px',
                background: '#141414',
                border: `1px solid ${accentBorder}`,
                borderRadius: '28px',
                padding: '40px',
                position: 'relative',
                zIndex: 10,
                boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${accentBorder}`,
            }}>

                {/* Back button */}
                {onBack && (
                    <button
                        onClick={onBack}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#666', fontSize: '11px', fontWeight: 700,
                            letterSpacing: '0.15em', textTransform: 'uppercase',
                            marginBottom: '28px', padding: 0,
                            fontFamily: "'Barlow Condensed', sans-serif",
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f5f0e8'}
                        onMouseLeave={e => e.currentTarget.style.color = '#666'}
                    >
                        <ArrowLeft size={14} /> Back
                    </button>
                )}

                {/* Logo + Role badge */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{
                            width: '36px', height: '36px', background: '#000',
                            borderRadius: '10px', border: `2px solid ${accent}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <div style={{ width: '14px', height: '14px', background: accent, borderRadius: '4px' }} />
                        </div>
                        <span style={{
                            fontSize: '20px', fontWeight: 900, letterSpacing: '0.08em',
                            textTransform: 'uppercase', color: '#f5f0e8',
                        }}>
                            Auto<span style={{ color: accent }}>Direct</span>
                        </span>
                    </div>

                    {roleLabel ? (
                        <div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: accentBg, border: `1px solid ${accentBorder}`,
                                borderRadius: '8px', padding: '6px 14px', marginBottom: '8px',
                            }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent }} />
                                <span style={{
                                    fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em',
                                    textTransform: 'uppercase', color: accent,
                                }}>
                                    {roleLabel} Account
                                </span>
                            </div>
                            <p style={{
                                fontFamily: "'Barlow', sans-serif",
                                fontSize: '14px', color: '#666', marginTop: '4px',
                            }}>
                                {isSignUp ? `Create your ${roleLabel.toLowerCase()} account to get started.` : 'Welcome back. Sign in to continue.'}
                            </p>
                        </div>
                    ) : (
                        <p style={{
                            fontFamily: "'Barlow', sans-serif",
                            fontSize: '14px', color: '#666',
                        }}>
                            {isSignUp ? 'Create your account to get started.' : 'Welcome back. Sign in to continue.'}
                        </p>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        marginBottom: '20px', padding: '12px 16px',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px',
                        color: '#f87171', fontSize: '13px', fontWeight: 600,
                        fontFamily: "'Barlow', sans-serif",
                    }}>
                        <AlertCircle size={14} style={{ flexShrink: 0 }} />
                        {error}
                    </div>
                )}

                {/* Login / Signup tabs */}
                {!showPhone && (
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{
                            display: 'flex', background: '#0a0a0a',
                            borderRadius: '12px', padding: '4px',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            {['Log In', 'Sign Up'].map((label, i) => {
                                const active = i === 0 ? !isSignUp : isSignUp;
                                return (
                                    <button
                                        key={label}
                                        onClick={() => setIsSignUp(i === 1)}
                                        style={{
                                            flex: 1, padding: '10px',
                                            borderRadius: '9px', border: 'none',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                            fontSize: '12px', fontWeight: 800,
                                            letterSpacing: '0.15em', textTransform: 'uppercase',
                                            fontFamily: "'Barlow Condensed', sans-serif",
                                            background: active ? accent : 'transparent',
                                            color: active ? '#fff' : '#555',
                                            boxShadow: active ? `0 4px 16px ${accentGlow}` : 'none',
                                        }}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Email / Phone forms */}
                {!showPhone ? (
                    <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Email field */}
                        <div>
                            <label style={{
                                display: 'block', marginBottom: '8px',
                                fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em',
                                textTransform: 'uppercase', color: '#555',
                            }}>Work Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} style={{
                                    position: 'absolute', left: '14px', top: '50%',
                                    transform: 'translateY(-50%)', color: '#555',
                                }} />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', padding: '14px 14px 14px 42px',
                                        background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px', color: '#f5f0e8',
                                        fontSize: '14px', fontFamily: "'Barlow', sans-serif",
                                        outline: 'none', boxSizing: 'border-box',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = accent}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label style={{
                                display: 'block', marginBottom: '8px',
                                fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em',
                                textTransform: 'uppercase', color: '#555',
                            }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} style={{
                                    position: 'absolute', left: '14px', top: '50%',
                                    transform: 'translateY(-50%)', color: '#555',
                                }} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', padding: '14px 14px 14px 42px',
                                        background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px', color: '#f5f0e8',
                                        fontSize: '14px', fontFamily: "'Barlow', sans-serif",
                                        outline: 'none', boxSizing: 'border-box',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = accent}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '15px',
                                background: loading ? '#333' : accent,
                                border: 'none', borderRadius: '12px',
                                color: '#fff', fontSize: '13px', fontWeight: 800,
                                letterSpacing: '0.15em', textTransform: 'uppercase',
                                fontFamily: "'Barlow Condensed', sans-serif",
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: loading ? 'none' : `0 8px 24px ${accentGlow}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                marginTop: '4px',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = accentHover; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = accent; }}
                        >
                            {loading
                                ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                : isSignUp ? 'Create Account →' : 'Access Dashboard →'
                            }
                        </button>
                    </form>
                ) : (
                    <div>
                        {!confirmationResult ? (
                            <form onSubmit={handlePhoneSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{
                                        display: 'block', marginBottom: '8px',
                                        fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em',
                                        textTransform: 'uppercase', color: '#555',
                                    }}>Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Smartphone size={15} style={{
                                            position: 'absolute', left: '14px', top: '50%',
                                            transform: 'translateY(-50%)', color: '#555',
                                        }} />
                                        <input
                                            type="tel"
                                            placeholder="+263 77 123 4567"
                                            value={phoneNumber}
                                            onChange={e => setPhoneNumber(e.target.value)}
                                            required
                                            style={{
                                                width: '100%', padding: '14px 14px 14px 42px',
                                                background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px', color: '#f5f0e8',
                                                fontSize: '14px', fontFamily: "'Barlow', sans-serif",
                                                outline: 'none', boxSizing: 'border-box',
                                            }}
                                        />
                                    </div>
                                    <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: '#555', marginTop: '6px' }}>
                                        Code will be sent via SMS. Format: +263...
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowPhone(false)}
                                        style={{
                                            flex: 1, padding: '14px',
                                            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px', color: '#666',
                                            fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em',
                                            textTransform: 'uppercase', cursor: 'pointer',
                                            fontFamily: "'Barlow Condensed', sans-serif",
                                        }}
                                    >Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            flex: 2, padding: '14px',
                                            background: accent, border: 'none',
                                            borderRadius: '12px', color: '#fff',
                                            fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em',
                                            textTransform: 'uppercase', cursor: 'pointer',
                                            fontFamily: "'Barlow Condensed', sans-serif",
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Send Code'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{
                                        display: 'block', marginBottom: '8px',
                                        fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em',
                                        textTransform: 'uppercase', color: '#555',
                                    }}>Verification Code</label>
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={verificationCode}
                                        onChange={e => setVerificationCode(e.target.value)}
                                        required
                                        style={{
                                            width: '100%', padding: '14px',
                                            background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px', color: '#f5f0e8',
                                            fontSize: '20px', fontFamily: "'Barlow Condensed', sans-serif",
                                            fontWeight: 900, letterSpacing: '0.5em',
                                            textAlign: 'center', outline: 'none', boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%', padding: '15px',
                                        background: '#16a34a', border: 'none', borderRadius: '12px',
                                        color: '#fff', fontSize: '13px', fontWeight: 800,
                                        letterSpacing: '0.15em', textTransform: 'uppercase',
                                        fontFamily: "'Barlow Condensed', sans-serif",
                                        cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Verify & Continue →'}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Divider + Social */}
                {(!confirmationResult || !showPhone) && (
                    <>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '16px',
                            margin: '24px 0',
                        }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                            <span style={{
                                fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em',
                                textTransform: 'uppercase', color: '#444',
                            }}>Or continue with</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {/* Google */}
                            <button
                                onClick={handleGoogleLogin}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '13px', background: '#fff', border: 'none',
                                    borderRadius: '12px', cursor: 'pointer',
                                    fontSize: '12px', fontWeight: 700,
                                    fontFamily: "'Barlow Condensed', sans-serif",
                                    color: '#111', transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M5.26 9.77A7.49 7.49 0 0 1 12 4.5c1.8 0 3.42.65 4.68 1.71L19.9 3C17.95 1.14 15.12 0 12 0 7.31 0 3.26 2.7 1.28 6.63l3.98 3.14z" />
                                    <path fill="#34A853" d="M16.04 18.01A7.46 7.46 0 0 1 12 19.5c-3.18 0-5.9-1.98-7.04-4.8l-3.97 3.07C3.18 21.24 7.27 24 12 24c3.06 0 5.96-1.1 8.12-3.01l-4.08-2.98z" />
                                    <path fill="#FBBC05" d="M4.96 14.7A7.5 7.5 0 0 1 4.5 12c0-.94.17-1.84.46-2.68L1 6.18A11.94 11.94 0 0 0 0 12c0 2.02.5 3.92 1.38 5.59l3.58-2.89z" />
                                    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l4.08 2.98c2.39-2.21 3.74-5.46 3.74-8.8z" />
                                </svg>
                                Google
                            </button>

                            {/* Phone */}
                            <button
                                onClick={() => setShowPhone(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '13px', background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '12px', cursor: 'pointer',
                                    fontSize: '12px', fontWeight: 700,
                                    fontFamily: "'Barlow Condensed', sans-serif",
                                    color: '#aaa', transition: 'border-color 0.2s, color 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = '#f5f0e8'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#aaa'; }}
                            >
                                <Smartphone size={15} />
                                Phone
                            </button>
                        </div>
                    </>
                )}

                {/* Footer */}
                <p style={{
                    marginTop: '28px', textAlign: 'center',
                    fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: '#333',
                }}>
                    Powered by TechDevs
                </p>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default LoginPage;
