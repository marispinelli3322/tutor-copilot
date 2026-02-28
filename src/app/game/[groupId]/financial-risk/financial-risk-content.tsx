"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/lib/use-locale";
import type { FinancialRiskData } from "@/lib/types";

interface Props {
  groupId: string;
  gameCode: string;
  period: number;
  maxPeriod: number;
  riskData: FinancialRiskData[];
}

function riskBadge(status: FinancialRiskData["riskStatus"], labels: { healthy: string; attention: string; critical: string }) {
  if (status === "healthy")
    return (
      <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="h-3 w-3" />
        {labels.healthy}
      </Badge>
    );
  if (status === "attention")
    return (
      <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
        <AlertTriangle className="h-3 w-3" />
        {labels.attention}
      </Badge>
    );
  return (
    <Badge className="gap-1 bg-red-100 text-red-800 hover:bg-red-100">
      <XCircle className="h-3 w-3" />
      {labels.critical}
    </Badge>
  );
}

function fmt(n: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(n);
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "decimal", maximumFractionDigits: 0 }).format(n);
}

export function FinancialRiskContent({ groupId, gameCode, period, maxPeriod, riskData }: Props) {
  const { t } = useLocale();
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  const sorted = [...riskData].sort((a, b) => b.capitalCirculanteLiq - a.capitalCirculanteLiq);
  const bestNwc = sorted[0] ?? null;
  const worstNwc = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const teamsInRevolving = riskData.filter((d) => d.creditoRotativo > 0).length;

  const riskLabels = { healthy: t.riskHealthy, attention: t.riskAttention, critical: t.riskCritical };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/game/${groupId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToDashboard}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-7 w-7 text-[#1A365D]" />
          <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.financialRiskTitle}</h1>
          <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">{t.quarter} {period}</Badge>
        </div>
        <p className="mt-2 text-[#64748B]">{t.financialRiskSubtitle(gameCode)}</p>
      </div>

      <div className="mb-8 flex items-center gap-2">
        <span className="text-sm font-medium text-[#64748B]">{t.periodLabel}:</span>
        <div className="flex gap-1">
          {periods.map((p) => (
            <Link key={p} href={`/game/${groupId}/financial-risk?period=${p}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${p === period ? "bg-[#1A365D] text-white" : "bg-white text-[#64748B] hover:bg-[#1A365D]/10 hover:text-[#1A365D]"}`}>
              T{p}
            </Link>
          ))}
        </div>
      </div>

      {riskData.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6"><p className="text-sm text-amber-800">{t.noDataForPeriod(period)}</p></CardContent>
        </Card>
      )}

      {riskData.length > 0 && (
        <div className="space-y-8">
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.bestNwc}</p>
                <p className="mt-1 text-lg font-bold text-green-600">{fmtCurrency(bestNwc?.capitalCirculanteLiq ?? 0)}</p>
                <p className="text-sm text-[#64748B]">{bestNwc?.team}</p>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.worstNwc}</p>
                <p className="mt-1 text-lg font-bold text-red-600">{fmtCurrency(worstNwc?.capitalCirculanteLiq ?? 0)}</p>
                <p className="text-sm text-[#64748B]">{worstNwc?.team}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.teamsInRevolving}</p>
                <p className="mt-1 text-lg font-bold text-[#1A365D]">{teamsInRevolving} / {riskData.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Main risk table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{t.financialRiskTitle} — {t.quarter} {period}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="font-semibold">{t.team}</TableHead>
                    <TableHead className="text-right font-semibold">{t.cashBalance}</TableHead>
                    <TableHead className="text-right font-semibold">{t.nwc}</TableHead>
                    <TableHead className="text-right font-semibold">{t.leverage}</TableHead>
                    <TableHead className="text-right font-semibold">{t.revolvingCredit}</TableHead>
                    <TableHead className="text-right font-semibold">{t.cashCoverage}</TableHead>
                    <TableHead className="text-center font-semibold">{t.riskStatusLabel}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskData.map((row) => (
                    <TableRow key={row.teamNumber} className={row.riskStatus === "critical" ? "bg-red-50" : row.riskStatus === "attention" ? "bg-amber-50" : undefined}>
                      <TableCell className="font-medium">{row.team}</TableCell>
                      <TableCell className="text-right">{fmtCurrency(row.saldoFinal)}</TableCell>
                      <TableCell className={`text-right font-semibold ${row.capitalCirculanteLiq < 0 ? "text-red-600" : "text-[#1A365D]"}`}>
                        {fmtCurrency(row.capitalCirculanteLiq)}
                      </TableCell>
                      <TableCell className="text-right">{fmt(row.alavancagem)}x</TableCell>
                      <TableCell className="text-right">
                        {row.creditoRotativo > 0 ? fmtCurrency(row.creditoRotativo) : "—"}
                      </TableCell>
                      <TableCell className="text-right">{fmt(row.coberturaCaixa)}%</TableCell>
                      <TableCell className="text-center">{riskBadge(row.riskStatus, riskLabels)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Details table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{t.financialDetails}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="font-semibold">{t.team}</TableHead>
                    <TableHead className="text-right font-semibold">{t.cashVariation}</TableHead>
                    <TableHead className="text-right font-semibold">{t.utilizationPct}</TableHead>
                    <TableHead className="text-right font-semibold">{t.revolvingCost}</TableHead>
                    <TableHead className="text-right font-semibold">{t.loanInterest}</TableHead>
                    <TableHead className="text-right font-semibold">{t.loanRate}</TableHead>
                    <TableHead className="text-center font-semibold">{t.emergencyPlan}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskData.map((row) => (
                    <TableRow key={row.teamNumber}>
                      <TableCell className="font-medium">{row.team}</TableCell>
                      <TableCell className={`text-right ${row.variacaoCaixa < 0 ? "text-red-600" : "text-green-600"}`}>
                        {row.variacaoCaixa >= 0 ? "+" : ""}{fmtCurrency(row.variacaoCaixa)}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {row.creditoRotativo > 0 ? `${fmt(row.utilizacaoCreditoRotativo)}%` : "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {row.despesaCreditoRotativo > 0 ? fmtCurrency(row.despesaCreditoRotativo) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs">{fmtCurrency(row.despesaEmprestimo)}</TableCell>
                      <TableCell className="text-right text-xs">{fmt(row.taxaJurosEmprestimo)}%</TableCell>
                      <TableCell className="text-center">
                        {row.planoEmergencial > 0 ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{t.emergencyPlanActive}</Badge>
                        ) : (
                          <span className="text-xs text-[#64748B]">{t.emergencyPlanInactive}</span>
                        )}
                      </TableCell>
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
              {bestNwc && (
                <li>
                  • <strong>{bestNwc.team}</strong> — {t.bestNwc}: {fmtCurrency(bestNwc.capitalCirculanteLiq)} — {riskBadge(bestNwc.riskStatus, riskLabels)}
                </li>
              )}
              {worstNwc && worstNwc !== bestNwc && (
                <li>
                  • <strong>{worstNwc.team}</strong> — {t.worstNwc}: {fmtCurrency(worstNwc.capitalCirculanteLiq)} — {riskBadge(worstNwc.riskStatus, riskLabels)}
                </li>
              )}
              {riskData.filter((d) => d.riskStatus === "critical").length > 0 && (
                <li>
                  • {riskData.filter((d) => d.riskStatus === "critical").map((d) => d.team).join(", ")} em situação crítica (CCL negativo ou plano emergencial)
                </li>
              )}
              {teamsInRevolving > 0 && (
                <li>
                  • {teamsInRevolving} equipe{teamsInRevolving > 1 ? "s" : ""} usando crédito rotativo
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
