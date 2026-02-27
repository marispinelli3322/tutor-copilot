"use client";

import Link from "next/link";
import { Activity } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1A365D]">
            <Activity className="h-5 w-5 text-[#C5A832]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-[#1A365D]">
              Tutor Co-Pilot
            </span>
            <span className="ml-2 text-xs font-medium text-[#64748B]">
              by Simulation
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
