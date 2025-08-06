import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export const loginWithEmail = async (Email: string, Password: string) => {
    try {
        return signInWithEmailAndPassword(auth, Email, Password);
    } catch (error) {
        console.error("Error signing in with email:", error);

    }
}

export const signupWithEmail = async (Email: string, Password: string) => {
    try {
        return createUserWithEmailAndPassword(auth, Email, Password);
    } catch (error) {
        console.error("Error signing up with email:", error);

    }
}

export const loginWithGoogle = async () => {
    try {
        return signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error("Error signing in with Google:", error);

    }
}

export const logout = async () => {
    try {
        return signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
    }
}