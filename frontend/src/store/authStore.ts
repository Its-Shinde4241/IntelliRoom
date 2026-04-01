import { create } from "zustand";
import {
    getAuth, onAuthStateChanged,
    type User as FirebaseUser,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup, signOut,
    getAdditionalUserInfo,
    updateProfile as firebaseupdateProfile,
    updateEmail as firebaseupdateEmail,
    updatePassword as firebaseupdatePassword
} from "firebase/auth";
import { googleProvider } from "@/lib/firebase";

import { api } from "@/lib/axiosInstance";
import { reauthenticate } from "@/lib/helper";

interface AuthUser extends FirebaseUser {
    userId?: string; // Backend business ID
}

type AuthState = {
    user: AuthUser | null;
    userId?: string; // Backend business ID
    loading: boolean;
    isSigningUp: boolean;
    isSigningIn: boolean;
    isSigningOut: boolean;
    isUpdating: boolean;
    setUser: (user: AuthUser | null) => void;
    initAuthListener: () => void;
    signUp: (email: string, Password: string) => void;
    signIn: (email: string, password: string) => void;
    signInwithGoogle: () => void;
    signOut: () => void;
    updateProfile: (name: string, email: string, password?: string, currentPassword?: string) => void;
    checkAuth: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    userId: undefined,
    loading: true,
    isSigningUp: false,
    isSigningIn: false,
    isSigningOut: false,
    isUpdating: false,

    setUser: (user) => set({ user }),

    initAuthListener: () => {
        const auth = getAuth();
        onAuthStateChanged(auth,
            async (user) => {
                if (user) {
                    // Don't set user immediately, wait for backend verification
                    const isBackendVerified = await get().checkAuth();
                    if (!isBackendVerified) {
                        console.warn("Backend verification failed during auth state change");
                        set({ user: null, loading: false });
                    }
                    // checkAuth will set the user if verification succeeds
                } else {
                    set({ user: null, loading: false });
                }
            },
            (error) => {
                console.error("Auth state change error:", error);
                set({ user: null, loading: false });
            }
        );
    },

    signUp: async (email: string, password: string) => {
        try {
            set({ isSigningUp: true });
            const auth = getAuth();
            const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

            // Sync with backend first
            await api.post("auth/sync", {
                uid: userCredentials.user.uid,
                email: userCredentials.user.email,
                displayName: userCredentials.user.displayName
            });

            console.log("User synced with backend");

            // Verify with backend before setting user
            const isBackendVerified = await get().checkAuth();
            if (!isBackendVerified) {
                throw new Error("Backend verification failed after signup");
            }
            // checkAuth will set the user if verification succeeds
        } catch (error) {
            console.error("Sign up error:", error);
            throw error;
        } finally {
            set({ isSigningUp: false });
        }
    },

    signIn: async (email: string, password: string) => {
        try {
            set({ isSigningIn: true });
            const UserCredentials = await signInWithEmailAndPassword(getAuth(), email, password);

            // Don't set user immediately, verify with backend first
            const isBackendVerified = await get().checkAuth();
            if (!isBackendVerified) {
                throw new Error("Backend verification failed after sign in");
            }
            set({ user: UserCredentials.user as AuthUser });
            // checkAuth will set the user if verification succeeds
        } catch (error) {
            console.error("Sign in error:", error);
            throw error;
        } finally {
            set({ isSigningIn: false });
        }
    },

    signInwithGoogle: async () => {
        try {
            const auth = getAuth();
            set({ isSigningIn: true });
            const UserCredentials = await signInWithPopup(auth, googleProvider);

            if (getAdditionalUserInfo(UserCredentials)?.isNewUser) {
                console.log("New user signed in with Google, syncing with backend.");
                await api.post("auth/sync", {
                    uid: UserCredentials.user.uid,
                    email: UserCredentials.user.email,
                    displayName: UserCredentials.user.displayName
                });
            }

            // Don't set user immediately, verify with backend first
            const isBackendVerified = await get().checkAuth();
            if (!isBackendVerified) {
                throw new Error("Backend verification failed after Google sign in");
            }
            // checkAuth will set the user if verification succeeds
        } catch (error) {
            console.error("Google sign-in error:", error);
            throw error;
        } finally {
            set({ isSigningIn: false });
        }
    },

    signOut: async () => {
        try {
            set({ isSigningOut: true });
            await signOut(getAuth());
            set({ user: null, userId: undefined });
        } catch (error) {
            console.error("error in sign out store function:", error);
            throw error;
        } finally {
            set({ isSigningOut: false });
        }
    },

    updateProfile: async (name?: string, email?: string, password?: string, currpassword?: string) => {
        try {
            set({ isUpdating: true });
            const auth = getAuth();
            const curruser = auth.currentUser;
            if (!curruser) throw new Error("No user is currently signed in.");

            if (name && email) {
                await firebaseupdateEmail(curruser, email);
                await firebaseupdateProfile(curruser, { displayName: name });
                await api.post("auth/sync", {
                    uid: curruser.uid,
                    email: email,
                    displayName: name
                });
            }

            if (currpassword && curruser.email && password) {
                await reauthenticate(curruser.email, currpassword);
                await firebaseupdatePassword(curruser, password);
            }

            // Refresh user data after update
            await get().checkAuth();
        } catch (error) {
            console.error("Profile update error:", error);
            throw error;
        } finally {
            set({ isUpdating: false });
        }
    },

    checkAuth: async () => {
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) {
                set({ user: null, userId: undefined, loading: false });
                return false;
            }

            const userToken = await currentUser.getIdToken();
            const response = await api.get("/auth/checkauth", {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            });

            const data = response.data as { success: boolean; userId?: string };

            if (data.success) {
                // Only set user after backend verification succeeds
                const currentState = get();
                if (!currentState.user || currentState.user.uid !== currentUser.uid) {
                    set({ user: currentUser as AuthUser, userId: data.userId, loading: false });
                } else if (data.userId && !currentState.userId) {
                    set({ userId: data.userId });
                }
                return true;
            } else {
                set({ user: null, userId: undefined, loading: false });
                return false;
            }
        } catch (error) {
            console.error("Check auth error:", error);
            set({ user: null, userId: undefined, loading: false });
            return false;
        }
    },
}));