"use client";

import Link from "next/link";
import { ArrowLeft, Lightbulb, BookOpen, Sparkles, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/use-locale";

export function AboutContent() {
  const { t } = useLocale();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToGames}
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.aboutTitle}</h1>
        <p className="mt-2 text-lg text-[#64748B]">{t.aboutSubtitle}</p>
      </div>

      <div className="space-y-6">
        {/* What it is */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-[#1A365D]">
              <BarChart3 className="h-5 w-5" />
              {t.aboutWhatTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-[#475569]">{t.aboutWhatText}</p>
          </CardContent>
        </Card>

        {/* How to use */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-[#1A365D]">
              <Sparkles className="h-5 w-5" />
              {t.aboutHowTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm leading-relaxed text-[#475569]">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1A365D] text-xs font-bold text-white">1</span>
                {t.aboutHowStep1}
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1A365D] text-xs font-bold text-white">2</span>
                {t.aboutHowStep2}
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1A365D] text-xs font-bold text-white">3</span>
                {t.aboutHowStep3}
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1A365D] text-xs font-bold text-white">4</span>
                {t.aboutHowStep4}
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Available modules */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-[#1A365D]">
              <BookOpen className="h-5 w-5" />
              {t.aboutModulesTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-[#475569]">{t.aboutModulesText}</p>
          </CardContent>
        </Card>

        {/* Tip */}
        <div className="rounded-lg border border-[#C5A832]/30 bg-[#C5A832]/5 px-4 py-3">
          <p className="text-sm text-[#8B7523]">
            <Lightbulb className="mb-0.5 mr-1.5 inline-block h-4 w-4" />
            <strong>{t.aboutTipTitle}:</strong> {t.aboutTipText}
          </p>
        </div>
      </div>
    </main>
  );
}
