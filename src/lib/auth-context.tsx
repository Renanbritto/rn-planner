"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isCloudConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isCloudConfigured: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Caso o Supabase esteja configurado, ouve o estado do usuário real
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Usuário",
            avatarUrl: session.user.user_metadata?.avatar_url,
          });
        }
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Usuário",
            avatarUrl: session.user.user_metadata?.avatar_url,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // 2. Fallback local para desenvolvimento/teste offline
      try {
        const cached = localStorage.getItem("rn_planner_auth_user");
        if (cached) {
          setUser(JSON.parse(cached));
        }
      } catch (e) {
        console.warn("Erro ao ler auth cache local", e);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const signInWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) {
        console.error("Erro ao autenticar com Google no Supabase", error);
      }
    } else {
      // Simulação rápida para dev/teste quando ainda sem chaves da nuvem
      const demoUser: AuthUser = {
        id: "usr-" + Date.now(),
        email: "renan@exemplo.com",
        name: "Renan Britto",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      };
      setUser(demoUser);
      localStorage.setItem("rn_planner_auth_user", JSON.stringify(demoUser));
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem("rn_planner_auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isCloudConfigured: isSupabaseConfigured,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);