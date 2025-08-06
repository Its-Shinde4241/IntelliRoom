// src/components/LoginForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginWithEmail, loginWithGoogle, signupWithEmail } from "@/lib/auth";
import { toast } from "sonner";
// utils/firebaseErrors.ts

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
    // Add more as needed
  };

  return errorMap[code] || "An unexpected error occurred";
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await loginWithEmail(email, password);
      toast.success("Logged in successfully!");
    } catch (err: any) {
      toast.error("Login failed: " + getFirebaseErrorMessage(err));
    }
  };

  const handleSignup = async () => {
    try {
      await signupWithEmail(email, password);
      toast.success("Signed up successfully!");
    } catch (err: any) {
      toast.error("Signup failed: " + getFirebaseErrorMessage(err));
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      toast.success("Logged in with Google!");
    } catch (err: any) {
      toast.error("Google login failed: " + getFirebaseErrorMessage(err));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-20 space-y-4">
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
        <Button onClick={handleLogin}>Login</Button>
        <Button onClick={handleSignup} variant="outline">
          Signup
        </Button>
      </div>
      <Button variant="secondary" onClick={handleGoogle}>
        Sign in with Google
      </Button>
    </div>
  );
}
