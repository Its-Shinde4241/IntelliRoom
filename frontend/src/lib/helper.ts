import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export async function reauthenticate(email: string, password: string) {
    try {

        const auth = getAuth();
        const credential = EmailAuthProvider.credential(email, password);
        if (auth.currentUser) {
            await reauthenticateWithCredential(auth.currentUser, credential);
        }
    }
    catch (error) {
        console.error("Reauthentication error:", error);
        throw error;
    }
}

export function getFirebaseErrorMessage(error: any): string {
    const code = error.code || "";

    const errorMap: Record<string, string> = {
        "auth/email-already-in-use": "Email is already in use",
        "auth/invalid-email": "Invalid email address",
        "auth/user-not-found": "User not found",
        "auth/wrong-password": "Incorrect password",
        "auth/weak-password": "Password should be at least 6 characters",
        "auth/popup-closed-by-user": "Google popup was closed before login",
        "auth/network-request-failed": "Network error. Please try again",
        "auth/invalid-credential": "Invalid credentials provided",
        "auth/operation-not-allowed": "Operation not allowed",
        "auth/too-many-requests": "Too many requests. Please try again later",
    };

    return errorMap[code] || "An unexpected error occurred";
}

export const getfileExtension = (fileType: string): string => {
    const extensionMap: Record<string, string> = {
        "html": "html",
        "css": "css",
        "python": "py",
        "java": "java",
        "cpp": "cpp",
        "javascript": "js",
        "typescript": "ts",
    };
    return extensionMap[fileType] || "txt";
}