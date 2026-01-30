import React from 'react';
import { useRouteError } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-red-100 p-4 rounded-full mb-6">
                <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Oops! Something went wrong.</h1>
            <p className="text-slate-500 mb-8 max-w-md">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-left max-w-lg w-full overflow-auto shadow-sm">
                <p className="font-mono text-xs text-red-500">
                    {error.statusText || error.message}
                </p>
            </div>
            <button
                onClick={() => window.location.href = '/'}
                className="mt-8 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
                Return Home
            </button>
        </div>
    );
}
