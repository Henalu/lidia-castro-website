import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getCurrentProfile, getStorageMode, initializeLocalDemo, signIn, signOut, signUp, updateProfile } from "../lib/data";
import { supabase } from "../lib/supabase";
import type { LoginInput, Profile, RegisterInput } from "../lib/types";

type AuthContextValue = {
  profile: Profile | null;
  isLoading: boolean;
  storageMode: "supabase" | "local";
  signInAction: (input: LoginInput) => Promise<Profile>;
  signUpAction: (input: RegisterInput) => Promise<Profile>;
  signOutAction: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileAction: (patch: Partial<Omit<Profile, "id" | "role" | "createdAt">>) => Promise<Profile>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const storageMode = getStorageMode();

  useEffect(() => {
    initializeLocalDemo();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const nextProfile = await getCurrentProfile();
        if (isMounted) {
          setProfile(nextProfile);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    if (!supabase) {
      return () => {
        isMounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadProfile();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      isLoading,
      storageMode,
      async signInAction(input) {
        const nextProfile = await signIn(input);
        setProfile(nextProfile);
        return nextProfile;
      },
      async signUpAction(input) {
        const nextProfile = await signUp(input);
        setProfile(nextProfile);
        return nextProfile;
      },
      async signOutAction() {
        await signOut();
        setProfile(null);
      },
      async refreshProfile() {
        const nextProfile = await getCurrentProfile();
        setProfile(nextProfile);
      },
      async updateProfileAction(patch) {
        if (!profile) {
          throw new Error("No hay sesion iniciada.");
        }

        const nextProfile = await updateProfile(profile.id, patch);
        setProfile(nextProfile);
        return nextProfile;
      },
    }),
    [isLoading, profile, storageMode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
}
