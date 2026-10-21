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

function cleanUrl(val?: string) {
  let cleaned = cleanEnv(val);
  if (!cleaned || cleaned.includes("your-project") || cleaned.includes("your-supabase-url")) {
    return DEFAULT_SUPABASE_URL;
  }
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = `https://${cleaned}`;
  }
  cleaned = cleaned.replace("supabse.co", "supabase.co");
  return cleaned;
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
