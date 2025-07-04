import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "./ui/alert";
import { IconAlertCircle, IconLoader } from "@tabler/icons-react";
import { Card, CardContent } from "./ui/card";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const signUp = useAuthStore((state) => state.signUp);
  const navigate = useNavigate();

  // Check if form is valid (all fields have values)
  const isFormValid =
    email.trim() !== "" &&
    password.trim() !== "" &&
    fullName.trim() !== "" &&
    code.trim() !== "";
  const isSignupDisabled = loading || !isFormValid;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't proceed if form is invalid or already loading
    if (isSignupDisabled) return;

    setLoading(true);
    setError("");

    const { error, redirectPath } = await signUp(
      email,
      password,
      fullName,
      code
    );

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      // Keep loading spinner active during navigation
      navigate(redirectPath || "/welcome");
      // Don't set loading to false - let the page transition handle it
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <Card className={cn("w-full backdrop-blur-sm", className)} {...props}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-2 font-medium">
              <img
                src="/assets/logos/vantage-logo-white.png"
                alt="Vantage Logo"
                className="hidden dark:block"
                width={96}
                height={96}
              />
              <img
                src="/assets/logos/vantage-logo.svg"
                alt="Vantage Logo"
                className="block dark:hidden"
                width={96}
                height={96}
              />
              <span className="sr-only">Vantage</span>
            </div>
            <h1 className="text-xl font-bold">Join Vantage</h1>
            <p className="text-sm text-muted-foreground text-center text-balance">
              Create your account to get started with Vantage
            </p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="code">Access Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter your access code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className={`w-full transition-all duration-300 ${
                loading
                  ? "bg-gradient-to-r from-[#eb59ff] to-[#032a83] border-0 text-white animate-brand-wave"
                  : ""
              }`}
              disabled={isSignupDisabled}
            >
              <span className="relative z-20 flex items-center justify-center">
                {loading && (
                  <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                )}
                {loading ? "Creating account..." : "Sign Up"}
              </span>
            </Button>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 text-muted-foreground">
                Already have an account?
              </span>
            </div>
            {/* Back to Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleBackToLogin}
            >
              Sign In
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
