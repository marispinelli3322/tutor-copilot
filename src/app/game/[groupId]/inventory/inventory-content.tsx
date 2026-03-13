"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale } from "@/lib/use-locale";
import type { InventoryData } from "@/lib/data-provider";

interface Props {
  groupId: string;
  gameCode: string;
  period: number;
  maxPeriod: number;
  data: InventoryData[];
}

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtMoney(n: number): string {
  return `R$${n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function InventoryContent({ groupId, gameCode, period, maxPeriod, data }: Props) {
  const { t } = useLocale();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/game/${groupId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToDashboard}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.inventoryTitle || "Estoque e Produção"}</h1>
        <p className="mt-2 text-[#64748B]">
          {(t.inventorySubtitle || ((c: string) => `Estoque e produção — ${c}`))(gameCode)}
        </p>
      </div>

      {/* Period selector */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm font-medium text-[#64748B]">{t.periodMonth || "Mês"}:</span>
        <div className="flex gap-1">
          {Array.from({ length: maxPeriod }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/game/${groupId}/inventory?period=${p}`}
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
          {data.map((team) => (
            <Card key={team.teamNumber}>
              <CardHeader>
                <CardTitle className="text-[#1A365D]">{team.team}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.product || "Produto"}</TableHead>
                        <TableHead className="text-right">{t.stock || "Estoque"}</TableHead>
                        <TableHead className="text-right">{t.production || "Produção"}</TableHead>
                        <TableHead className="text-right">{t.productiveCapacity || "Capacidade"}</TableHead>
                        <TableHead className="text-right">{t.utilization}</TableHead>
                        <TableHead className="text-right">{t.unitCost || "Custo Unit."}</TableHead>
                        <TableHead className="text-right">{t.storageCost || "Armazenagem"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {team.products.map((prod) => (
                        <TableRow key={prod.suffix}>
                          <TableCell className="font-medium">{prod.name}</TableCell>
                          <TableCell className="text-right">{fmt(prod.estoque)}</TableCell>
                          <TableCell className="text-right">{fmt(prod.producao)}</TableCell>
                          <TableCell className="text-right">{fmt(prod.capacidadeProdutiva)}</TableCell>
                          <TableCell className="text-right">{fmt(prod.utilizacao, 1)}%</TableCell>
                          <TableCell className="text-right">{fmtMoney(prod.custoUnitario)}</TableCell>
                          <TableCell className="text-right">{fmtMoney(prod.custoArmazenagem)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-3 flex gap-6 text-sm text-[#64748B]">
                  <span>Total Estoque: <strong>{fmt(team.totalEstoque)}</strong></span>
                  <span>Total Armazenagem: <strong>{fmtMoney(team.totalArmazenagem)}</strong></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
