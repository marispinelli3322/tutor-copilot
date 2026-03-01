"use client";

import Link from "next/link";
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/lib/use-locale";
import { Tip } from "@/components/indicator-tip";
import type { GovernanceData } from "@/lib/types";

interface Props {
  groupId: string;
  gameCode: string;
  period: number;
  maxPeriod: number;
  govData: GovernanceData[];
}

function statusBadge(score: number, labels: { strong: string; medium: string; critical: string }) {
  if (score >= 70)
    return (
      <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="h-3 w-3" />
        {labels.strong}
      </Badge>
    );
  if (score >= 40)
    return (
      <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
        <AlertTriangle className="h-3 w-3" />
        {labels.medium}
      </Badge>
    );
  return (
    <Badge className="gap-1 bg-red-100 text-red-800 hover:bg-red-100">
      <XCircle className="h-3 w-3" />
      {labels.critical}
    </Badge>
  );
}

function formatValue(n: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(n);
}

export function GovernanceContent({ groupId, gameCode, period, maxPeriod, govData }: Props) {
  const { t } = useLocale();
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  const best = govData[0];
  const worst = govData.length > 0 ? govData[govData.length - 1] : null;
  const avg = govData.length > 0 ? govData.reduce((s, d) => s + d.score, 0) / govData.length : 0;

  const statusLabels = { strong: t.govStrong, medium: t.govMedium, critical: t.govCritical };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/game/${groupId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToDashboard}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-[#1A365D]" />
          <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.governanceTitle}</h1>
          <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">{t.quarter} {period}</Badge>
        </div>
        <p className="mt-2 text-[#64748B]">{t.governanceSubtitle(gameCode)}</p>
      </div>

      <div className="mb-8 flex items-center gap-2">
        <span className="text-sm font-medium text-[#64748B]">{t.periodLabel}:</span>
        <div className="flex gap-1">
          {periods.map((p) => (
            <Link key={p} href={`/game/${groupId}/governance?period=${p}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${p === period ? "bg-[#1A365D] text-white" : "bg-white text-[#64748B] hover:bg-[#1A365D]/10 hover:text-[#1A365D]"}`}>
              T{p}
            </Link>
          ))}
        </div>
      </div>

      {govData.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6"><p className="text-sm text-amber-800">{t.noDataForPeriod(period)}</p></CardContent>
        </Card>
      )}

      {govData.length > 0 && (
        <div className="space-y-8">
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.bestScore}</p>
                <p className="mt-1 text-lg font-bold text-green-600">{best?.score.toFixed(1)}</p>
                <p className="text-sm text-[#64748B]">{best?.team}</p>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.worstScore}</p>
                <p className="mt-1 text-lg font-bold text-red-600">{worst?.score.toFixed(1)}</p>
                <p className="text-sm text-[#64748B]">{worst?.team}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.averageScore}</p>
                <p className="mt-1 text-lg font-bold text-[#1A365D]">{avg.toFixed(1)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Score ranking table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{t.governanceTitle} — {t.quarter} {period}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="font-semibold">{t.team}</TableHead>
                    <TableHead className="text-right font-semibold"><Tip module="governance" entry={0}>{t.govScore}</Tip></TableHead>
                    <TableHead className="text-center font-semibold">{t.govStatus}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {govData.map((row) => (
                    <TableRow key={row.teamNumber} className={row === best ? "bg-green-50" : undefined}>
                      <TableCell className="font-medium">{row.team}</TableCell>
                      <TableCell className="text-right font-semibold text-[#1A365D]">{row.score.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{statusBadge(row.score, statusLabels)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Components table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{t.govComponents}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="font-semibold">{t.team}</TableHead>
                    <TableHead className="text-right font-semibold"><Tip module="governance" entry={1}>{t.govCreditoRotativo}</Tip></TableHead>
                    <TableHead className="text-right font-semibold"><Tip module="governance" entry={2}>{t.govDispensas}</Tip></TableHead>
                    <TableHead className="text-right font-semibold"><Tip module="governance" entry={3}>{t.govHorasExtras}</Tip></TableHead>
                    <TableHead className="text-right font-semibold"><Tip module="governance" entry={4}>{t.govCertificacoes}</Tip></TableHead>
                    <TableHead className="text-right font-semibold"><Tip module="governance" entry={5}>{t.govTransparencia}</Tip></TableHead>
                    <TableHead className="text-right font-semibold"><Tip module="governance" entry={6}>{t.govTaxaInfeccao}</Tip></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {govData.map((row) => (
                    <TableRow key={row.teamNumber}>
                      <TableCell className="font-medium">{row.team}</TableCell>
                      <TableCell className="text-right text-xs">{formatValue(row.creditoRotativo)}</TableCell>
                      <TableCell className="text-right text-xs">{formatValue(row.totalDispensa)}</TableCell>
                      <TableCell className="text-right text-xs">{formatValue(row.usoMaoObraExtra)}</TableCell>
                      <TableCell className="text-right text-xs">{formatValue(row.numeroCertificacoes)}</TableCell>
                      <TableCell className="text-right text-xs">{formatValue(row.transparencia)}</TableCell>
                      <TableCell className="text-right text-xs">{formatValue(row.taxaInfeccao)}</TableCell>
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
                  • <strong>{best.team}</strong> {t.bestScore.toLowerCase()}: {best.score.toFixed(1)} — {statusBadge(best.score, statusLabels)}
                </li>
              )}
              {worst && worst !== best && (
                <li>
                  • <strong>{worst.team}</strong> {t.worstScore.toLowerCase()}: {worst.score.toFixed(1)} — {statusBadge(worst.score, statusLabels)}
                </li>
              )}
              <li>
                • {t.averageScore}: {avg.toFixed(1)}
              </li>
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
