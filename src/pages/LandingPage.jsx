import React from 'react';
import { Truck } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-between py-20 px-6 font-sans">
            {/* Logo Section */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-1000">
                <div className="w-24 h-24 bg-[#121926] rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-slate-200">
                    <Truck className="w-12 h-12 text-white" />
                </div>

                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-[#121926] tracking-tighter uppercase">
                        WELCOME TO AUTO DIRECT
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-slate-500 tracking-tight">
                        The Digital OS for Zimbabwe Logistics
                    </p>
                </div>
            </div>

            {/* Action Section */}
            <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-700 delay-300">
                <button
                    onClick={onGetStarted}
                    className="w-full h-16 bg-[#F97316] text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-orange-100 hover:bg-orange-600 hover:-translate-y-1 active:scale-95 transition-all"
                >
                    GET STARTED
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
