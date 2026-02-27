"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { LocaleSwitcher } from "./locale-switcher";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-[#1A365D]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
        <LocaleSwitcher />
      </div>
    </header>
  );
}
