import { useState, useEffect } from 'react';

/**
 * Hook to read and subscribe to localStorage updates.
 * @param {string} key The localStorage key to watch.
 * @param {any} initialValue Default value if key is not found.
 * @returns {[any, Function]} [storedValue, setValue]
 */
export function useLocalStorageSync(key, initialValue) {
    // State to store our value
    // Pass initial state function to only execute on first render
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));

            // Dispatch a custom event so the current tab also updates if needed 
            // (though mostly we care about other tabs)
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const handleStorageChange = (e) => {
            // If the key matches or it's a general storage event (some browsers)
            if (e.key === key || !e.key) {
                try {
                    // If e.newValue is null (cleared), use initialValue, else parse it
                    // If we are reading directly from localStorage because e.newValue might be null in some cases or we want to be sure
                    const item = window.localStorage.getItem(key);
                    setStoredValue(item ? JSON.parse(item) : initialValue);
                } catch (error) {
                    console.error(error);
                }
            }
        };

        // Listen for changes in other tabs
        window.addEventListener('storage', handleStorageChange);

        // Optional: Listen for local custom events if we used them for same-tab sync
        // window.addEventListener('local-storage-update', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key, initialValue]);

    return [storedValue, setValue];
}
