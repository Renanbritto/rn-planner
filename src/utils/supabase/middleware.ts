import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

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
  if (!cleaned) return "https://vmextlzjsambgblssvkn.supabase.co";
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = `https://${cleaned}`;
  }
  cleaned = cleaned.replace("supabse.co", "supabase.co");
  return cleaned;
}

const supabaseUrl = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseKey = cleanEnv(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) || "sb_publishable_cOchNUmijXgwu0Vxl-7lOw_OFS-RlIy";

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!supabaseUrl.startsWith("http") || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  return supabaseResponse;
};
