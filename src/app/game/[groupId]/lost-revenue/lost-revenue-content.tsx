"use client";

import Link from "next/link";
import { ArrowLeft, CircleDollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/lib/use-locale";
import type { LostRevenueData } from "@/lib/types";

interface Props {
  groupId: string;
  gameCode: string;
  period: number;
  maxPeriod: number;
  lostRevenueData: LostRevenueData[];
}

function typeBadge(type: "overload" | "idleness" | "balanced", labels: { overload: string; idleness: string; balanced: string }) {
  if (type === "overload")
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{labels.overload}</Badge>;
  if (type === "idleness")
    return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{labels.idleness}</Badge>;
  return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{labels.balanced}</Badge>;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(n);
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "decimal", maximumFractionDigits: 0 }).format(n);
}

export function LostRevenueContent({ groupId, gameCode, period, maxPeriod, lostRevenueData }: Props) {
  const { t } = useLocale();
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  const sortedByLoss = [...lostRevenueData].sort((a, b) => b.totalLostRevenue - a.totalLostRevenue);
  const highestLoss = sortedByLoss[0] ?? null;
  const mostEfficient = sortedByLoss.length > 0 ? sortedByLoss[sortedByLoss.length - 1] : null;
  const aggregateLoss = lostRevenueData.reduce((s, d) => s + d.totalLostRevenue, 0);

  const typeLabels = { overload: t.typeOverload, idleness: t.typeIdleness, balanced: t.typeBalanced };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/game/${groupId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToDashboard}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <CircleDollarSign className="h-7 w-7 text-[#1A365D]" />
          <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.lostRevenueTitle}</h1>
          <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">{t.quarter} {period}</Badge>
        </div>
        <p className="mt-2 text-[#64748B]">{t.lostRevenueSubtitle(gameCode)}</p>
      </div>

      <div className="mb-8 flex items-center gap-2">
        <span className="text-sm font-medium text-[#64748B]">{t.periodLabel}:</span>
        <div className="flex gap-1">
          {periods.map((p) => (
            <Link key={p} href={`/game/${groupId}/lost-revenue?period=${p}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${p === period ? "bg-[#1A365D] text-white" : "bg-white text-[#64748B] hover:bg-[#1A365D]/10 hover:text-[#1A365D]"}`}>
              T{p}
            </Link>
          ))}
        </div>
      </div>

      {lostRevenueData.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6"><p className="text-sm text-amber-800">{t.noDataForPeriod(period)}</p></CardContent>
        </Card>
      )}

      {lostRevenueData.length > 0 && (
        <div className="space-y-8">
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.highestLoss}</p>
                <p className="mt-1 text-lg font-bold text-red-600">{fmtCurrency(highestLoss?.totalLostRevenue ?? 0)}</p>
                <p className="text-sm text-[#64748B]">{highestLoss?.team}</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.mostEfficient}</p>
                <p className="mt-1 text-lg font-bold text-green-600">{fmtCurrency(mostEfficient?.totalLostRevenue ?? 0)}</p>
                <p className="text-sm text-[#64748B]">{mostEfficient?.team}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.aggregateLoss}</p>
                <p className="mt-1 text-lg font-bold text-[#1A365D]">{fmtCurrency(aggregateLoss)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Main lost revenue table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{t.lostRevenueTitle} — {t.quarter} {period}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="font-semibold">{t.team}</TableHead>
                    <TableHead className="text-right font-semibold">{t.lostByOverload}</TableHead>
                    <TableHead className="text-right font-semibold">{t.lostByIdleness}</TableHead>
                    <TableHead className="text-right font-semibold">{t.totalLost}</TableHead>
                    <TableHead className="text-right font-semibold">{t.pctNotCaptured}</TableHead>
                    <TableHead className="text-center font-semibold">{t.dominantTypeLabel}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedByLoss.map((row) => {
                    const overloadTotal = row.services.reduce((s, sv) => s + sv.lostRevenue, 0);
                    const idlenessTotal = row.services.reduce((s, sv) => s + sv.idlenessRevenue, 0);
                    return (
                      <TableRow key={row.teamNumber} className={row.pctRevenueLost > 20 ? "bg-red-50" : undefined}>
                        <TableCell className="font-medium">{row.team}</TableCell>
                        <TableCell className="text-right">{fmtCurrency(overloadTotal)}</TableCell>
                        <TableCell className="text-right">{fmtCurrency(idlenessTotal)}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">{fmtCurrency(row.totalLostRevenue)}</TableCell>
                        <TableCell className="text-right">{fmt(row.pctRevenueLost)}%</TableCell>
                        <TableCell className="text-center">{typeBadge(row.dominantType, typeLabels)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Detail table by service */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{t.lostRevenueDetail}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="font-semibold">{t.team}</TableHead>
                    <TableHead className="font-semibold">Serviço</TableHead>
                    <TableHead className="text-right font-semibold">{t.lostVolume}</TableHead>
                    <TableHead className="text-right font-semibold">{t.revenuePerUnit}</TableHead>
                    <TableHead className="text-right font-semibold">{t.estimatedLoss}</TableHead>
                    <TableHead className="text-right font-semibold">{t.idlenessUnits}</TableHead>
                    <TableHead className="text-center font-semibold">{t.dominantTypeLabel}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lostRevenueData.map((row) =>
                    row.services.map((svc, idx) => (
                      <TableRow key={`${row.teamNumber}-${idx}`}>
                        {idx === 0 && (
                          <TableCell className="font-medium" rowSpan={row.services.length}>{row.team}</TableCell>
                        )}
                        <TableCell className="text-xs">{svc.service}</TableCell>
                        <TableCell className="text-right text-xs">{Math.round(svc.lostVolume)}</TableCell>
                        <TableCell className="text-right text-xs">{fmtCurrency(svc.revenuePerUnit)}</TableCell>
                        <TableCell className="text-right text-xs font-semibold">{fmtCurrency(svc.lostRevenue + svc.idlenessRevenue)}</TableCell>
                        <TableCell className="text-right text-xs">{Math.round(svc.idleness)}</TableCell>
                        <TableCell className="text-center">{typeBadge(svc.dominantType, typeLabels)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Highlights */}
          <div className="rounded-lg border-l-4 border-[#C5A832] bg-[#C5A832]/5 p-4">
            <p className="mb-2 text-sm font-semibold text-[#8B7523]">{t.highlights}</p>
            <ul className="space-y-1 text-sm text-[#1E293B]">
              {highestLoss && (
                <li>
                  • <strong>{highestLoss.team}</strong> — maior perda total: {fmtCurrency(highestLoss.totalLostRevenue)} ({fmt(highestLoss.pctRevenueLost)}% da receita) — {typeBadge(highestLoss.dominantType, typeLabels)}
                </li>
              )}
              {mostEfficient && mostEfficient !== highestLoss && (
                <li>
                  • <strong>{mostEfficient.team}</strong> — menor perda: {fmtCurrency(mostEfficient.totalLostRevenue)} ({fmt(mostEfficient.pctRevenueLost)}% da receita)
                </li>
              )}
              <li>
                • Perda agregada do grupo: <strong>{fmtCurrency(aggregateLoss)}</strong>
              </li>
              {lostRevenueData.filter((d) => d.dominantType === "overload").length > 0 && (
                <li>
                  • {lostRevenueData.filter((d) => d.dominantType === "overload").map((d) => d.team).join(", ")} — perda predominante por sobrecarga
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
