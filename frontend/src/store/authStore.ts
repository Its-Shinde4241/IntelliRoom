import { create } from "zustand";
import {
    getAuth, onAuthStateChanged,
    type User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup, signOut,
    getAdditionalUserInfo
} from "firebase/auth";
import { googleProvider } from "@/lib/firebase";

import api from "@/lib/axiosInstance";

type AuthState = {
    user: User | null;
    loading: boolean;
    isSigningUp: boolean;
    isSigningIn: boolean;
    isSigningOut: boolean;
    setUser: (user: User | null) => void;
    initAuthListener: () => void;
    signUp: (email: string, Password: string) => void;
    signIn: (email: string, password: string) => void;
    signInwithGoogle: () => void;
    signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    isSigningUp: false,
    isSigningIn: false,
    isSigningOut: false,

    setUser: (user) => set({ user }),

    initAuthListener: () => {
        const auth = getAuth();
        onAuthStateChanged(auth,
            async (user) => {
                if (user) {
                    set({ user, loading: false });
                } else {
                    set({ user: null, loading: false });
                }
            },
            (error) => {
                console.error("Auth state change error:", error);
                set({ user: null, loading: false });
                throw error;
            }
        );
    },
    signUp: async (email: string, password: string) => {
        try {
            set({ isSigningUp: true });
            const auth = getAuth();
            const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
            set({ user: userCredentials.user });

            const res = await api.post("auth/sync", {
                uid: userCredentials.user.uid,
                email: userCredentials.user.email,
                displayName: userCredentials.user.displayName
            })
            console.log("User synced with backend:", res.data);
        } catch (error) {
            console.error("Sign up error:", error);
            throw error;
        }
        finally {
            set({ isSigningUp: false });
        }
    },
    signIn: async (email: string, password: string) => {
        try {
            set({ isSigningIn: true });
            const UserCredentials = await signInWithEmailAndPassword(getAuth(), email, password);
            set({ user: UserCredentials.user });
        } catch (error) {
            console.error("Sign in error:", error);
            throw error;
        }
        finally {
            set({ isSigningIn: false });
        }
    },
    signInwithGoogle: async () => {
        try {
            const auth = getAuth();
            set({ isSigningIn: true });
            const UserCredentials = await signInWithPopup(auth, googleProvider);

            if (getAdditionalUserInfo(UserCredentials)?.isNewUser) {
                await api.post("auth/sync", {
                    uid: UserCredentials.user.uid,
                    email: UserCredentials.user.email,
                    displayName: UserCredentials.user.displayName
                })
            }
            set({ user: UserCredentials.user });
        } catch (error) {
            console.error("Google sign-in error:", error);
            throw error;
        }
        finally {
            set({ isSigningIn: false });
        }
    },
    signOut: async () => {
        try {
            set({ isSigningOut: true });
            await signOut(getAuth());
            set({ user: null });
        } catch (error) {
            console.error("error in sign out store function:", error);
            throw error;
        }
        finally {
            set({ isSigningOut: false });
        }
    }

}));
