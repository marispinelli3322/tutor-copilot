"use client";

import Link from "next/link";
import { ArrowLeft, HeartPulse, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/lib/use-locale";
import type { QualityData } from "@/lib/types";

interface Props {
  groupId: string;
  gameCode: string;
  period: number;
  maxPeriod: number;
  qualityData: QualityData[];
}

function qualityBadge(status: QualityData["qualityStatus"], labels: { excellent: string; adequate: string; critical: string }) {
  if (status === "excellent")
    return (
      <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="h-3 w-3" />
        {labels.excellent}
      </Badge>
    );
  if (status === "adequate")
    return (
      <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
        <AlertTriangle className="h-3 w-3" />
        {labels.adequate}
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

export function QualityContent({ groupId, gameCode, period, maxPeriod, qualityData }: Props) {
  const { t } = useLocale();
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  const sortedByInfection = [...qualityData].sort((a, b) => a.taxaInfeccao - b.taxaInfeccao);
  const bestInfection = sortedByInfection[0] ?? null;
  const worstInfection = sortedByInfection.length > 0 ? sortedByInfection[sortedByInfection.length - 1] : null;
  const avgCerts = qualityData.length > 0 ? qualityData.reduce((s, d) => s + d.certificacoes, 0) / qualityData.length : 0;

  const statusLabels = { excellent: t.qualityExcellent, adequate: t.qualityAdequate, critical: t.qualityCritical };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/game/${groupId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToDashboard}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-7 w-7 text-[#1A365D]" />
          <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.qualityTitle}</h1>
          <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">{t.quarter} {period}</Badge>
        </div>
        <p className="mt-2 text-[#64748B]">{t.qualitySubtitle(gameCode)}</p>
      </div>

      <div className="mb-8 flex items-center gap-2">
        <span className="text-sm font-medium text-[#64748B]">{t.periodLabel}:</span>
        <div className="flex gap-1">
          {periods.map((p) => (
            <Link key={p} href={`/game/${groupId}/quality?period=${p}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${p === period ? "bg-[#1A365D] text-white" : "bg-white text-[#64748B] hover:bg-[#1A365D]/10 hover:text-[#1A365D]"}`}>
              T{p}
            </Link>
          ))}
        </div>
      </div>

      {qualityData.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6"><p className="text-sm text-amber-800">{t.noDataForPeriod(period)}</p></CardContent>
        </Card>
      )}

      {qualityData.length > 0 && (
        <div className="space-y-8">
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.bestInfection}</p>
                <p className="mt-1 text-lg font-bold text-green-600">{fmt(bestInfection?.taxaInfeccao ?? 0)}</p>
                <p className="text-sm text-[#64748B]">{bestInfection?.team}</p>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.worstInfection}</p>
                <p className="mt-1 text-lg font-bold text-red-600">{fmt(worstInfection?.taxaInfeccao ?? 0)}</p>
                <p className="text-sm text-[#64748B]">{worstInfection?.team}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.avgCertifications}</p>
                <p className="mt-1 text-lg font-bold text-[#1A365D]">{fmt(avgCerts)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Main quality table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{t.qualityTitle} — {t.quarter} {period}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="font-semibold">{t.team}</TableHead>
                    <TableHead className="text-right font-semibold">{t.infectionRate}</TableHead>
                    <TableHead className="text-right font-semibold">{t.certifications}</TableHead>
                    <TableHead className="text-right font-semibold">{t.anvisaAlerts}</TableHead>
                    <TableHead className="text-right font-semibold">{t.anvisaFines}</TableHead>
                    <TableHead className="text-center font-semibold">{t.anvisaInspection}</TableHead>
                    <TableHead className="text-center font-semibold">{t.qualityStatus}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualityData.map((row) => (
                    <TableRow key={row.teamNumber} className={row.qualityStatus === "critical" ? "bg-red-50" : row.qualityStatus === "excellent" ? "bg-green-50" : undefined}>
                      <TableCell className="font-medium">{row.team}</TableCell>
                      <TableCell className="text-right">{fmt(row.taxaInfeccao)}</TableCell>
                      <TableCell className="text-right font-semibold">{Math.round(row.certificacoes)}</TableCell>
                      <TableCell className="text-right">
                        {row.alertaAnvisa > 0 ? (
                          <span className="font-semibold text-amber-600">{Math.round(row.alertaAnvisa)}</span>
                        ) : (
                          <span className="text-[#64748B]">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.multaAnvisa > 0 ? (
                          <span className="font-semibold text-red-600">{fmtCurrency(row.multaAnvisa)}</span>
                        ) : (
                          <span className="text-[#64748B]">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.fiscalizacaoAnvisa > 0 ? (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Sim</Badge>
                        ) : (
                          <span className="text-xs text-[#64748B]">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{qualityBadge(row.qualityStatus, statusLabels)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Investments table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{t.investmentsTable}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="font-semibold">{t.team}</TableHead>
                    <TableHead className="text-right font-semibold">{t.investInfection} ({t.periodLabel2})</TableHead>
                    <TableHead className="text-right font-semibold">{t.investCertification} ({t.periodLabel2})</TableHead>
                    <TableHead className="text-right font-semibold">{t.investWaste}</TableHead>
                    <TableHead className="text-right font-semibold">{t.investInfection} ({t.accumulatedLabel})</TableHead>
                    <TableHead className="text-right font-semibold">{t.investCertification} ({t.accumulatedLabel})</TableHead>
                    <TableHead className="text-right font-semibold">{t.investWaste} ({t.accumulatedLabel})</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualityData.map((row) => (
                    <TableRow key={row.teamNumber}>
                      <TableCell className="font-medium">{row.team}</TableCell>
                      <TableCell className="text-right text-xs">{fmtCurrency(row.investPeriodoInfeccao)}</TableCell>
                      <TableCell className="text-right text-xs">{fmtCurrency(row.investPeriodoCertificacao)}</TableCell>
                      <TableCell className="text-right text-xs">{fmtCurrency(row.gastosLixo)}</TableCell>
                      <TableCell className="text-right text-xs font-semibold">{fmtCurrency(row.investAcumInfeccao)}</TableCell>
                      <TableCell className="text-right text-xs font-semibold">{fmtCurrency(row.investAcumCertificacao)}</TableCell>
                      <TableCell className="text-right text-xs font-semibold">{fmtCurrency(row.investAcumLixo)}</TableCell>
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
              {bestInfection && (
                <li>
                  • <strong>{bestInfection.team}</strong> — melhor taxa de infecção ({fmt(bestInfection.taxaInfeccao)}) — {qualityBadge(bestInfection.qualityStatus, statusLabels)}
                </li>
              )}
              {worstInfection && worstInfection !== bestInfection && (
                <li>
                  • <strong>{worstInfection.team}</strong> — pior taxa de infecção ({fmt(worstInfection.taxaInfeccao)}) — {qualityBadge(worstInfection.qualityStatus, statusLabels)}
                </li>
              )}
              {qualityData.filter((d) => d.qualityStatus === "critical").length > 0 && (
                <li>
                  • {qualityData.filter((d) => d.qualityStatus === "critical").map((d) => d.team).join(", ")} em situação crítica (multas ou alertas ANVISA elevados)
                </li>
              )}
              {qualityData.filter((d) => d.certificacoes > 0).length > 0 && (
                <li>
                  • {qualityData.filter((d) => d.certificacoes > 0).length} equipe{qualityData.filter((d) => d.certificacoes > 0).length > 1 ? "s" : ""} com certificações internacionais
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
