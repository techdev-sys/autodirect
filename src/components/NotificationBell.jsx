import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Info, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns'; // Need to check if date-fns installed, if not will use simple formatter

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Simple time formatter if date-fns not available
    const timeAgo = (timestamp) => {
        if (!timestamp) return 'Just now';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const seconds = Math.floor((new Date() - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'error': return <X className="w-4 h-4 text-red-500" />;
            default: return <MessageSquare className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors relative"
            >
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-slate-800' : 'text-slate-400'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[10px] font-bold text-blue-600 hover:underline">
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-xs font-bold">No new notifications</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    <div className="mt-1">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-sm ${!notif.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                                                {notif.title}
                                            </p>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase whitespace-nowrap ml-2">
                                                {timeAgo(notif.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-snug">{notif.message}</p>
                                    </div>
                                    {!notif.read && (
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
