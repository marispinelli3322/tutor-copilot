"use client";

import Link from "next/link";
import { ArrowLeft, Target, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/lib/use-locale";
import type { StrategyAlignmentData } from "@/lib/types";

interface Props {
  groupId: string;
  gameCode: string;
  period: number;
  maxPeriod: number;
  strategyData: StrategyAlignmentData[];
}

function fmt(n: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(n);
}

function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, notation: "compact" }).format(n);
  if (Math.abs(n) >= 1_000) return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(n);
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(n);
}

export function StrategyContent({ groupId, gameCode, period, maxPeriod, strategyData }: Props) {
  const { t } = useLocale();
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  const best = strategyData[0] ?? null;
  const worst = strategyData.length > 0 ? strategyData[strategyData.length - 1] : null;

  // Get item names from first team's data
  const itemNames = strategyData.length > 0 ? strategyData[0].items.map((i) => i.itemName) : [];

  // Most prioritized item across all teams
  const itemWeightSums: Record<string, number> = {};
  for (const team of strategyData) {
    for (const item of team.items) {
      itemWeightSums[item.itemName] = (itemWeightSums[item.itemName] || 0) + item.weight;
    }
  }
  const mostPrioritized = Object.entries(itemWeightSums).sort((a, b) => b[1] - a[1])[0];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/game/${groupId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToDashboard}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Target className="h-7 w-7 text-[#1A365D]" />
          <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.strategyTitle}</h1>
          <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">{t.quarter} {period}</Badge>
        </div>
        <p className="mt-2 text-[#64748B]">{t.strategySubtitle(gameCode)}</p>
      </div>

      <div className="mb-8 flex items-center gap-2">
        <span className="text-sm font-medium text-[#64748B]">{t.periodLabel}:</span>
        <div className="flex gap-1">
          {periods.map((p) => (
            <Link key={p} href={`/game/${groupId}/strategy?period=${p}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${p === period ? "bg-[#1A365D] text-white" : "bg-white text-[#64748B] hover:bg-[#1A365D]/10 hover:text-[#1A365D]"}`}>
              T{p}
            </Link>
          ))}
        </div>
      </div>

      {strategyData.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6"><p className="text-sm text-amber-800">{t.noDataForPeriod(period)}</p></CardContent>
        </Card>
      )}

      {strategyData.length > 0 && (
        <div className="space-y-8">
          {/* Alignment score summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.bestAlignment}</p>
                <p className="mt-1 text-lg font-bold text-green-600">{fmt(best?.alignmentScore ?? 0)}%</p>
                <p className="text-sm text-[#64748B]">{best?.team}</p>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.worstAlignment}</p>
                <p className="mt-1 text-lg font-bold text-red-600">{fmt(worst?.alignmentScore ?? 0)}%</p>
                <p className="text-sm text-[#64748B]">{worst?.team}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.mostPrioritized}</p>
                <p className="mt-1 text-lg font-bold text-[#1A365D]">{mostPrioritized?.[0] ?? "—"}</p>
                <p className="text-sm text-[#64748B]">{t.strategyWeight}: {mostPrioritized?.[1] ?? 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Alignment score table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{t.alignmentScore} — {t.quarter} {period}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="font-semibold">{t.team}</TableHead>
                    {itemNames.map((name) => (
                      <TableHead key={name} className="text-center font-semibold text-xs">{name}</TableHead>
                    ))}
                    <TableHead className="text-right font-semibold">{t.alignmentScore}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strategyData.map((row) => (
                    <TableRow key={row.teamNumber}>
                      <TableCell className="font-medium">{row.team}</TableCell>
                      {row.items.map((item) => (
                        <TableCell key={item.variableCode} className="text-center p-1">
                          <div className={`rounded px-1 py-0.5 text-xs ${item.weight >= 2 ? (item.aligned ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800") : "bg-gray-50 text-[#64748B]"}`}>
                            <span className="font-semibold">{item.weight}</span>
                            <span className="mx-0.5">·</span>
                            <span>{item.ranking}&ordm;</span>
                            {item.weight >= 2 && (
                              item.aligned
                                ? <CheckCircle className="ml-0.5 inline h-3 w-3" />
                                : <XCircle className="ml-0.5 inline h-3 w-3" />
                            )}
                          </div>
                        </TableCell>
                      ))}
                      <TableCell className="text-right font-semibold text-[#1A365D]">{fmt(row.alignmentScore)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Weight distribution table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{t.weightDistribution}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="font-semibold">{t.team}</TableHead>
                    {itemNames.map((name) => (
                      <TableHead key={name} className="text-center font-semibold text-xs">{name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strategyData.map((row) => (
                    <TableRow key={row.teamNumber}>
                      <TableCell className="font-medium">{row.team}</TableCell>
                      {row.items.map((item) => (
                        <TableCell key={item.variableCode} className="text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-sm font-semibold text-[#1A365D]">{item.weight}</span>
                            <span className="text-xs text-[#64748B]">{fmtCompact(item.value)}</span>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Highlights */}
          <div className="rounded-lg border-l-4 border-[#C5A832] bg-[#C5A832]/5 p-4">
            <p className="mb-2 text-sm font-semibold text-[#8B7523]">{t.highlights}</p>
            <ul className="space-y-1 text-sm text-[#1E293B]">
              {best && (
                <li>
                  • <strong>{best.team}</strong> — {t.bestAlignment}: {fmt(best.alignmentScore)}%
                </li>
              )}
              {worst && worst !== best && (
                <li>
                  • <strong>{worst.team}</strong> — {t.worstAlignment}: {fmt(worst.alignmentScore)}%
                </li>
              )}
              {mostPrioritized && (
                <li>
                  • {t.mostPrioritized}: <strong>{mostPrioritized[0]}</strong> (peso total: {mostPrioritized[1]})
                </li>
              )}
              {strategyData.filter((d) => d.alignmentScore < 50).length > 0 && (
                <li>
                  • {strategyData.filter((d) => d.alignmentScore < 50).map((d) => d.team).join(", ")} com alinhamento abaixo de 50% — prioridades não refletem resultados
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
