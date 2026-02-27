import { Header } from "@/components/header";
import { getGameDetails, getEfficiencyData } from "@/lib/data-provider";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ServiceEfficiency } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ period?: string }>;
}

function getStatusBadge(row: ServiceEfficiency) {
  if (row.status === "overload") {
    return (
      <Badge className="gap-1 bg-red-100 text-red-800">
        <AlertTriangle className="h-3 w-3" />
        Sobrecarga
      </Badge>
    );
  }
  if (row.status === "overcapacity") {
    return (
      <Badge className="gap-1 bg-amber-100 text-amber-800">
        <MinusCircle className="h-3 w-3" />
        Ociosidade
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-green-100 text-green-800">
      <CheckCircle className="h-3 w-3" />
      OK
    </Badge>
  );
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(Math.round(n));
}

function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(n) >= 1_000) {
    return `R$ ${(n / 1_000).toFixed(0)}k`;
  }
  return `R$ ${n.toFixed(0)}`;
}

export default async function EfficiencyPage({
  params,
  searchParams,
}: PageProps) {
  const { groupId } = await params;
  const { period: periodStr } = await searchParams;
  const gid = parseInt(groupId, 10);
  const game = await getGameDetails(gid);
  if (!game) return notFound();

  const period = periodStr
    ? parseInt(periodStr, 10)
    : game.ultimo_periodo_processado;

  const efficiency = await getEfficiencyData(gid, period);
  const serviceKeys = ["emergency", "inpatient", "surgery"];
  const hasData = serviceKeys.some((k) => efficiency[k]?.teams?.length > 0);

  // Period navigation
  const periods = Array.from(
    { length: game.ultimo_periodo_processado },
    (_, i) => i + 1
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href={`/game/${groupId}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao dashboard
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">
              Eficiência Operacional
            </h1>
            <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">
              Trimestre {period}
            </Badge>
          </div>
          <p className="mt-2 text-[#64748B]">
            Capacidade vs. demanda por linha de serviço — {game.codigo}
          </p>
        </div>

        {/* Period selector */}
        <div className="mb-8 flex items-center gap-2">
          <span className="text-sm font-medium text-[#64748B]">Trimestre:</span>
          <div className="flex gap-1">
            {periods.map((p) => (
              <Link
                key={p}
                href={`/game/${groupId}/efficiency?period=${p}`}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  p === period
                    ? "bg-[#1A365D] text-white"
                    : "bg-white text-[#64748B] hover:bg-[#1A365D]/10 hover:text-[#1A365D]"
                }`}
              >
                T{p}
              </Link>
            ))}
          </div>
        </div>

        {!hasData && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-800">
                Nenhum dado encontrado para o Trimestre {period}.
              </p>
            </CardContent>
          </Card>
        )}

        {hasData && (
          <div className="space-y-8">
            {serviceKeys.map((key) => {
              const report = efficiency[key];
              if (!report || report.teams.length === 0) return null;

              const sorted = [...report.teams].sort(
                (a, b) => b.utilizationRate - a.utilizationRate
              );

              return (
                <div key={key}>
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-[#1A365D] py-3">
                      <CardTitle className="text-base text-white">
                        {report.service}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#F8FAFC]">
                            <TableHead className="font-semibold">
                              Equipe
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Capacidade
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Atendidos
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Utilização
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Demanda Perdida
                            </TableHead>
                            <TableHead className="text-center font-semibold">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sorted.map((row) => (
                            <TableRow key={row.teamNumber}>
                              <TableCell className="font-medium">
                                {row.team}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(row.capacity)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(row.volumeServed)}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {row.utilizationRate.toFixed(1)}%
                              </TableCell>
                              <TableCell className="text-right">
                                {row.unmetDemand > 0 ? (
                                  <span className="font-semibold text-red-600">
                                    {formatNumber(row.unmetDemand)}
                                  </span>
                                ) : (
                                  <span className="text-green-600">0</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {getStatusBadge(row)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Takeaways */}
                  {report.takeaways.length > 0 && (
                    <div className="mt-3 rounded-lg border-l-4 border-[#C5A832] bg-[#C5A832]/5 p-4">
                      <p className="mb-2 text-sm font-semibold text-[#8B7523]">
                        Destaques
                      </p>
                      <ul className="space-y-1">
                        {report.takeaways.map((t, i) => (
                          <li key={i} className="text-sm text-[#1E293B]">
                            • {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
