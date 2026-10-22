"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.04]" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 dark:border-white/10 hover:border-white/20 dark:hover:border-white/20 bg-white/[0.06] dark:bg-white/[0.06] hover:bg-white/[0.12] dark:hover:bg-white/[0.12] text-slate-800 dark:text-slate-200 transition-all cursor-pointer hover:shadow-sm"
      title={isDark ? "Alternar para Modo Claro" : "Alternar para Modo Obsidian"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
