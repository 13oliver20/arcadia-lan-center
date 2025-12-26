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

    const [error, setError] = useState(null);

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
            setError(null);
            if (docSnap.exists()) {
                const firestoreVal = docSnap.data().value;
                setData(firestoreVal);
                window.localStorage.setItem(key, JSON.stringify(firestoreVal));
            } else {
                // Document doesn't exist yet
            }
            setLoading(false);
        }, (err) => {
            console.error("Firebase Sync Error:", err);
            setError(err);
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

            // 3. Update Firestore (Cloud Persistence)
            const docRef = doc(db, 'arcadia_data', key);
            await setDoc(docRef, { value: valueToStore });
            setError(null);

        } catch (err) {
            console.error("Error updating value:", err);
            setError(err);
            // Even if cloud fails, we keep local change for this session
        }
    };

    return [data, setValue, loading, error];
}
