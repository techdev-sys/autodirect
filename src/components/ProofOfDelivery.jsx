import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { db } from '../firebaseConfig';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { MapPin, AlertTriangle, PenTool, Camera, CheckCircle, X, Loader2, ArrowRight, SkipForward } from 'lucide-react';
import { getCoordinates } from '../utils/locationUtils';

// Helper: Haversine Distance in meters
const getDistanceFromLatLonInM = (lat1, lon1, lat2, lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000; // Meters
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

const ProofOfDelivery = ({ job, onClose, onSuccess }) => {
    const [step, setStep] = useState('validating'); // validating, warning, signature, photo, submitting
    const [locationData, setLocationData] = useState(null);
    const [distance, setDistance] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [photo, setPhoto] = useState(null);
    const sigCanvas = useRef({});
    const [containerWidth, setContainerWidth] = useState(300);

    // Responsive Canvas
    const containerRef = useRef(null);
    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    }, [step]);

    // Step 1: Geolocation
    useEffect(() => {
        if (step === 'validating') {
            if (!navigator.geolocation) {
                setLocationError("Geolocation is not supported by this browser.");
                setStep('warning');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const currentLat = position.coords.latitude;
                    const currentLng = position.coords.longitude;
                    setLocationData({ lat: currentLat, lng: currentLng });

                    // Compare with job destination
                    let destCoords = getCoordinates(job.destination);
                    // If getCoordinates returns default (Harare) but destination isn't harare, relying on hash logic in utility.
                    // This is sufficient for demo/mock logic.

                    if (destCoords) {
                        const dist = getDistanceFromLatLonInM(currentLat, currentLng, destCoords[0], destCoords[1]);
                        setDistance(dist);

                        // Wait a sec for UX
                        setTimeout(() => {
                            if (dist > 500) {
                                setStep('warning');
                            } else {
                                setStep('signature');
                            }
                        }, 1000);
                    } else {
                        setLocationError("Could not resolve destination coordinates.");
                        setStep('warning');
                    }
                },
                (error) => {
                    setLocationError("Unable to retrieve your location. Ensure GPS is enabled.");
                    setStep('warning');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
    }, [step, job.destination]);

    const handleSignatureClear = () => sigCanvas.current.clear();

    const handleSignatureSubmit = () => {
        if (sigCanvas.current.isEmpty()) {
            // Optional: Shake animation or alert
            return;
        }
        setStep('photo');
    };

    const handlePhotoChange = (e) => {
        if (e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        setStep('submitting');
        try {
            const signatureData = sigCanvas.current ? sigCanvas.current.toDataURL() : null; // This might be stale if step changed?
            // Wait, ref persists across re-renders but we need to capture it before unmounting step?
            // Actually, if we are in 'photo' step, the SignatureCanvas is likely unmounted if we conditionally render it.
            // WE MUST STATE THE SIGNATURE IMAGE BEFORE MOVING STEPS.
        } catch (e) {
            console.error(e);
        }
    };

    // We need to store signature before moving to photo step.
    const [finalSignature, setFinalSignature] = useState(null);

    const saveSignatureAndNext = () => {
        if (sigCanvas.current.isEmpty()) return;
        setFinalSignature(sigCanvas.current.toDataURL());
        setStep('photo');
    };

    const finalSubmit = async () => {
        setStep('submitting');
        try {
            // Using writeBatch allows for atomic writes that also work offline (persistence queue)
            const batch = writeBatch(db);

            const jobRef = doc(db, "transportJobs", job.id);
            // Updating status to delivered
            batch.update(jobRef, { status: "delivered", completedAt: serverTimestamp() });

            // Creating the proof document in subcollection
            const proofRef = doc(db, "transportJobs", job.id, "delivery_proof", "final");
            batch.set(proofRef, {
                timestamp: serverTimestamp(),
                geolocation: locationData,
                distance_deviation: distance,
                signature: finalSignature,
                photo: photo || null,
                photo_skipped: !photo
            });

            await batch.commit();

            onSuccess();
        } catch (e) {
            console.error("Submission failed: ", e);
            alert("Failed to submit proof. Try again.");
            setStep('photo');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-primary w-full max-w-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden text-white flex flex-col">

                {/* Header */}
                <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-sm font-black text-secondary uppercase tracking-widest">Digital ePOD</h2>
                        <p className="text-[10px] text-slate-400">Order #{job.id ? job.id.slice(-6) : '...'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">

                    {step === 'validating' && (
                        <div className="text-center space-y-4">
                            <div className="relative">
                                <MapPin className="w-12 h-12 text-secondary animate-bounce mx-auto" />
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-secondary/30 rounded-full blur-sm animate-pulse"></div>
                            </div>
                            <h3 className="text-xl font-bold">Verifying Location</h3>
                            <p className="text-xs text-slate-400">Matching GPS with Delivery Point...</p>
                        </div>
                    )}

                    {step === 'warning' && (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white">Location Mismatch</h3>
                                <p className="text-xs text-slate-400 leading-relaxed max-w-[250px] mx-auto">
                                    You are <span className="text-white font-bold">{Math.round(distance)}m</span> away from the destination. Standard limit is 500m.
                                </p>
                            </div>
                            {locationError && <p className="text-[10px] text-red-400">{locationError}</p>}

                            <button
                                onClick={() => setStep('signature')}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors mt-4"
                            >
                                Override & Continue
                            </button>
                        </div>
                    )}

                    {step === 'signature' && (
                        <div className="w-full space-y-4" ref={containerRef}>
                            <div className="text-center space-y-1 mb-2">
                                <h3 className="text-lg font-bold">Receiver Signature</h3>
                                <p className="text-xs text-slate-400">Please sign below to confirm receipt</p>
                            </div>

                            <div className="bg-white rounded-xl overflow-hidden border-2 border-slate-600">
                                <SignatureCanvas
                                    ref={sigCanvas}
                                    penColor="black"
                                    canvasProps={{
                                        width: containerWidth || 300,
                                        height: 200,
                                        className: 'sigCanvas'
                                    }}
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleSignatureClear}
                                    className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={saveSignatureAndNext}
                                    className="flex-[2] py-3 bg-secondary text-primary font-black rounded-xl text-xs hover:bg-yellow-400 transition-colors flex items-center justify-center"
                                >
                                    Confirm Signature <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'photo' && (
                        <div className="w-full space-y-4">
                            <div className="text-center space-y-1 mb-2">
                                <h3 className="text-lg font-bold">Proof of Cargo</h3>
                                <p className="text-xs text-slate-400">Optional: Take a photo of the offloaded goods</p>
                            </div>

                            <div className="relative w-full aspect-video bg-slate-800 rounded-xl border border-dashed border-slate-600 flex flex-col items-center justify-center overflow-hidden group hover:border-secondary/50 transition-colors cursor-pointer">
                                {photo ? (
                                    <img src={photo} alt="Cargo Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Camera className="w-8 h-8 text-slate-500 mb-2 group-hover:text-secondary transition-colors" />
                                        <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300">Tap to Capture</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handlePhotoChange}
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={finalSubmit}
                                    className="w-full py-3 bg-secondary text-primary font-black rounded-xl text-sm hover:bg-yellow-400 transition-colors flex items-center justify-center shadow-lg shadow-yellow-500/20"
                                >
                                    {photo ? 'Submit Proof' : 'Skip & Complete Delivery'}
                                    {photo ? <CheckCircle className="w-4 h-4 ml-2" /> : <SkipForward className="w-4 h-4 ml-2" />}
                                </button>
                                {photo && (
                                    <button
                                        onClick={() => setPhoto(null)}
                                        className="w-full text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider"
                                    >
                                        Remove Photo
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'submitting' && (
                        <div className="text-center space-y-4">
                            <Loader2 className="w-10 h-10 text-secondary animate-spin mx-auto" />
                            <h3 className="text-lg font-bold">Finalizing Job...</h3>
                            <p className="text-xs text-slate-400">Securing blockchain-ready proof</p>
                        </div>
                    )}
                </div>

                {/* Stepper Dots */}
                <div className="p-4 bg-slate-800 flex justify-center space-x-2">
                    {['validating', 'signature', 'photo'].map((s, i) => (
                        <div
                            key={s}
                            className={`w-2 h-2 rounded-full transition-colors ${['validating', 'warning'].includes(step) && i === 0 ? 'bg-secondary' :
                                step === 'signature' && i === 1 ? 'bg-secondary' :
                                    step === 'photo' && i === 2 ? 'bg-secondary' :
                                        step === 'submitting' ? 'bg-green-500' :
                                            'bg-slate-600'
                                }`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProofOfDelivery;
