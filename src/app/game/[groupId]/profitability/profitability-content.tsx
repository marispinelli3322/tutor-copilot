"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/lib/use-locale";
import type { ProfitabilityData } from "@/lib/types";

interface Props {
  groupId: string;
  gameCode: string;
  period: number;
  maxPeriod: number;
  profData: ProfitabilityData[];
}

function formatCurrency(n: number, locale: string): string {
  const prefix = locale === "en" ? "$" : "R$";
  if (Math.abs(n) >= 1_000_000) return `${prefix} ${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${prefix} ${(n / 1_000).toFixed(0)}k`;
  return `${prefix} ${Math.round(n)}`;
}

function marginColor(pct: number): string {
  if (pct >= 40) return "text-green-700 font-bold";
  if (pct >= 25) return "text-green-600 font-semibold";
  if (pct >= 10) return "text-amber-600 font-semibold";
  if (pct >= 0) return "text-red-500 font-semibold";
  return "text-red-700 font-bold";
}

export function ProfitabilityContent({ groupId, gameCode, period, maxPeriod, profData }: Props) {
  const { locale, t } = useLocale();
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  const services = ["Pronto Atendimento", "Internação sem Cirurgia", "Cirurgia / Alta Complexidade"];
  const svcNames: Record<string, string> = {
    "Pronto Atendimento": t.svcEmergency,
    "Internação sem Cirurgia": t.svcInpatient,
    "Cirurgia / Alta Complexidade": t.svcSurgery,
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/game/${groupId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToDashboard}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.profitabilityTitle}</h1>
          <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">{t.quarter} {period}</Badge>
        </div>
        <p className="mt-2 text-[#64748B]">{t.profitabilitySubtitle(gameCode)}</p>
      </div>

      <div className="mb-8 flex items-center gap-2">
        <span className="text-sm font-medium text-[#64748B]">{t.periodLabel}:</span>
        <div className="flex gap-1">
          {periods.map((p) => (
            <Link key={p} href={`/game/${groupId}/profitability?period=${p}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${p === period ? "bg-[#1A365D] text-white" : "bg-white text-[#64748B] hover:bg-[#1A365D]/10 hover:text-[#1A365D]"}`}>
              T{p}
            </Link>
          ))}
        </div>
      </div>

      {profData.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6"><p className="text-sm text-amber-800">{t.noDataForPeriod(period)}</p></CardContent>
        </Card>
      )}

      {profData.length > 0 && (
        <div className="space-y-8">
          {services.map((svcLabel) => {
            const svcData = profData.filter((d) => d.service === svcLabel).sort((a, b) => b.marginPercent - a.marginPercent);
            if (svcData.length === 0) return null;

            const best = svcData[0];
            const worst = svcData[svcData.length - 1];
            const avgMargin = svcData.reduce((s, d) => s + d.marginPercent, 0) / svcData.length;
            const displayName = svcNames[svcLabel] || svcLabel;

            return (
              <div key={svcLabel}>
                <Card className="overflow-hidden">
                  <CardHeader className="bg-[#1A365D] py-3">
                    <CardTitle className="text-base text-white">{displayName}</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#F8FAFC]">
                          <TableHead className="font-semibold">{t.team}</TableHead>
                          <TableHead className="text-right font-semibold">{t.grossRevenue}</TableHead>
                          <TableHead className="text-right font-semibold">{t.disallowances}</TableHead>
                          <TableHead className="text-right font-semibold">{t.defaults}</TableHead>
                          <TableHead className="text-right font-semibold">{t.netRevenue}</TableHead>
                          <TableHead className="text-right font-semibold">{t.inputCosts}</TableHead>
                          <TableHead className="text-right font-semibold">{t.laborCosts}</TableHead>
                          <TableHead className="text-right font-semibold">{t.contributionMargin}</TableHead>
                          <TableHead className="text-right font-semibold">{t.marginPct}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {svcData.map((row) => (
                          <TableRow key={row.teamNumber}>
                            <TableCell className="font-medium">{row.team}</TableCell>
                            <TableCell className="text-right text-xs">{formatCurrency(row.totalRevenue, locale)}</TableCell>
                            <TableCell className="text-right text-xs text-red-500">{formatCurrency(row.disallowances, locale)}</TableCell>
                            <TableCell className="text-right text-xs text-red-500">{formatCurrency(row.defaults, locale)}</TableCell>
                            <TableCell className="text-right text-xs">{formatCurrency(row.netRevenue, locale)}</TableCell>
                            <TableCell className="text-right text-xs">{formatCurrency(row.inputCosts, locale)}</TableCell>
                            <TableCell className="text-right text-xs">{formatCurrency(row.laborCosts, locale)}</TableCell>
                            <TableCell className="text-right text-xs font-semibold">{formatCurrency(row.contributionMargin, locale)}</TableCell>
                            <TableCell className={`text-right ${marginColor(row.marginPercent)}`}>{row.marginPercent.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="mt-3 rounded-lg border-l-4 border-[#C5A832] bg-[#C5A832]/5 p-4">
                  <p className="mb-2 text-sm font-semibold text-[#8B7523]">{t.highlights}</p>
                  <ul className="space-y-1 text-sm text-[#1E293B]">
                    <li>
                      • {t.bestMargin}: <strong>{best.team}</strong> — {best.marginPercent.toFixed(1)}% ({t.contributionMargin} {formatCurrency(best.contributionMargin, locale)})
                    </li>
                    <li>
                      • {t.worstMargin}: <strong>{worst.team}</strong> — {worst.marginPercent.toFixed(1)}%
                      {worst.marginPercent < 0 ? ` — ${t.operatingAtLoss}` : ""}
                    </li>
                    <li>
                      • {t.groupAvg}: {avgMargin.toFixed(1)}% {t.contributionMarginIn} {displayName}
                    </li>
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
