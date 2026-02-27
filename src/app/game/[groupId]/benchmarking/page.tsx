import { Header } from "@/components/header";
import { getGameDetails, getBenchmarkingData } from "@/lib/data-provider";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, TrendingUp, TrendingDown } from "lucide-react";
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

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ period?: string }>;
}

function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(n) >= 1_000) {
    return `R$ ${(n / 1_000).toFixed(0)}k`;
  }
  return `R$ ${Math.round(n)}`;
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(Math.round(n));
}

function rankBadge(rank: number) {
  if (rank === 1)
    return (
      <Badge className="gap-1 bg-[#C5A832] text-white">
        <Trophy className="h-3 w-3" />
        1o
      </Badge>
    );
  if (rank === 2)
    return <Badge className="bg-gray-300 text-gray-800">2o</Badge>;
  if (rank === 3)
    return <Badge className="bg-amber-700/20 text-amber-800">3o</Badge>;
  return (
    <Badge variant="outline" className="text-[#64748B]">
      {rank}o
    </Badge>
  );
}

export default async function BenchmarkingPage({
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

  const benchData = await getBenchmarkingData(gid, period);

  const periods = Array.from(
    { length: game.ultimo_periodo_processado },
    (_, i) => i + 1
  );

  // Summary stats
  const leader = benchData[0];
  const avgRevenue =
    benchData.reduce((s, d) => s + d.netRevenue, 0) / benchData.length;
  const avgMargin =
    benchData.reduce((s, d) => s + d.operatingMargin, 0) / benchData.length;

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
              Benchmarking Inter-Equipes
            </h1>
            <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">
              Trimestre {period}
            </Badge>
          </div>
          <p className="mt-2 text-[#64748B]">
            Ranking comparativo de desempenho — {game.codigo}
          </p>
        </div>

        {/* Period selector */}
        <div className="mb-8 flex items-center gap-2">
          <span className="text-sm font-medium text-[#64748B]">Trimestre:</span>
          <div className="flex gap-1">
            {periods.map((p) => (
              <Link
                key={p}
                href={`/game/${groupId}/benchmarking?period=${p}`}
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

        {benchData.length === 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-800">
                Nenhum dado de benchmarking encontrado para o Trimestre {period}.
              </p>
            </CardContent>
          </Card>
        )}

        {benchData.length > 0 && (
          <div className="space-y-8">
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-[#C5A832]/30">
                <CardContent className="pt-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">
                    Líder do Trimestre
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#1A365D]">
                    {leader?.team}
                  </p>
                  <p className="text-sm text-[#C5A832]">
                    Ação: R$ {leader?.sharePrice.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">
                    Receita Média
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#1A365D]">
                    {formatCurrency(avgRevenue)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">
                    Margem Op. Média
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#1A365D]">
                    {avgMargin.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main ranking table */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-[#1A365D] py-3">
                <CardTitle className="text-base text-white">
                  Ranking Geral — Trimestre {period}
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F8FAFC]">
                      <TableHead className="w-12 text-center font-semibold">
                        #
                      </TableHead>
                      <TableHead className="font-semibold">Equipe</TableHead>
                      <TableHead className="text-right font-semibold">
                        Valor Ação
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Receita Líquida
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Resultado Op.
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Margem Op.
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Vidas Atendidas
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Médicos
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        CCL
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {benchData.map((row) => (
                      <TableRow
                        key={row.teamNumber}
                        className={
                          row.overallRanking === 1
                            ? "bg-[#C5A832]/5"
                            : undefined
                        }
                      >
                        <TableCell className="text-center">
                          {rankBadge(row.overallRanking)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.team}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-[#1A365D]">
                          R$ {row.sharePrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {formatCurrency(row.netRevenue)}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          <span
                            className={
                              row.netOperatingIncome >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {row.netOperatingIncome >= 0 ? (
                              <TrendingUp className="mr-1 inline h-3 w-3" />
                            ) : (
                              <TrendingDown className="mr-1 inline h-3 w-3" />
                            )}
                            {formatCurrency(row.netOperatingIncome)}
                          </span>
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            row.operatingMargin >= 20
                              ? "text-green-600"
                              : row.operatingMargin >= 10
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {row.operatingMargin.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {formatNumber(row.patientsAttended)}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {formatNumber(row.registeredDoctors)}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {formatCurrency(row.nwc)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Takeaways */}
            <div className="rounded-lg border-l-4 border-[#C5A832] bg-[#C5A832]/5 p-4">
              <p className="mb-2 text-sm font-semibold text-[#8B7523]">
                Destaques
              </p>
              <ul className="space-y-1 text-sm text-[#1E293B]">
                {leader && (
                  <li>
                    • <strong>{leader.team}</strong> lidera o ranking com ação a
                    R$ {leader.sharePrice.toFixed(2)} e margem operacional de{" "}
                    {leader.operatingMargin.toFixed(1)}%.
                  </li>
                )}
                {benchData.length > 1 && (() => {
                  const last = benchData[benchData.length - 1];
                  return (
                    <li>
                      • <strong>{last.team}</strong> ocupa a última posição —{" "}
                      {last.operatingMargin < 5
                        ? "margem operacional muito baixa, precisa rever estratégia de custos e preços."
                        : "margem razoável mas abaixo dos concorrentes, oportunidade de melhoria."}
                    </li>
                  );
                })()}
                <li>
                  • Spread de receita:{" "}
                  {formatCurrency(benchData[0]?.netRevenue || 0)} (líder) vs{" "}
                  {formatCurrency(
                    benchData[benchData.length - 1]?.netRevenue || 0
                  )}{" "}
                  (último) — diferença de{" "}
                  {formatCurrency(
                    (benchData[0]?.netRevenue || 0) -
                      (benchData[benchData.length - 1]?.netRevenue || 0)
                  )}
                  .
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
