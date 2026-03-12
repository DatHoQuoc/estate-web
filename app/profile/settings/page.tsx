import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { User, Shield, Camera, Loader2, Save, ArrowLeft, Wallet, History, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Dashboard as WalletDashboard } from "@app/credit/components/Wallet";
import { TransactionHistory } from "@app/credit/components/TransactionHistory";
import { authClient } from "../../../src/lib/auth-client";

export default function ProfileSettingsPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "personal";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    display_name: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        display_name: user.display_name || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authClient.updateProfile(formData);
      await refreshProfile();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account information and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Quick Overview / Avatar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50 text-center">
            <div className="relative inline-block group mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/10 transition-transform group-hover:scale-105">
                <img
                  src={formData.avatar_url || user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-4 flex justify-center">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider border border-primary/20">
                {user.role}
              </span>
            </div>
          </div>

          <div className="bg-background rounded-2xl p-4 shadow-sm border border-border/50 space-y-1">
            <button
              onClick={() => setSearchParams({ tab: "personal" })}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "personal" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                }`}
            >
              <User className="h-4 w-4" />
              Personal Info
            </button>
            <button
              onClick={() => setSearchParams({ tab: "wallet" })}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "wallet" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                }`}
            >
              <Wallet className="h-4 w-4" />
              Wallet & Credits
            </button>
            <button
              onClick={() => setSearchParams({ tab: "history" })}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "history" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                }`}
            >
              <History className="h-4 w-4" />
              Transaction History
            </button>
            <button
              onClick={() => setSearchParams({ tab: "security" })}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "security" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                }`}
            >
              <Shield className="h-4 w-4" />
              Security
            </button>
          </div>
        </div>

        {/* Right: Tab Content */}
        <div className="md:col-span-2">
          {activeTab === "personal" && (
            <form onSubmit={handleSubmit} className="bg-background rounded-2xl p-8 shadow-sm border border-border/50 space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className="bg-muted/30 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className="bg-muted/30 focus:bg-background transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  placeholder="How you appear to others"
                  className="bg-muted/30 focus:bg-background transition-all"
                />
                <p className="text-[11px] text-muted-foreground">This is your public name on the platform.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="bg-muted/30 focus:bg-background transition-all"
                />
              </div>

              <div className="pt-4 border-t border-border/50 flex justify-end">
                <Button type="submit" className="h-11 px-8 font-semibold shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {activeTab === "wallet" && (
            <div className="bg-background rounded-2xl p-8 shadow-sm border border-border/50 animate-in fade-in duration-300">
              <WalletDashboard />
            </div>
          )}

          {activeTab === "history" && (
            <div className="bg-background rounded-2xl p-8 shadow-sm border border-border/50 animate-in fade-in duration-300">
              <TransactionHistory />
            </div>
          )}

          {(activeTab === "security" || activeTab === "notifications") && (
            <div className="bg-background rounded-2xl p-12 shadow-sm border border-border/50 text-center animate-in fade-in duration-300">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-bold">Coming Soon</h3>
              <p className="text-muted-foreground">These settings will be available in a future update.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
