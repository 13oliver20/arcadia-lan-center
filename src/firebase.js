import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDvj1XYANkW99nEcOu2ma5O1MyOvw2rE28",
    authDomain: "gaming-center-arcadia.firebaseapp.com",
    projectId: "gaming-center-arcadia",
    storageBucket: "gaming-center-arcadia.firebasestorage.app",
    messagingSenderId: "672088520360",
    appId: "1:672088520360:web:570589ecf05c62608cf49d",
    measurementId: "G-LNC8W28P9P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
