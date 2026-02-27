import { Header } from "@/components/header";
import { getGameDetails, getTeamVariables, getHospitalData } from "@/lib/queries";
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
import { EFFICIENCY_THRESHOLDS } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ period?: string }>;
}

function getStatus(rate: number): {
  label: string;
  color: string;
  icon: string;
} {
  if (rate >= EFFICIENCY_THRESHOLDS.optimal.min && rate <= EFFICIENCY_THRESHOLDS.optimal.max) {
    return { label: "OK", color: "bg-green-100 text-green-800", icon: "+" };
  }
  if (rate > EFFICIENCY_THRESHOLDS.high) {
    return { label: "Sobrecarga", color: "bg-red-100 text-red-800", icon: "!" };
  }
  if (rate < EFFICIENCY_THRESHOLDS.low) {
    return { label: "Ociosidade", color: "bg-amber-100 text-amber-800", icon: "-" };
  }
  return { label: "Atenção", color: "bg-yellow-100 text-yellow-800", icon: "~" };
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(Math.round(n));
}

function ServiceTable({
  title,
  data,
}: {
  title: string;
  data: {
    team: string;
    capacity: number;
    volume: number;
    utilization: number;
    unmetDemand: number;
  }[];
}) {
  const sorted = [...data].sort((a, b) => b.utilization - a.utilization);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-[#1A365D] py-3">
        <CardTitle className="text-base text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC]">
              <TableHead className="font-semibold">Equipe</TableHead>
              <TableHead className="text-right font-semibold">
                Capacidade
              </TableHead>
              <TableHead className="text-right font-semibold">
                Volume
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
            {sorted.map((row) => {
              const status = getStatus(row.utilization);
              return (
                <TableRow key={row.team}>
                  <TableCell className="font-medium">{row.team}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(row.capacity)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(row.volume)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {row.utilization.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(row.unmetDemand)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={status.color}>{status.label}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
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

  // Fetch data from both tables to find the right columns
  let variables: Record<string, unknown>[] = [];
  let hospitalData: Record<string, unknown>[] = [];
  let dataSource = "none";

  try {
    variables = await getTeamVariables(gid, period);
    hospitalData = await getHospitalData(gid, period);
    dataSource = hospitalData.length > 0 ? "hospital" : "variables";
  } catch {
    // Will show error state
  }

  // Try to build efficiency data from whatever source we have
  // We'll show raw column names if we can't map them yet
  const hasData = variables.length > 0 || hospitalData.length > 0;

  // Debug: show available columns to help map the data
  const sampleRow = hospitalData[0] || variables[0];
  const availableColumns = sampleRow ? Object.keys(sampleRow) : [];

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

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">
              Eficiência Operacional
            </h1>
            <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">
              Trimestre {period}
            </Badge>
          </div>
          <p className="mt-2 text-[#64748B]">
            Análise de capacidade vs. demanda por linha de serviço — {game.codigo}
          </p>
        </div>

        {!hasData && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-800">
                Nenhum dado encontrado para o Trimestre {period}. Verifique se
                a simulação já foi processada e se a VPN está conectada.
              </p>
            </CardContent>
          </Card>
        )}

        {hasData && (
          <div className="space-y-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-800">
                  <strong>Mapeamento em progresso:</strong> Encontramos{" "}
                  {hospitalData.length > 0
                    ? `${hospitalData.length} registros na tabela hospital`
                    : `${variables.length} registros em variavel_empresarial`}
                  . Dados de {(variables[0] as Record<string, unknown>)?.team_name
                    ? `${variables.length} equipes`
                    : "equipes"} carregados do Trimestre {period}.
                </p>
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-blue-600">
                    Ver colunas disponíveis ({availableColumns.length})
                  </summary>
                  <pre className="mt-2 max-h-40 overflow-auto rounded bg-white p-2 text-xs">
                    {availableColumns.join("\n")}
                  </pre>
                </details>
              </CardContent>
            </Card>

            {/* Render tables if we can map the columns */}
            {variables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Dados das Equipes — Trimestre {period}
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipe</TableHead>
                        <TableHead className="text-right">
                          Receita Líquida
                        </TableHead>
                        <TableHead className="text-right">
                          Resultado Op.
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variables.map((v, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {String(
                              v.team_name || `Equipe ${v.team_number}`
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {v.receita_liquida
                              ? formatNumber(Number(v.receita_liquida))
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {v.resultado_operacional_liquido
                              ? formatNumber(
                                  Number(v.resultado_operacional_liquido)
                                )
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
