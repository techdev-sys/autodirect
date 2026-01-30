import React from 'react';
import { Truck, MapPin, Calendar, FileText, Anchor } from 'lucide-react';

// A printable component for BOL
const BillOfLading = ({ job, onClose }) => {
    if (!job) return null;

    const print = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center overflow-y-auto print:bg-white print:static print:block">
            <div className="bg-white w-full max-w-4xl min-h-[100vh] sm:min-h-0 sm:h-auto sm:rounded-none shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:h-auto print:p-0">

                {/* No-Print Header */}
                <div className="bg-slate-800 text-white p-4 flex justify-between items-center print:hidden border-b border-slate-700">
                    <div>
                        <h2 className="font-bold text-lg">Bill Of Lading Preview</h2>
                        <p className="text-xs text-slate-400">Review details before printing.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white">Close</button>
                        <button onClick={print} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Print / Save PDF
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="p-8 sm:p-12 text-slate-900 print:text-black print:p-0">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-6">
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Bill Of Lading</h1>
                            <p className="text-sm font-bold">Document #: BOL-{job.id.slice(-6).toUpperCase()}</p>
                            <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-black text-slate-700">AutoDirect Logistics</h2>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Digital Freight Network</p>
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="border border-slate-300 p-4">
                            <h3 className="text-xs font-black uppercase text-slate-500 mb-2 border-b border-slate-200 pb-1">Shipper / Origin</h3>
                            <p className="font-bold text-lg mb-1">{job.supplierProfile?.universal?.displayName || "Shipper (Unknown)"}</p>
                            <p className="text-sm mb-2 max-w-[200px]">{job.departure}</p>
                            <div className="text-xs text-slate-500 space-y-0.5">
                                <p>Email: {job.supplierEmail || "N/A"}</p>
                            </div>
                        </div>
                        <div className="border border-slate-300 p-4">
                            <h3 className="text-xs font-black uppercase text-slate-500 mb-2 border-b border-slate-200 pb-1">Consignee / Destination</h3>
                            <p className="font-bold text-lg mb-1">{job.consigneeName || "Pending Consignee"}</p>
                            <p className="text-sm mb-2 max-w-[200px]">{job.destination}</p>
                            <div className="text-xs text-slate-500 space-y-0.5">
                                <p>Instructions: {job.deliveryInstructions || "Standard Delivery"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Carrier Info */}
                    <div className="mb-8 border border-slate-300 p-4 bg-slate-50 print:bg-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xs font-black uppercase text-slate-500 mb-2">Carrier Information</h3>
                                <p className="font-bold text-lg">{job.haulerProfile?.universal?.displayName || "Carrier Pending Assignment"}</p>
                                <p className="text-sm">Driver ID: {job.haulerId || "N/A"}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-xs font-black uppercase text-slate-500 mb-2">Transport Mode</h3>
                                <div className="flex items-center justify-end space-x-2">
                                    <Truck className="w-5 h-5" />
                                    <span className="font-bold">{job.fleetType}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cargo Details */}
                    <div className="mb-12">
                        <h3 className="text-sm font-black uppercase mb-2">Cargo Manifest</h3>
                        <table className="w-full border-collapse border border-slate-300 text-sm">
                            <thead className="bg-slate-100 print:bg-slate-200">
                                <tr>
                                    <th className="border border-slate-300 p-3 text-left w-16">Qty</th>
                                    <th className="border border-slate-300 p-3 text-left">Description of Goods</th>
                                    <th className="border border-slate-300 p-3 text-right w-32">Weight (Tons)</th>
                                    <th className="border border-slate-300 p-3 text-center w-24">Hazmat</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-slate-300 p-3 font-bold">1</td>
                                    <td className="border border-slate-300 p-3">
                                        <p className="font-bold">{job.goodsType}</p>
                                        <p className="text-xs text-slate-500 mt-1">Standard container/load configuration.</p>
                                    </td>
                                    <td className="border border-slate-300 p-3 text-right font-mono">{job.tonnage} T</td>
                                    <td className="border border-slate-300 p-3 text-center">No</td>
                                </tr>
                                {/* Spacer rows for print aesthetic */}
                                {[...Array(3)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="border border-slate-300 p-3">&nbsp;</td>
                                        <td className="border border-slate-300 p-3">&nbsp;</td>
                                        <td className="border border-slate-300 p-3">&nbsp;</td>
                                        <td className="border border-slate-300 p-3">&nbsp;</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Legal / Signatures */}
                    <div className="border-t-2 border-black pt-6">
                        <p className="text-[10px] text-justify text-slate-500 mb-8 uppercase leading-relaxed">
                            Received, subject to independently agreed rates, tariffs, and conditions of carrier, the property described above in apparent good order, except as noted.
                            Limit of liability is based on the weight of the shipment unless otherwise declared. The carrier shall not make delivery of this shipment without payment of freight and all other lawful charges.
                        </p>

                        <div className="grid grid-cols-3 gap-8 text-xs uppercase font-bold">
                            <div className="space-y-8">
                                <p>Shipper Signature / Date</p>
                                <div className="border-b border-black h-8"></div>
                            </div>
                            <div className="space-y-8">
                                <p>Carrier Signature / Pickup Date</p>
                                <div className="border-b border-black h-8"></div>
                            </div>
                            <div className="space-y-8">
                                <p>Consignee Signature / Delivery Date</p>
                                <div className="border-b border-black h-8"></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Print Styles Injection */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .fixed {
                        position: static !important;
                        background: white !important;
                    }
                    .fixed *, .fixed *::before, .fixed *::after {
                        visibility: visible;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:static {
                        position: static !important;
                    }
                    body {
                        background: white;
                    }
                }
            `}</style>
        </div>
    );
};

export default BillOfLading;
