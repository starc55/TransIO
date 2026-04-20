import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import logoImage from "../../imports/logo.png";
import { useAppState } from "../context/app-state";
import { motion } from "motion/react";
import { toast } from "sonner";
import React from "react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAppState();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login({ email });
      setIsLoading(false);
      toast.success("Login successful");
      navigate("/");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-sky-400/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.14),transparent_50%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full max-w-md z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4 overflow-hidden ring-2 ring-primary/20">
            <ImageWithFallback
              src={logoImage}
              alt="TransIO Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome to Trans<span className="text-primary">IO</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Sign in to manage your freight operations
          </p>
        </div>

        <div className="bg-card/95 border border-border rounded-3xl shadow-2xl shadow-primary/10 p-6 sm:p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-foreground text-sm sm:text-base"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 sm:h-11 bg-input-background border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-foreground text-sm sm:text-base"
                >
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 sm:h-11 pr-10 bg-input-background border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor="remember"
                className="text-xs sm:text-sm font-normal text-muted-foreground cursor-pointer"
              >
                Remember me for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-10 sm:h-11 bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base font-semibold shadow-lg shadow-primary/20 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative my-5 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-4 bg-card text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 sm:h-11 border-border text-foreground hover:bg-primary/10 hover:border-primary/50 text-sm sm:text-base transition-all cursor-pointer"
              disabled={isLoading}
            >
              <span className="hidden sm:inline">Google</span>
              <span className="sm:hidden">G</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 sm:h-11 border-border text-foreground hover:bg-primary/10 hover:border-primary/50 text-sm sm:text-base transition-all cursor-pointer"
              disabled={isLoading}
            >
              <span className="hidden sm:inline">Discord</span>
              <span className="sm:hidden">D</span>
            </Button>
          </div>
        </div>

        <div className="text-center mt-5 sm:mt-6">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-primary hover:text-primary/80 font-semibold transition-colors cursor-pointer"
            >
              Sign up for free
            </button>
          </p>
        </div>

        <div className="text-center mt-6 sm:mt-8 text-xs text-muted-foreground">
          <p>
            By signing in, you agree to our{" "}
            <button
              type="button"
              className="text-primary hover:underline cursor-pointer"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="text-primary hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
