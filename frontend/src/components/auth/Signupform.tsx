import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
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
import { useAuthStore } from "@/store/authStore";
import { Chrome, Code2, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { getFirebaseErrorMessage } from "@/lib/helper";

export default function Signupform() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  const { user, signUp, signInwithGoogle, isSigningUp } = useAuthStore();

  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setFormError("Please fill in all fields");
      return false;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!validateForm()) return;

    try {
      await signUp(email, password);
      toast.success("Account created successfully");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error), { position: "top-right" });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInwithGoogle();
      toast.success("Account created successfully");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    }
  };

  const displayError = formError;
  useEffect(() => {
    if (displayError) {
      toast.error(displayError, { position: "top-center" });
    }
  }, [displayError]);

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "" };
    if (password.length < 6) return { strength: 1, label: "Too short" };
    if (password.length < 8) return { strength: 2, label: "Weak" };
    if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      return { strength: 4, label: "Strong" };
    }
    return { strength: 3, label: "Good" };
  };

  const passwordStrength = getPasswordStrength(password);

  // Check for authenticated user AFTER all hooks are called
  if (user) {
    return <Navigate to="/" replace />;
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
            Join the collaborative coding revolution
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">
              Create Account
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Start collaborating on code projects today
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
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
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:bg-background"
                  required
                />
                {password && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.strength === 1
                            ? "w-1/4 bg-destructive"
                            : passwordStrength.strength === 2
                              ? "w-2/4 bg-yellow-500"
                              : passwordStrength.strength === 3
                                ? "w-3/4 bg-blue-500"
                                : passwordStrength.strength === 4
                                  ? "w-full bg-green-500"
                                  : "w-0"
                          }`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground min-w-fit">
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:bg-background"
                    required
                  />
                  {confirmPassword && password === confirmPassword && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 shadow-lg"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
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
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing Up...
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
                Already have an account?{" "}
                <Link
                  to="/auth/signin"
                  className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-primary underline hover:text-primary/80">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary underline hover:text-primary/80">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}