import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAk5UUV4RomBvurD29g4v-YSb4kvWBSWXA",
    authDomain: "photographer-platform-e26c5.firebaseapp.com",
    projectId: "photographer-platform-e26c5",
    storageBucket: "photographer-platform-e26c5.firebasestorage.app",
    messagingSenderId: "505022365775",
    appId: "1:505022365775:web:b833a2aeb2b4a2684e2a3a"
};

const app = initializeApp(firebaseConfig);

// ✅ THIS LINE WAS MISSING OR WRONG
export const db = getFirestore(app);
export const auth = getAuth(app);
