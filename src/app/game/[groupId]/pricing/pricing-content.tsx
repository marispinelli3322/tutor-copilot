"use client";

import Link from "next/link";
import { ArrowLeft, Tag, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/lib/use-locale";
import { Tip } from "@/components/indicator-tip";
import type { PricingTeamData } from "@/lib/types";

interface Props {
  groupId: string;
  gameCode: string;
  period: number;
  maxPeriod: number;
  pricingData: PricingTeamData[];
}

const CONVENIO_LABELS: Record<string, string> = {
  boaSaude: "Boa Saúde",
  goodShape: "Good Shape",
  healthy: "Healthy",
  outras: "Outras",
  particulares: "Particulares",
  tipTop: "Tip Top",
  unique: "Unique",
};

function fmt(n: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(n);
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "decimal", maximumFractionDigits: 0 }).format(n);
}

function priceIndicator(price: number, groupAvg: number, labels: { above: string; below: string }) {
  if (price > groupAvg * 1.05) {
    return <span className="ml-1 text-xs text-red-600">({labels.above})</span>;
  }
  if (price < groupAvg * 0.95) {
    return <span className="ml-1 text-xs text-green-600">({labels.below})</span>;
  }
  return null;
}

export function PricingContent({ groupId, gameCode, period, maxPeriod, pricingData }: Props) {
  const { t } = useLocale();
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  const sortedByAvg = [...pricingData].sort((a, b) => b.avgPrice - a.avgPrice);
  const highestPrice = sortedByAvg[0] ?? null;
  const lowestPrice = sortedByAvg.length > 0 ? sortedByAvg[sortedByAvg.length - 1] : null;

  const sortedByMS = [...pricingData].sort(
    (a, b) => (b.marketSharePA + b.marketShareINT + b.marketShareAC) - (a.marketSharePA + a.marketShareINT + a.marketShareAC)
  );
  const highestMS = sortedByMS[0] ?? null;

  const groupAvgPA = pricingData.length > 0 ? pricingData.reduce((s, d) => s + d.pricePA, 0) / pricingData.length : 0;
  const groupAvgINT = pricingData.length > 0 ? pricingData.reduce((s, d) => s + d.priceINT, 0) / pricingData.length : 0;
  const groupAvgAC = pricingData.length > 0 ? pricingData.reduce((s, d) => s + d.priceAC, 0) / pricingData.length : 0;

  const aboveBelow = { above: t.aboveAvg, below: t.belowAvg };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/game/${groupId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToDashboard}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Tag className="h-7 w-7 text-[#1A365D]" />
          <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.pricingTitle}</h1>
          <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">{t.quarter} {period}</Badge>
        </div>
        <p className="mt-2 text-[#64748B]">{t.pricingSubtitle(gameCode)}</p>
      </div>

      <div className="mb-8 flex items-center gap-2">
        <span className="text-sm font-medium text-[#64748B]">{t.periodLabel}:</span>
        <div className="flex gap-1">
          {periods.map((p) => (
            <Link key={p} href={`/game/${groupId}/pricing?period=${p}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${p === period ? "bg-[#1A365D] text-white" : "bg-white text-[#64748B] hover:bg-[#1A365D]/10 hover:text-[#1A365D]"}`}>
              T{p}
            </Link>
          ))}
        </div>
      </div>

      {pricingData.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6"><p className="text-sm text-amber-800">{t.noDataForPeriod(period)}</p></CardContent>
        </Card>
      )}

      {pricingData.length > 0 && (
        <div className="space-y-8">
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.highestAvgPrice}</p>
                <p className="mt-1 text-lg font-bold text-red-600">{fmtCurrency(highestPrice?.avgPrice ?? 0)}</p>
                <p className="text-sm text-[#64748B]">{highestPrice?.team}</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.lowestAvgPrice}</p>
                <p className="mt-1 text-lg font-bold text-green-600">{fmtCurrency(lowestPrice?.avgPrice ?? 0)}</p>
                <p className="text-sm text-[#64748B]">{lowestPrice?.team}</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{t.highestMarketShare}</p>
                <p className="mt-1 text-lg font-bold text-[#1A365D]">
                  {fmt(((highestMS?.marketSharePA ?? 0) + (highestMS?.marketShareINT ?? 0) + (highestMS?.marketShareAC ?? 0)) / 3)}%
                </p>
                <p className="text-sm text-[#64748B]">{highestMS?.team}</p>
              </CardContent>
            </Card>
          </div>

          {/* Prices + Market Share table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{t.pricesTable} — {t.quarter} {period}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="font-semibold">{t.team}</TableHead>
                    <TableHead className="text-right font-semibold"><Tip module="pricing" entry={0}>{t.pricePA}</Tip></TableHead>
                    <TableHead className="text-right font-semibold"><Tip module="pricing" entry={0}>{t.priceINT}</Tip></TableHead>
                    <TableHead className="text-right font-semibold"><Tip module="pricing" entry={0}>{t.priceAC}</Tip></TableHead>
                    <TableHead className="text-right font-semibold"><Tip module="pricing" entry={1}>{t.avgPriceLabel}</Tip></TableHead>
                    <TableHead className="text-right font-semibold"><Tip module="pricing" entry={2}>MS PA</Tip></TableHead>
                    <TableHead className="text-right font-semibold"><Tip module="pricing" entry={2}>MS INT</Tip></TableHead>
                    <TableHead className="text-right font-semibold"><Tip module="pricing" entry={2}>MS AC</Tip></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingData.map((row) => (
                    <TableRow key={row.teamNumber}>
                      <TableCell className="font-medium">{row.team}</TableCell>
                      <TableCell className="text-right">
                        {fmtCurrency(row.pricePA)}
                        {priceIndicator(row.pricePA, groupAvgPA, aboveBelow)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmtCurrency(row.priceINT)}
                        {priceIndicator(row.priceINT, groupAvgINT, aboveBelow)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmtCurrency(row.priceAC)}
                        {priceIndicator(row.priceAC, groupAvgAC, aboveBelow)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">{fmtCurrency(row.avgPrice)}</TableCell>
                      <TableCell className="text-right">{fmt(row.marketSharePA)}%</TableCell>
                      <TableCell className="text-right">{fmt(row.marketShareINT)}%</TableCell>
                      <TableCell className="text-right">{fmt(row.marketShareAC)}%</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-[#F8FAFC] font-semibold">
                    <TableCell>{t.marketAvg}</TableCell>
                    <TableCell className="text-right">{fmtCurrency(pricingData[0]?.mediaPA ?? 0)}</TableCell>
                    <TableCell className="text-right">{fmtCurrency(pricingData[0]?.mediaINT ?? 0)}</TableCell>
                    <TableCell className="text-right">{fmtCurrency(pricingData[0]?.mediaAC ?? 0)}</TableCell>
                    <TableCell colSpan={4} />
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Convenio Revenue table */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{t.convenioRevenue}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="font-semibold">{t.team}</TableHead>
                    {Object.entries(CONVENIO_LABELS).map(([key, label]) => (
                      <TableHead key={key} className="text-right font-semibold text-xs">{label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingData.map((row) => (
                    <TableRow key={row.teamNumber}>
                      <TableCell className="font-medium">{row.team}</TableCell>
                      {Object.keys(CONVENIO_LABELS).map((key) => (
                        <TableCell key={key} className="text-right text-xs">
                          {row.conveniosAceitos[key] ? fmtCurrency(row.revenueByConvenio[key] || 0) : (
                            <span className="text-[#64748B]">—</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Convenios Aceitos */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{t.convenioAccepted}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="font-semibold">{t.team}</TableHead>
                    {Object.entries(CONVENIO_LABELS).map(([key, label]) => (
                      <TableHead key={key} className="text-center font-semibold text-xs">{label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingData.map((row) => (
                    <TableRow key={row.teamNumber}>
                      <TableCell className="font-medium">{row.team}</TableCell>
                      {Object.keys(CONVENIO_LABELS).map((key) => (
                        <TableCell key={key} className="text-center">
                          {row.conveniosAceitos[key] ? (
                            <CheckCircle className="inline h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="inline h-4 w-4 text-red-400" />
                          )}
                        </TableCell>
                      ))}
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
              {highestPrice && (
                <li>
                  • <strong>{highestPrice.team}</strong> pratica o maior preço médio ({fmtCurrency(highestPrice.avgPrice)}) — MS médio: {fmt(((highestPrice.marketSharePA + highestPrice.marketShareINT + highestPrice.marketShareAC) / 3))}%
                </li>
              )}
              {lowestPrice && lowestPrice !== highestPrice && (
                <li>
                  • <strong>{lowestPrice.team}</strong> pratica o menor preço médio ({fmtCurrency(lowestPrice.avgPrice)}) — MS médio: {fmt(((lowestPrice.marketSharePA + lowestPrice.marketShareINT + lowestPrice.marketShareAC) / 3))}%
                </li>
              )}
              {highestMS && (
                <li>
                  • <strong>{highestMS.team}</strong> lidera em market share — {Object.entries(highestMS.conveniosAceitos).filter(([, v]) => v).length} convênios aceitos
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
