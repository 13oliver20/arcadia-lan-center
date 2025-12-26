import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

/**
 * Syncs state with a specific document in the 'arcadia_data' collection in Firestore.
 * @param {string} key - The ID of the document to sync (e.g., 'users', 'giveaways').
 * @param {any} defaultValue - Initial value if document doesn't exist.
 */
export function useFirebaseSync(key, defaultValue) {
    // Initialize from LocalStorage if available (Instant Load)
    const [data, setData] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return defaultValue;
        }
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const docRef = doc(db, 'arcadia_data', key);

        // 1. Storage Event Listener (Tab-to-Tab Sync)
        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue) {
                try {
                    setData(JSON.parse(e.newValue));
                } catch (err) {
                    console.error("Error parsing storage change:", err);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // 2. Firestore Real-time Listener (Cloud Sync)
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const firestoreVal = docSnap.data().value;
                // Sync cloud data to local state
                setData(firestoreVal);
                // Also update localStorage to keep it fresh for next reload
                window.localStorage.setItem(key, JSON.stringify(firestoreVal));
            } else {
                // If doc fails/doesn't exist, we rely on local or default. 
                // Optionally create it.
                // setDoc(docRef, { value: defaultValue });
            }
            setLoading(false);
        }, (error) => {
            console.error("Firebase Sync Error:", error);
            setLoading(false);
        });

        return () => {
            unsubscribe();
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key]);

    const setValue = async (newValue) => {
        try {
            const valueToStore = newValue instanceof Function ? newValue(data) : newValue;

            // 1. Update Local State (Immediate UI Feedback)
            setData(valueToStore);

            // 2. Update LocalStorage (Immediate Tab Sync)
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            // Manually dispatch event so other tabs in SAME browser window context update? 
            // Note: 'storage' event fires automatically for OTHER tabs.

            // 3. Update Firestore (Cloud Persistence)
            const docRef = doc(db, 'arcadia_data', key);
            await setDoc(docRef, { value: valueToStore });

        } catch (error) {
            console.error("Error updating value:", error);
        }
    };

    return [data, setValue, loading];
}
