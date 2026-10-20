import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const redirectBase = isLocalEnv
    ? origin
    : forwardedHost
    ? `https://${forwardedHost}`
    : origin;

  if (code) {
    const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
    const supabaseKey = cleanEnv(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) || DEFAULT_SUPABASE_KEY;

    if (supabaseUrl && supabaseKey) {
      const response = NextResponse.redirect(`${redirectBase}${next}`);
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            const cookieHeader = request.headers.get("cookie") ?? "";
            return cookieHeader
              .split(";")
              .map((c) => c.trim().split("="))
              .filter(([name]) => Boolean(name))
              .map(([name, ...rest]) => ({ name, value: rest.join("=") }));
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      });

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return response;
      }
      console.error("Erro no callback de autenticação Supabase:", error);
    }
  }

  return NextResponse.redirect(`${redirectBase}${next}`);
}