import { Header } from "@/components/header";
import { getGameDetails, getProfitabilityData } from "@/lib/data-provider";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

function marginColor(pct: number): string {
  if (pct >= 40) return "text-green-700 font-bold";
  if (pct >= 25) return "text-green-600 font-semibold";
  if (pct >= 10) return "text-amber-600 font-semibold";
  if (pct >= 0) return "text-red-500 font-semibold";
  return "text-red-700 font-bold";
}

export default async function ProfitabilityPage({
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

  const profData = await getProfitabilityData(gid, period);

  // Group by service line
  const services = ["Pronto Atendimento", "Internação sem Cirurgia", "Cirurgia / Alta Complexidade"];

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
              Diagnóstico de Lucratividade
            </h1>
            <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">
              Trimestre {period}
            </Badge>
          </div>
          <p className="mt-2 text-[#64748B]">
            Margens e rentabilidade por linha de serviço — {game.codigo}
          </p>
        </div>

        {/* Period selector */}
        <div className="mb-8 flex items-center gap-2">
          <span className="text-sm font-medium text-[#64748B]">Trimestre:</span>
          <div className="flex gap-1">
            {periods.map((p) => (
              <Link
                key={p}
                href={`/game/${groupId}/profitability?period=${p}`}
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

        {profData.length === 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-800">
                Nenhum dado de lucratividade encontrado para o Trimestre {period}.
              </p>
            </CardContent>
          </Card>
        )}

        {profData.length > 0 && (
          <div className="space-y-8">
            {services.map((svcLabel) => {
              const svcData = profData
                .filter((d) => d.service === svcLabel)
                .sort((a, b) => b.marginPercent - a.marginPercent);

              if (svcData.length === 0) return null;

              // Takeaways
              const best = svcData[0];
              const worst = svcData[svcData.length - 1];
              const avgMargin =
                svcData.reduce((s, d) => s + d.marginPercent, 0) / svcData.length;

              return (
                <div key={svcLabel}>
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-[#1A365D] py-3">
                      <CardTitle className="text-base text-white">
                        {svcLabel}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#F8FAFC]">
                            <TableHead className="font-semibold">Equipe</TableHead>
                            <TableHead className="text-right font-semibold">
                              Receita Bruta
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Glosas
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Inadimplência
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Receita Líquida
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Custos Insumos
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Custos Pessoal
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Margem Contribuição
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Margem %
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {svcData.map((row) => (
                            <TableRow key={row.teamNumber}>
                              <TableCell className="font-medium">
                                {row.team}
                              </TableCell>
                              <TableCell className="text-right text-xs">
                                {formatCurrency(row.totalRevenue)}
                              </TableCell>
                              <TableCell className="text-right text-xs text-red-500">
                                {formatCurrency(row.disallowances)}
                              </TableCell>
                              <TableCell className="text-right text-xs text-red-500">
                                {formatCurrency(row.defaults)}
                              </TableCell>
                              <TableCell className="text-right text-xs">
                                {formatCurrency(row.netRevenue)}
                              </TableCell>
                              <TableCell className="text-right text-xs">
                                {formatCurrency(row.inputCosts)}
                              </TableCell>
                              <TableCell className="text-right text-xs">
                                {formatCurrency(row.laborCosts)}
                              </TableCell>
                              <TableCell className="text-right text-xs font-semibold">
                                {formatCurrency(row.contributionMargin)}
                              </TableCell>
                              <TableCell
                                className={`text-right ${marginColor(row.marginPercent)}`}
                              >
                                {row.marginPercent.toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Takeaways */}
                  <div className="mt-3 rounded-lg border-l-4 border-[#C5A832] bg-[#C5A832]/5 p-4">
                    <p className="mb-2 text-sm font-semibold text-[#8B7523]">
                      Destaques
                    </p>
                    <ul className="space-y-1 text-sm text-[#1E293B]">
                      <li>
                        • Maior margem: <strong>{best.team}</strong> com{" "}
                        {best.marginPercent.toFixed(1)}% (margem de contribuição{" "}
                        {formatCurrency(best.contributionMargin)})
                      </li>
                      <li>
                        • Menor margem: <strong>{worst.team}</strong> com{" "}
                        {worst.marginPercent.toFixed(1)}%
                        {worst.marginPercent < 0
                          ? " — operando no prejuízo nesta linha"
                          : ""}
                      </li>
                      <li>
                        • Média do grupo: {avgMargin.toFixed(1)}% de margem de
                        contribuição em {svcLabel}
                      </li>
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
