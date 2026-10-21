import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://vmextlzjsambgblssvkn.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_cOchNUmijXgwu0Vxl-7lOw_OFS-RlIy";

function cleanEnv(val?: string) {
  if (!val) return "";
  let cleaned = val.trim();
  if (cleaned.includes("=")) {
    cleaned = cleaned.split("=").slice(1).join("=").trim();
  }
  return cleaned.replace(/^["']|["']$/g, "").trim();
}

function cleanUrl(val?: string): string {
  if (!val) return DEFAULT_SUPABASE_URL;
  const str = val.trim().replace("supabse.co", "supabase.co");
  const match = str.match(/([a-z0-9_-]+\.supabase\.co)/i);
  if (match) {
    return `https://${match[1]}`;
  }
  return DEFAULT_SUPABASE_URL;
}

export const createClient = () => {
  const url = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key =
    cleanEnv(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) || DEFAULT_SUPABASE_KEY;

  return createBrowserClient(url, key);
};
