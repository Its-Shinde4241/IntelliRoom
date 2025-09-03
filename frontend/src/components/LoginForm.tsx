// src/components/LoginForm.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

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

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {
    user,
    loading,
    signUp,
    isSigningUp,
    signIn,
    isSigningIn,
    signInwithGoogle,
    signOut,
    isSigningOut,
    initAuthListener,
  } = useAuthStore();
  const handleLogin = async () => {
    try {
      await signIn(email, password);
      toast.success("Logged in successfully!");
    } catch (err: any) {
      toast.error("Login failed: " + getFirebaseErrorMessage(err));
    }
  };

  const handleSignup = async () => {
    try {
      await signUp(email, password);
      toast.success("Signed up successfully!");
    } catch (err: any) {
      toast.error("Signup failed: " + getFirebaseErrorMessage(err));
    }
  };

  const handleGoogle = async () => {
    try {
      await signInwithGoogle();
      toast.success("Logged in with Google!");
    } catch (err: any) {
      toast.error("Google login failed: " + getFirebaseErrorMessage(err));
    }
  };

  useEffect(() => {
    initAuthListener();
  }, []);
  return (
    <div className="w-full max-w-md mx-auto mt-20 space-y-4">
      {!loading && !user && (
        <form
          action=""
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleLogin}
              className="cursor-pointer"
              variant="default"
            >
              {isSigningIn ? "...." : "Login"}
              {/* Login */}
            </Button>
            <Button
              onClick={handleSignup}
              className="cursor-pointer"
              variant="outline"
            >
              {isSigningUp ? "...." : "Signup"}
            </Button>
          </div>
          <Button
            variant="secondary"
            className="cursor-pointer"
            onClick={handleGoogle}
          >
            Sign in with Google
          </Button>
        </form>
      )}
      {user && (
        <div>
          <p className="text-center">Logged in as {user.displayName}</p>
          <Button
            onClick={async () => {
              try {
                await signOut();
                toast.success("Logged out successfully!");
              } catch (err: any) {
                toast.error("Logout failed: " + getFirebaseErrorMessage(err));
              }
            }}
            className="cursor-pointer"
            variant="destructive"
          >
            {isSigningOut ? "...." : "Logout"}
          </Button>
        </div>
      )}
    </div>
  );
}
