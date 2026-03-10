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
      await authClient.register(formData);
      toast.success("Account created successfully! Please log in.");
      navigate("/auth/login");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Registration failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-background rounded-2xl shadow-xl border border-border/50 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-inner mb-4">
            <MapPinHouse className="text-primary-foreground h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create an Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join PropList to manage your real estate</p>
        </div>

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
                className="bg-muted/50 focus:bg-background transition-colors"
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
                className="bg-muted/50 focus:bg-background transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="bg-muted/50 focus:bg-background transition-colors"
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
              className="bg-muted/50 focus:bg-background transition-colors"
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
              className="bg-muted/50 focus:bg-background transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="accept_terms" 
              checked={formData.accept_terms}
              onCheckedChange={(checked) => setFormData(p => ({ ...p, accept_terms: !!checked }))}
              disabled={isLoading}
            />
            <Label htmlFor="accept_terms" className="text-sm font-normal text-muted-foreground">
              I accept the{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link to="/auth/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
