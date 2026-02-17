import React from 'react';
import { Package, Truck, ArrowRight } from 'lucide-react';

const RoleSelection = ({ onSelectRole }) => {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-4xl space-y-12">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-[#121926] uppercase tracking-tighter">Define Your Identity</h2>
                    <p className="text-slate-500 font-medium">Select your primary operation mode to initialize the OS</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Supplier Option */}
                    <button
                        onClick={() => onSelectRole('supplier')}
                        className="group relative p-10 bg-slate-50 border border-slate-100 rounded-[3rem] text-left hover:bg-white hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500"
                    >
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
                            <Package className="w-8 h-8 text-slate-400 group-hover:text-orange-600" />
                        </div>
                        <h3 className="text-2xl font-black text-[#121926] uppercase tracking-tighter mb-2">I have cargo to move</h3>
                        <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                            For manufacturers, mine managers, and trade suppliers requiring secure transport logistics.
                        </p>
                        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">
                            Initialize Supplier OS <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                        </div>
                    </button>

                    {/* Hauler Option */}
                    <button
                        onClick={() => onSelectRole('hauler')}
                        className="group relative p-10 bg-slate-50 border border-slate-100 rounded-[3rem] text-left hover:bg-white hover:border-[#121926] hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500"
                    >
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
                            <Truck className="w-8 h-8 text-slate-400 group-hover:text-slate-900" />
                        </div>
                        <h3 className="text-2xl font-black text-[#121926] uppercase tracking-tighter mb-2">I have trucks to fill</h3>
                        <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                            For fleet owners, transporters, and independent drivers seeking high-pay cargo missions.
                        </p>
                        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                            Initialize Hauler OS <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                        </div>
                    </button>
                </div>

                <div className="pt-8 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity Protocol v1.0.4</p>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
