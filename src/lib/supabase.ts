import { createClient } from "@/utils/supabase/client";

export const supabase = createClient();
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vmextlzjsambgblssvkn.supabase.co"
);

export { createClient };
