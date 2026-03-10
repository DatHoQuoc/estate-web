import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "../../../src/lib/auth-client";
import { MapPinHouse, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    first_name: "",
    last_name: "",
    accept_terms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!formData.accept_terms) {
      toast.error("You must accept the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authClient.register(formData) as any;

      const { user } = response;

      const registeredUserId = user?.user_id;

      if (!registeredUserId) {
        // Fallback or warning if ID is not returned
        console.warn("User ID not returned from registration, verification may fail.");
      }

      setUserId(registeredUserId);
      setIsVerifying(true);
      toast.success("Registration successful! Please check your email for the verification code.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Registration failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("User ID is missing. Please try registering again.");
      return;
    }

    setIsLoading(true);
    try {
      await authClient.verifyEmail({
        code: verificationCode,
        user_id: userId
      });
      toast.success("Email verified successfully! You can now log in.");
      navigate("/auth/login");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Verification failed. Please check the code.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-background rounded-2xl shadow-xl border border-border/50 p-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-inner mb-4 hover:scale-105 transition-transform">
            <MapPinHouse className="text-primary-foreground h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isVerifying ? "Verify Your Email" : "Create an Account"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-[280px]">
            {isVerifying
              ? `We've sent a code to ${formData.email}. Please enter it below.`
              : "Join PropList to manage your real estate assets"}
          </p>
        </div>

        {!isVerifying ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  placeholder="John"
                  className="bg-muted/50 focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  placeholder="Doe"
                  className="bg-muted/50 focus:bg-background transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="bg-muted/50 focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="••••••••"
                className="bg-muted/50 focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm Password</Label>
              <Input
                id="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="••••••••"
                className="bg-muted/50 focus:bg-background transition-all"
              />
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="accept_terms"
                checked={formData.accept_terms}
                onCheckedChange={(checked) => setFormData(p => ({ ...p, accept_terms: !!checked }))}
                disabled={isLoading}
                className="mt-1"
              />
              <Label htmlFor="accept_terms" className="text-sm font-normal text-muted-foreground leading-tight">
                I accept the{" "}
                <Link to="/terms" className="text-primary hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full h-11 mt-6 font-semibold" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="verification_code" className="text-center block text-base font-semibold">Verification Code</Label>
              <Input
                id="verification_code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                disabled={isLoading}
                className="bg-muted/50 focus:bg-background text-center text-2xl tracking-[0.5em] font-mono h-14"
                maxLength={10}
              />
              <p className="text-[11px] text-muted-foreground text-center px-4">
                Wait up to 1-2 minutes for the email. If you didn't receive it, please check your spam folder.
              </p>
            </div>

            <Button type="submit" className="w-full h-11 mt-4 font-semibold" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Continue
            </Button>

            <button
              type="button"
              onClick={() => setIsVerifying(false)}
              className="text-sm text-primary font-medium hover:underline block w-full text-center mt-2"
              disabled={isLoading}
            >
              Back to registration
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link to="/auth/login" className="text-primary font-bold hover:underline transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
