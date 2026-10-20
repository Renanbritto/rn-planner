import { cookies } from "next/headers";
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

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const supabaseKey = cleanEnv(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith("http")) {
      const cookieStore = await cookies();
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore
            }
          },
        },
      });

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error("Erro no callback de autenticação Supabase:", error);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}