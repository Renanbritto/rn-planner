import { createBrowserClient } from "@supabase/ssr";

function cleanEnv(val?: string) {
  if (!val) return "";
  let cleaned = val.trim();
  if (cleaned.includes("=")) {
    cleaned = cleaned.split("=").slice(1).join("=").trim();
  }
  return cleaned.replace(/^["']|["']$/g, "").trim();
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = cleanEnv(rawUrl);
const supabaseAnonKey = cleanEnv(rawKey);

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://")) &&
  !supabaseUrl.includes("your-supabase-url") &&
  !supabaseUrl.includes("your-project")
);

export const supabase = isSupabaseConfigured
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null;
