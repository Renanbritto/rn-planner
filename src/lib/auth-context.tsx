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
  isGuestMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string; message?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  switchAccount: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  exitGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isCloudConfigured: false,
  isGuestMode: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ error: "Não inicializado" }),
  signUpWithEmail: async () => ({ error: "Não inicializado" }),
  resetPassword: async () => ({ error: "Não inicializado" }),
  switchAccount: async () => {},
  signOut: async () => {},
  continueAsGuest: () => {},
  exitGuestMode: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem("rn_planner_guest_mode") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.removeItem("rn_planner_auth_user");
    } catch {
      // Ignore
    }

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name:
              session.user.user_metadata?.full_name ||
              session.user.email?.split("@")[0] ||
              "Usuário",
            avatarUrl: session.user.user_metadata?.avatar_url,
          });
          setIsGuestMode(false);
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
            name:
              session.user.user_metadata?.full_name ||
              session.user.email?.split("@")[0] ||
              "Usuário",
            avatarUrl: session.user.user_metadata?.avatar_url,
          });
          setIsGuestMode(false);
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      queueMicrotask(() => setLoading(false));
    }
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (!supabase) {
        alert("Cliente Supabase não inicializado.");
        return;
      }
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) {
        console.error("Erro ao autenticar com Google no Supabase:", error);
        alert(`Erro de autenticação: ${error.message}`);
      }
    } catch (err: unknown) {
      console.error("Erro inesperado no login:", err);
      alert(`Erro inesperado: ${(err as Error)?.message || err}`);
    }
  };

  const switchAccount = async () => {
    try {
      if (!supabase) {
        alert("Cliente Supabase não inicializado.");
        return;
      }
      const redirectUrl = `${window.location.origin}/auth/callback`;
      // Faz logout prévio para limpar cookies de sessão e abre seletor de contas do Google
      await supabase.auth.signOut();
      setUser(null);
      setIsGuestMode(false);
      try {
        sessionStorage.removeItem("rn_planner_guest_mode");
      } catch {
        // Ignore
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (error) {
        console.error("Erro ao alternar de conta no Google:", error);
        alert(`Erro ao alternar conta: ${error.message}`);
      }
    } catch (err: unknown) {
      console.error("Erro inesperado ao alternar de conta:", err);
      alert(`Erro inesperado: ${(err as Error)?.message || err}`);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsGuestMode(false);
    try {
      sessionStorage.removeItem("rn_planner_guest_mode");
    } catch {
      // Ignore
    }
  };

  const continueAsGuest = () => {
    setIsGuestMode(true);
    try {
      sessionStorage.setItem("rn_planner_guest_mode", "true");
    } catch {
      // Ignore
    }
  };

  const exitGuestMode = () => {
    setIsGuestMode(false);
    try {
      sessionStorage.removeItem("rn_planner_guest_mode");
    } catch {
      // Ignore
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      if (!supabase) {
        return { error: "Serviço de autenticação não configurado." };
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        return { error: error.message };
      }
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name:
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0] ||
            "Usuário",
          avatarUrl: data.user.user_metadata?.avatar_url,
        });
        setIsGuestMode(false);
      }
      return {};
    } catch (err: unknown) {
      return { error: (err as Error)?.message || "Erro ao conectar." };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      if (!supabase) {
        return { error: "Serviço de autenticação não configurado." };
      }
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) {
        return { error: error.message };
      }
      if (data.session && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name:
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0] ||
            "Usuário",
          avatarUrl: data.user.user_metadata?.avatar_url,
        });
        setIsGuestMode(false);
        return {};
      }
      return { message: "Cadastro realizado! Verifique seu e-mail para confirmar a conta." };
    } catch (err: unknown) {
      return { error: (err as Error)?.message || "Erro ao cadastrar." };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!supabase) {
        return { error: "Serviço de autenticação não configurado." };
      }
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });
      if (error) {
        return { error: error.message };
      }
      return { message: "Link de recuperação enviado para o seu e-mail!" };
    } catch (err: unknown) {
      return { error: (err as Error)?.message || "Erro ao enviar recuperação." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isCloudConfigured: isSupabaseConfigured,
        isGuestMode,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        switchAccount,
        signOut,
        continueAsGuest,
        exitGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);