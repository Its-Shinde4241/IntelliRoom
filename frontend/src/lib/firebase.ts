// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, GoogleAuthProvider, setPersistence } from "firebase/auth";

// console.log("apiKey:", import.meta.env.VITE_APIKEY);
// console.log("authDomain:", import.meta.env.VITE_AUTHDOMAIN);
// console.log("projectId:", import.meta.env.VITE_PROJECTID);
// console.log("storageBucket:", import.meta.env.VITE_STORAGEBUCKET);
// console.log("messagingSenderId:", import.meta.env.VITE_MESSAGINGSENDERID);
// console.log("appId:", import.meta.env.VITE_APPID);
// console.log("measurementId:", import.meta.env.VITE_MEASUREMENTID);

const firebaseConfig = {
    apiKey: import.meta.env.VITE_APIKEY,
    authDomain: import.meta.env.VITE_AUTHDOMAIN,
    projectId: import.meta.env.VITE_PROJECTID,
    storageBucket: import.meta.env.VITE_STORAGEBUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
    appId: import.meta.env.VITE_APPID,
    measurementId: import.meta.env.VITE_MEASUREMENTID
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export { auth };
export const googleProvider = new GoogleAuthProvider();

