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
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
import { Chrome, Code2, Loader2, CheckCircle, Code, Moon, Sun, Monitor, Palette } from "lucide-react";
import { toast } from "sonner";
import { getFirebaseErrorMessage } from "@/lib/helper";
import TextPressure from "@/components/ui/shadcn-io/text-pressure";
import { Toggle } from "@/components/ui/toggle";
import { useTheme } from "@/components/theme-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Signupform() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  const { user, signUp, signInwithGoogle, isSigningUp } = useAuthStore();
  const { theme, setTheme } = useTheme();

  // Simple Theme Toggle Component for Signup
  const SimpleThemeToggle = ({ className }: { className?: string }) => {
    return (
      <TooltipProvider>
        <div className={`flex items-center gap-1 p-1 bg-transparent z-50 rounded-lg ${className}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                variant={"outline"}
                size="sm"
                pressed={theme === "light"}
                onPressedChange={() => setTheme("light")}
                aria-label="Light theme"
                className={`h-8 w-8 p-0 transition-all ${theme === "light"
                  ? "bg-accent text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                  : "opacity-60 hover:opacity-100 hover:bg-accent/50"
                  }`}
              >
                <Sun className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Light Theme</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                variant={"outline"}
                size="sm"
                pressed={theme === "dark"}
                onPressedChange={() => setTheme("dark")}
                aria-label="Dark theme"
                className={`h-8 w-8 p-0 transition-all ${theme === "dark"
                  ? "bg-accent text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                  : "opacity-60 hover:opacity-100 hover:bg-accent/50"
                  }`}
              >
                <Moon className="-rotate-90 h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Dark Theme</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                variant={"outline"}
                size="sm"
                pressed={theme === "liner"}
                onPressedChange={() => setTheme("liner")}
                aria-label="Liner theme"
                className={`h-8 w-8 p-0 transition-all ${theme === "liner"
                  ? "bg-accent text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                  : "opacity-60 hover:opacity-100 hover:bg-accent/50"
                  }`}
              >
                <Code className="-rotate-90 h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Liner Theme</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                variant={"outline"}
                size="sm"
                pressed={theme === "valo"}
                onPressedChange={() => setTheme("valo")}
                aria-label="Valo theme"
                className={`h-8 w-8 p-0 transition-all ${theme === "valo"
                  ? "bg-accent text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                  : "opacity-60 hover:opacity-100 hover:bg-accent/50"
                  }`}
              >
                <Palette className="-rotate-90 h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Valo Theme</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                variant={"outline"}
                size="sm"
                pressed={theme === "system"}
                onPressedChange={() => setTheme("system")}
                aria-label="System theme"
                className={`h-8 w-8 p-0 transition-all ${theme === "system"
                  ? "bg-accent text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                  : "opacity-60 hover:opacity-100 hover:bg-accent/50"
                  }`}
              >
                <Monitor className="h-4 w-4 -rotate-90" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>System Theme</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex">
      {/* Left Section - INTELLIROOM with Light Beam */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-muted via-card to-background overflow-hidden">
        {/* Light Beam from upper left corner */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Main light beam - theme aware */}
          <div
            className="absolute top-0 left-0 opacity-30 dark:opacity-20"
            style={{
              width: '200px',
              height: '100vh',
              background: 'linear-gradient(135deg, transparent 0%, hsl(var(--muted-foreground)) 20%, hsl(var(--muted-foreground)/0.3) 40%, transparent 70%)',
              clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0 100%)',
              filter: 'blur(1px)'
            }}
          />

          {/* Broader beam behind text - theme aware */}
          <div
            className="absolute top-1/4 left-0 opacity-20 dark:opacity-10"
            style={{
              width: '400px',
              height: '60vh',
              background: 'linear-gradient(135deg, transparent 0%, hsl(var(--muted-foreground)) 15%, hsl(var(--muted-foreground)/0.4) 30%, transparent 60%)',
              clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)',
              filter: 'blur(2px)'
            }}
          />

          {/* Soft glow behind INTELLIROOM - theme aware */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-muted-foreground/10 dark:bg-muted-foreground/5 blur-3xl rounded-full" />
        </div>

        {/* Main Content */}
        <div className="relative  flex flex-col items-center justify-center w-full p-12">
          {/* Logo Icon - 3D Crystal Ball */}
          <div className="mb-8 relative">
            <div
              className="w-20 h-20 rounded-full relative overflow-hidden"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.1) 50%, transparent)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.5),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `
              }}
            >
              {/* Inner crystal effect */}
              <div
                className="absolute inset-1 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 25% 25%, hsl(var(--card)) 0%, transparent 70%)',
                  backdropFilter: 'blur(5px)'
                }}
              />

              {/* Icon container */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Code2 className="w-8 h-8 text-primary/80" />
              </div>

              {/* Light reflection */}
              <div
                className="absolute top-1 left-1 w-4 h-4 rounded-full opacity-60"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 60%)',
                  filter: 'blur(1px)'
                }}
              />
            </div>
          </div>

          {/* INTELLIROOM Text with Pressure Effect - Properly sized */}
          <div className="relative w-full flex items-center justify-center px-4 sm:px-12">
            <TextPressure
              text="INTELLIROOM"
              flex={true}
              alpha={false}
              stroke={false}
              width={false}
              weight={true}
              italic={false}
              textColor="currentColor"
              minFontSize={36}
              className="text-foreground filter drop-shadow-lg"
            />
          </div>

          {/* Subtitle */}
          <p className="text-muted-foreground text-xl text-center max-w-md leading-relaxed">
            Where innovative minds collaborate with AI and create the future of code
          </p>
        </div>
      </div>

      {/* Vertical Separator with Theme Toggler */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-background w-0.5">
        {/* Upper separator */}
        <div className="flex-1 w-px bg-border" />

        {/* Theme Toggler in the middle */}
        <div className="py-4">
          <SimpleThemeToggle className="rotate-90" />
        </div>

        {/* Lower separator */}
        <div className="flex-1 w-px bg-border" />

        {/* Code icon at bottom */}
        <div className="mb-8 bg-accent/10 z-50 px-3 py-2 rounded-lg border border-border shadow-sm">
          <Code2 className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Right Section - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-gradient-to-bl from-background to-muted">
        <div className="w-full max-w-md">
          {/* Mobile Logo/Brand - only visible on mobile */}
          <div className="text-center mb-8 lg:hidden">
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
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-muted rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${passwordStrength.strength === 1
                            ? "w-1/4 bg-destructive"
                            : passwordStrength.strength === 2
                              ? "w-2/4 bg-destructive/60"
                              : passwordStrength.strength === 3
                                ? "w-3/4 bg-green-200/60"
                                : passwordStrength.strength === 4
                                  ? "w-full bg-green-800"
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
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary" />
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
                  <Separator className="w-full" />
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
    </div>
  );
}