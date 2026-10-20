import { createBrowserClient } from "@supabase/ssr";

function cleanEnv(val?: string) {
  if (!val) return "";
  let cleaned = val.trim();
  if (cleaned.includes("=")) {
    cleaned = cleaned.split("=").slice(1).join("=").trim();
  }
  return cleaned.replace(/^["']|["']$/g, "").trim();
}

const DEFAULT_SUPABASE_URL = "https://vmextlzjsambgblssvkn.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_cOchNUmijXgwu0Vxl-7lOw_OFS-RlIy";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = cleanEnv(rawUrl) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = cleanEnv(rawKey) || DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://"))
);

export const supabase = isSupabaseConfigured
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null;
