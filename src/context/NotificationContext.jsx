import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [user, setUser] = useState(null);

    // Listen to Auth
    useEffect(() => {
        const unsub = auth.onAuthStateChanged((u) => setUser(u));
        return () => unsub();
    }, []);

    // Listen to Notifications
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        const q = query(
            collection(db, "users", user.uid, "notifications"),
            orderBy("createdAt", "desc"),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.read).length);

            // Optional: Sound effect for new notification?
            // if (snapshot.docChanges().some(change => change.type === 'added')) { ... }
        });

        return () => unsubscribe();
    }, [user]);

    // Trigger Notification (The "Broker-Killer" Logic)
    // This function writes to Firestore, which would trigger Cloud Functions in Prod.
    const triggerNotification = async (targetUserId, type, title, message, data = {}) => {
        try {
            // 1. Write to In-App Notifications Subcollection
            await addDoc(collection(db, "users", targetUserId, "notifications"), {
                type, // 'info', 'success', 'warning', 'error'
                title,
                message,
                data,
                read: false,
                createdAt: serverTimestamp()
            });

            // 2. Write to Mail Collection (for Email/SMS triggers)
            // This follows the "Trigger" pattern for Firebase Extensions/Functions
            if (data.sendEmail) {
                await addDoc(collection(db, "mail"), {
                    to: [data.email],
                    message: {
                        subject: title,
                        text: message,
                        html: `<p>${message}</p>`
                    },
                    createdAt: serverTimestamp()
                });
            }

            // 3. Local Toast Feedback (if triggering for self, or just confirmation)
            // toast.success("Notification Sent"); 

        } catch (error) {
            console.error("Error sending notification:", error);
            toast.error("Failed to send alert");
        }
    };

    const markAsRead = async (id) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid, "notifications", id), {
                read: true
            });
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    const markAllRead = async () => {
        if (!user) return;
        // Batch update is better, but simple loop for now (limit 20)
        notifications.filter(n => !n.read).forEach(n => markAsRead(n.id));
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, triggerNotification, markAsRead, markAllRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
