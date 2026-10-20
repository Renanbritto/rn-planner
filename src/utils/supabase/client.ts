import { createBrowserClient } from "@supabase/ssr";

function cleanEnv(val?: string) {
  if (!val) return "";
  let cleaned = val.trim();
  if (cleaned.includes("=")) {
    cleaned = cleaned.split("=").slice(1).join("=").trim();
  }
  return cleaned.replace(/^["']|["']$/g, "").trim();
}

const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseKey = cleanEnv(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const createClient = () => {
  if (!supabaseUrl.startsWith("http")) {
    throw new Error("Supabase URL must be a valid HTTP or HTTPS URL");
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
};
