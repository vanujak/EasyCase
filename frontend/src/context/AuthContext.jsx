import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!isSignedIn) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      const res = await apiFetch("/auth/me", { token });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        fetchProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    }
  }, [isLoaded, isSignedIn, userId, fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        isLoaded,
        isSignedIn,
        profile,
        loading,
        refetchProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useLawyerProfile() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useLawyerProfile must be used within an AuthProvider");
  }
  return ctx;
}
