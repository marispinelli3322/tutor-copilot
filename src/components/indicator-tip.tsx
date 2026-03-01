"use client";

import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocale } from "@/lib/use-locale";
import { getModuleGlossary } from "@/lib/glossary-data";

interface TipProps {
  module: string;
  entry: number;
  children: ReactNode;
}

export function Tip({ module, entry, children }: TipProps) {
  const { locale } = useLocale();
  const mod = getModuleGlossary(locale, module);
  const item = mod?.entries[entry];

  if (!item) {
    return <>{children}</>;
  }

  const descLabel = locale === "en" ? "Description" : "Descrição";
  const formulaLabel = locale === "en" ? "How it's calculated" : "Como é calculado";
  const usageLabel = locale === "en" ? "Who should use" : "Para quem usar";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help items-center gap-1">
            {children}
            <HelpCircle className="h-3.5 w-3.5 text-[#64748B]/60" />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-xs space-y-1.5 bg-[#1E293B] px-3 py-2.5 text-left text-xs text-white"
        >
          <p><strong>{descLabel}:</strong> {item.description}</p>
          <p><strong>{formulaLabel}:</strong> {item.formula}</p>
          <p><strong>{usageLabel}:</strong> {item.usage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
