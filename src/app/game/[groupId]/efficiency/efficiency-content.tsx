"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/lib/use-locale";
import { Tip } from "@/components/indicator-tip";
import type { ServiceEfficiency, ServiceEfficiencyReport } from "@/lib/types";

interface Props {
  groupId: string;
  gameCode: string;
  period: number;
  maxPeriod: number;
  efficiency: Record<string, ServiceEfficiencyReport>;
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(Math.round(n));
}

export function EfficiencyContent({ groupId, gameCode, period, maxPeriod, efficiency }: Props) {
  const { locale, t } = useLocale();
  const serviceKeys = ["emergency", "inpatient", "surgery"];
  const hasData = serviceKeys.some((k) => efficiency[k]?.teams?.length > 0);
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  const svcNames: Record<string, string> = {
    emergency: t.svcEmergency,
    inpatient: t.svcInpatient,
    surgery: t.svcSurgery,
  };

  function getStatusBadge(row: ServiceEfficiency) {
    if (row.status === "overload")
      return <Badge className="gap-1 bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3" />{t.statusOverload}</Badge>;
    if (row.status === "overcapacity")
      return <Badge className="gap-1 bg-amber-100 text-amber-800"><MinusCircle className="h-3 w-3" />{t.statusIdle}</Badge>;
    return <Badge className="gap-1 bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" />{t.statusOk}</Badge>;
  }

  // Generate takeaways in the right language
  function getTakeaways(key: string, report: ServiceEfficiencyReport): string[] {
    const overloaded = report.teams.filter((t) => t.unmetDemand > 0);
    const idle = report.teams.filter((t) => t.status === "overcapacity");
    const takeaways: string[] = [];
    const svc = svcNames[key] || report.service;

    if (locale === "en") {
      if (overloaded.length > 0) {
        const names = overloaded.map((t) => t.team).join(", ");
        const totalLost = overloaded.reduce((s, t) => s + t.unmetDemand, 0);
        takeaways.push(`${names} ${overloaded.length > 1 ? "are" : "is"} overloaded in ${svc} — ${totalLost.toLocaleString()} patients lost this quarter.`);
      }
      if (idle.length > 0) {
        const names = idle.map((t) => t.team).join(", ");
        takeaways.push(`${names} ${idle.length > 1 ? "operate" : "operates"} with high idle capacity in ${svc} — underutilized capacity generates fixed costs without corresponding revenue.`);
      }
      if (overloaded.length === 0 && idle.length === 0) {
        takeaways.push(`All teams operate within adequate range in ${svc}.`);
      }
    } else {
      if (overloaded.length > 0) {
        const names = overloaded.map((t) => t.team).join(", ");
        const totalLost = overloaded.reduce((s, t) => s + t.unmetDemand, 0);
        takeaways.push(`${names} ${overloaded.length > 1 ? "estão" : "está"} com sobrecarga em ${svc} — ${totalLost.toLocaleString("pt-BR")} atendimentos perdidos no trimestre.`);
      }
      if (idle.length > 0) {
        const names = idle.map((t) => t.team).join(", ");
        takeaways.push(`${names} opera${idle.length > 1 ? "m" : ""} com alta ociosidade em ${svc} — capacidade subutilizada gera custo fixo sem receita correspondente.`);
      }
      if (overloaded.length === 0 && idle.length === 0) {
        takeaways.push(`Todas as equipes operam dentro da faixa adequada em ${svc}.`);
      }
    }
    return takeaways;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/game/${groupId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToDashboard}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.efficiencyTitle}</h1>
          <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">{t.quarter} {period}</Badge>
        </div>
        <p className="mt-2 text-[#64748B]">{t.efficiencySubtitle(gameCode)}</p>
      </div>

      <div className="mb-8 flex items-center gap-2">
        <span className="text-sm font-medium text-[#64748B]">{t.periodLabel}:</span>
        <div className="flex gap-1">
          {periods.map((p) => (
            <Link key={p} href={`/game/${groupId}/efficiency?period=${p}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${p === period ? "bg-[#1A365D] text-white" : "bg-white text-[#64748B] hover:bg-[#1A365D]/10 hover:text-[#1A365D]"}`}>
              T{p}
            </Link>
          ))}
        </div>
      </div>

      {!hasData && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6"><p className="text-sm text-amber-800">{t.noDataForPeriod(period)}</p></CardContent>
        </Card>
      )}

      {hasData && (
        <div className="space-y-8">
          {serviceKeys.map((key) => {
            const report = efficiency[key];
            if (!report || report.teams.length === 0) return null;
            const sorted = [...report.teams].sort((a, b) => b.utilizationRate - a.utilizationRate);
            const takeaways = getTakeaways(key, report);

            return (
              <div key={key}>
                <Card className="overflow-hidden">
                  <CardHeader className="bg-[#1A365D] py-3">
                    <CardTitle className="text-base text-white">{svcNames[key]}</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#F8FAFC]">
                          <TableHead className="font-semibold">{t.team}</TableHead>
                          <TableHead className="text-right font-semibold"><Tip module="efficiency" entry={0}>{t.capacity}</Tip></TableHead>
                          <TableHead className="text-right font-semibold"><Tip module="efficiency" entry={1}>{t.attended}</Tip></TableHead>
                          <TableHead className="text-right font-semibold"><Tip module="efficiency" entry={2}>{t.utilization}</Tip></TableHead>
                          <TableHead className="text-right font-semibold"><Tip module="efficiency" entry={3}>{t.lostDemand}</Tip></TableHead>
                          <TableHead className="text-center font-semibold"><Tip module="efficiency" entry={4}>{t.status}</Tip></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sorted.map((row) => (
                          <TableRow key={row.teamNumber}>
                            <TableCell className="font-medium">{row.team}</TableCell>
                            <TableCell className="text-right">{formatNumber(row.capacity)}</TableCell>
                            <TableCell className="text-right">{formatNumber(row.volumeServed)}</TableCell>
                            <TableCell className="text-right font-semibold">{row.utilizationRate.toFixed(1)}%</TableCell>
                            <TableCell className="text-right">
                              {row.unmetDemand > 0 ? <span className="font-semibold text-red-600">{formatNumber(row.unmetDemand)}</span> : <span className="text-green-600">0</span>}
                            </TableCell>
                            <TableCell className="text-center">{getStatusBadge(row)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {takeaways.length > 0 && (
                  <div className="mt-3 rounded-lg border-l-4 border-[#C5A832] bg-[#C5A832]/5 p-4">
                    <p className="mb-2 text-sm font-semibold text-[#8B7523]">{t.highlights}</p>
                    <ul className="space-y-1">
                      {takeaways.map((tw, i) => <li key={i} className="text-sm text-[#1E293B]">• {tw}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
