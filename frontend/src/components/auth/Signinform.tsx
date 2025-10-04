import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/authStore";
import { Chrome, Code2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getFirebaseErrorMessage } from "@/lib/helper";
import ForgotPassword from "./ForgotPassword";

export default function Signinform() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const { user, signIn, signInwithGoogle, isSigningIn } = useAuthStore();

  const navigate = useNavigate();
  const location = useLocation();

  // Move this check AFTER all hooks are called
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    try {
      await signIn(email, password);
      const from = location.state?.from?.pathname || "/";
      toast.success("signed in successfully", { position: "top-right" });
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInwithGoogle();
      const from = location.state?.from?.pathname || "/";
      toast.success("signed in successfully", { position: "top-right" });
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    }
  };

  // Check for authenticated user AFTER all hooks
  if (user) {
    return <Navigate to={"/"} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 backdrop-blur-sm rounded-xl border border-border">
              <Code2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Intelliroom</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Sign in to your collaborative IDE
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to access your workspace
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {formError && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:bg-background"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:bg-background"
                  required
                />
              </div>
              <div className="">
                <ForgotPassword />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 shadow-lg"
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground font-semibold py-3"
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <Chrome className="w-4 h-4 mr-2" />
                  Continue with Google
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/auth/signup"
                  className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            ©2025 Intelliroom. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}