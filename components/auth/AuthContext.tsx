import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authClient } from "../../src/lib/auth-client";
import type { LoginDto } from "../../src/lib/auth-types";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: "buyer" | "seller" | "staff" | "admin";
  // Computed helpers for the UI
  name: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const refreshProfile = useCallback(async () => {
    try {
      if (!localStorage.getItem("access_token")) {
        setUser(null);
        return;
      }
      
      const profileData = await authClient.getProfile();
      
      const roleName = profileData.role?.name.toLowerCase() as any;
      const mappedRole: any = ["buyer", "seller", "staff", "admin"].includes(roleName) 
        ? roleName 
        : "buyer";

      setUser({
        ...profileData,
        id: profileData.user_id,
        // UI mappings for legacy compatibility
        name: profileData.display_name || `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim() || profileData.email,
        avatar: profileData.avatar_url || "",
        role: mappedRole
      });
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();

    const handleGlobalLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleGlobalLogout);
    return () => window.removeEventListener('auth-logout', handleGlobalLogout);
  }, [refreshProfile]);

  const login = async (data: LoginDto) => {
    const authData = await authClient.login(data);
    localStorage.setItem("access_token", authData.access_token);
    localStorage.setItem("refresh_token", authData.refresh_token);
    await refreshProfile();
  };

  const logout = async () => {
    try {
      await authClient.logout();
    } catch (e) {
      console.warn("Logout endpoint failed, clearing local state anyway", e);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      
      // Optional: hard reset or redirect 
      // window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
