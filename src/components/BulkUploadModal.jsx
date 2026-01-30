import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const BulkUploadModal = ({ onClose, onUpload }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, parsing, uploading, success
    const [previewData, setPreviewData] = useState([]);
    const [errors, setErrors] = useState([]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file) => {
        setStatus('parsing');
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = text.split('\n');
            const parsed = [];
            const errs = [];

            // Simple CSV Parser (Assumes Header: Goods, Type, Pickup, Dropoff, Tons, Budget)
            rows.forEach((row, index) => {
                if (index === 0) return; // Skip header
                if (!row.trim()) return;

                const cols = row.split(',').map(c => c.trim());
                if (cols.length < 5) {
                    errs.push(`Row ${index + 1}: Insufficient columns`);
                    return;
                }

                parsed.push({
                    goodsType: cols[0],
                    fleetType: cols[1],
                    departure: cols[2],
                    destination: cols[3],
                    tonnage: cols[4],
                    budget: cols[5] || '0'
                });
            });

            setPreviewData(parsed);
            setErrors(errs);
            setStatus('idle');
        };
        reader.readAsText(file);
    };

    const handleUploadDefault = async () => {
        if (previewData.length === 0) return;
        setStatus('uploading');
        try {
            // Loop and upload
            // We'll pass the whole array to parent to handle batching if possible, or do it here
            await onUpload(previewData);
            setStatus('success');
            toast.success(`Successfully uploaded ${previewData.length} jobs!`);
            setTimeout(onClose, 2000);
        } catch (error) {
            console.error("Upload failed", error);
            setStatus('idle');
            toast.error("Bulk upload failed");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Bulk Upload Jobs</h2>
                        <p className="text-sm text-slate-500">Upload multiple shipments via CSV</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Drag Drop Area */}
                    {!file && (
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors group relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-slate-700">Click to Upload CSV</h3>
                            <p className="text-xs text-slate-400 mt-2">Expected columns: Goods, FleetType, Pickup, Dropoff, Tons, Budget</p>
                        </div>
                    )}

                    {/* Preview Area */}
                    {file && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-slate-500" />
                                    <span className="font-bold text-sm text-slate-700">{file.name}</span>
                                </div>
                                <button onClick={() => { setFile(null); setPreviewData([]); }} className="text-xs font-bold text-red-500 hover:underline">Remove</button>
                            </div>

                            {status === 'parsing' && (
                                <div className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                                    <p className="text-xs font-bold text-slate-400">Parsing file...</p>
                                </div>
                            )}

                            {previewData.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Preview ({previewData.length} valid rows)</h4>
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden max-h-60 overflow-y-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-100 text-slate-500 font-bold uppercase">
                                                <tr>
                                                    <th className="p-3">Goods</th>
                                                    <th className="p-3">From</th>
                                                    <th className="p-3">To</th>
                                                    <th className="p-3">Budget</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {previewData.map((row, i) => (
                                                    <tr key={i} className="hover:bg-blue-50/50">
                                                        <td className="p-3 font-medium">{row.goodsType}</td>
                                                        <td className="p-3 text-slate-500">{row.departure}</td>
                                                        <td className="p-3 text-slate-500">{row.destination}</td>
                                                        <td className="p-3 text-slate-700 font-bold">${row.budget}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {errors.length > 0 && (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-xs text-red-600 space-y-1">
                                    <p className="font-bold flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> Found {errors.length} issues:</p>
                                    <ul className="list-disc list-inside">
                                        {errors.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
                                        {errors.length > 3 && <li>...and {errors.length - 3} more</li>}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end space-x-3">
                    <button onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800">
                        Cancel
                    </button>
                    <button
                        onClick={handleUploadDefault}
                        disabled={previewData.length === 0 || status === 'uploading'}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center"
                    >
                        {status === 'uploading' ? 'Processing...' : `Import ${previewData.length} Jobs`}
                        {status === 'success' && <CheckCircle className="w-4 h-4 ml-2" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkUploadModal;
