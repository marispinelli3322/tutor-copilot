"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, LogOut, FileText } from "lucide-react";
import { LocaleSwitcher } from "./locale-switcher";
import { useLocale } from "@/lib/use-locale";

interface HeaderProps {
  userName?: string;
}

export function Header({ userName }: HeaderProps) {
  const router = useRouter();
  const { t } = useLocale();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-[#1A365D]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <Activity className="h-5 w-5 text-[#C5A832]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                Tutor Co-Pilot
              </span>
              <span className="ml-2 text-xs font-medium text-white/50">
                by Simulation
              </span>
            </div>
          </Link>
          <Link
            href="/about"
            className="flex items-center gap-1.5 rounded-md border border-[#C5A832]/40 bg-[#C5A832]/10 px-3 py-1.5 text-sm font-medium text-[#C5A832] transition-colors hover:border-[#C5A832] hover:bg-[#C5A832]/20"
          >
            <FileText className="h-4 w-4" />
            {t.executiveSummary}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          {userName && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/80">{userName}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                title="Sair"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
