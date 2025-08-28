import { loginWithEmail, signupWithEmail } from "@/lib/auth";
import type { User, UserCredential } from "firebase/auth";
import { create } from "zustand";

type Store = {
    user: User | null;
    isSigningUp: boolean;
    signup: (email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
};

const useStore = create<Store>((set) => ({
    user: null,
    isSigningUp: false,
    signup: async (email: string, password: string) => {
        set({ isSigningUp: true });
        try {
            const userCredential: UserCredential | undefined = await signupWithEmail(email, password);

            if (userCredential?.user) {
                set({ user: userCredential.user });
            } else {
                console.error("⚠️ Signup returned no user");
            }
        } catch (error) {
            console.error("❌ Error signing up:", error);
        } finally {
            set({ isSigningUp: false });
        }
    },
    login: async (email: string, password: string) => {
        try {
            const userCredential: UserCredential | undefined = await loginWithEmail(email, password);
            set({ user: userCredential?.user || null });
            console.log("✅ User logged in:", userCredential?.user);

        } catch (error) {
            console.error("❌ Error logging in:", error);
            // Handle login error here, e.g., show a toast notification
        }
    }
}));

export default useStore;
