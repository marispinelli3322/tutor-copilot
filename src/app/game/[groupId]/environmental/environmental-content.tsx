"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale } from "@/lib/use-locale";
import type { EnvironmentalData } from "@/lib/data-provider";

interface Props {
  groupId: string;
  gameCode: string;
  period: number;
  maxPeriod: number;
  data: EnvironmentalData[];
}

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtMoney(n: number): string {
  return `R$${(n / 1e6).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
}

export function EnvironmentalContent({ groupId, gameCode, period, maxPeriod, data }: Props) {
  const { t } = useLocale();

  const statusColor = (status: string) => {
    switch (status) {
      case "excellent": return "bg-green-100 text-green-700";
      case "critical": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "excellent": return t.envExcellent || "Excelente";
      case "critical": return t.envCritical || "Crítico";
      default: return t.envAdequate || "Adequado";
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/game/${groupId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToDashboard}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.environmentalTitle || "Gestão Ambiental"}</h1>
        <p className="mt-2 text-[#64748B]">
          {(t.environmentalSubtitle || ((c: string) => `Indicadores ambientais — ${c}`))(gameCode)}
        </p>
      </div>

      {/* Period selector */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm font-medium text-[#64748B]">{t.periodMonth || "Mês"}:</span>
        <div className="flex gap-1">
          {Array.from({ length: maxPeriod }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/game/${groupId}/environmental?period=${p}`}
              className={`rounded px-2.5 py-1 text-sm font-medium transition-colors ${
                p === period
                  ? "bg-[#1A365D] text-white"
                  : "bg-gray-100 text-[#64748B] hover:bg-gray-200"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[#64748B]">{(t.noDataForPeriod || ((p: number) => `Nenhum dado para o período ${p}`))(period)}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Main table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1A365D]">{t.environmentalTitle || "Gestão Ambiental"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.team}</TableHead>
                      <TableHead className="text-right">{t.plumaLevel || "Pluma"}</TableHead>
                      <TableHead className="text-right">{t.smsScore || "SMS"}</TableHead>
                      <TableHead className="text-right">{t.envFines || "Multas"}</TableHead>
                      <TableHead className="text-right">{t.remediation || "Remediação"}</TableHead>
                      <TableHead className="text-right">{t.esgCertifications || "Cert. ESG"}</TableHead>
                      <TableHead className="text-right">{t.wasteDisposal || "Descarte"}</TableHead>
                      <TableHead>{t.status}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row) => (
                      <TableRow key={row.teamNumber}>
                        <TableCell className="font-medium">{row.team}</TableCell>
                        <TableCell className="text-right">{fmt(row.nivelPluma, 1)}</TableCell>
                        <TableCell className="text-right">{fmt(row.smsAmbiental, 1)}</TableCell>
                        <TableCell className="text-right">{fmt(row.multaAmbiental)}</TableCell>
                        <TableCell className="text-right">{fmtMoney(row.investimentoRemediacao)}</TableCell>
                        <TableCell className="text-right">{fmt(row.numeroCertificacoesESG)}</TableCell>
                        <TableCell className="text-right">{fmtMoney(row.gastoDescarte)}</TableCell>
                        <TableCell>
                          <Badge className={statusColor(row.envStatus)}>{statusLabel(row.envStatus)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
