"use client";

import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/use-locale";
import type { TimeseriesDataset } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TEAM_COLORS = [
  "#1A365D", // navy
  "#C5A832", // gold
  "#DC2626", // red
  "#16A34A", // green
  "#7C3AED", // purple
  "#EA580C", // orange
  "#0891B2", // cyan
  "#DB2777", // pink
];

interface Props {
  groupId: string;
  gameCode: string;
  maxPeriod: number;
  dataset: TimeseriesDataset;
}

export function TimeseriesContent({ groupId, gameCode, maxPeriod, dataset }: Props) {
  const { t } = useLocale();

  const chartLabels: Record<string, string> = {
    sharePrice: t.sharePriceFull,
    netRevenue: t.netRevenue,
    operatingMargin: t.operatingMarginLabel,
    governance: t.governanceScore,
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/game/${groupId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToDashboard}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-[#1A365D]" />
          <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.timeseriesTitle}</h1>
          <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">{maxPeriod} {t.totalPeriods}</Badge>
        </div>
        <p className="mt-2 text-[#64748B]">{t.timeseriesSubtitle(gameCode)}</p>
      </div>

      {dataset.teams.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6"><p className="text-sm text-amber-800">{t.noDataForPeriod(1)}</p></CardContent>
        </Card>
      )}

      {dataset.teams.length > 0 && (
        <div className="space-y-6">
          {/* 4 chart cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            {dataset.metrics.map((metric) => {
              const chartData = metric.data.map((d) => ({
                ...d,
                name: `T${d.period}`,
              }));

              // Compute highlights: biggest gain and drop from first to last period
              const first = metric.data[0];
              const last = metric.data[metric.data.length - 1];
              let biggestGainTeam = "";
              let biggestGainDelta = -Infinity;
              let biggestDropTeam = "";
              let biggestDropDelta = Infinity;

              for (const team of dataset.teams) {
                const delta = (last?.[team] ?? 0) - (first?.[team] ?? 0);
                if (delta > biggestGainDelta) {
                  biggestGainDelta = delta;
                  biggestGainTeam = team;
                }
                if (delta < biggestDropDelta) {
                  biggestDropDelta = delta;
                  biggestDropTeam = team;
                }
              }

              return (
                <Card key={metric.key} className="overflow-hidden">
                  <CardHeader className="bg-[#1A365D] py-3">
                    <CardTitle className="text-base text-white">{chartLabels[metric.key] || metric.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        {dataset.teams.map((team, i) => (
                          <Line
                            key={team}
                            type="monotone"
                            dataKey={team}
                            stroke={TEAM_COLORS[i % TEAM_COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>

                    {/* Mini highlights per chart */}
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#64748B]">
                      {biggestGainDelta > 0 && (
                        <span className="text-green-600">
                          {t.biggestGain}: <strong>{biggestGainTeam}</strong> (+{formatDelta(biggestGainDelta, metric.key)})
                        </span>
                      )}
                      {biggestDropDelta < 0 && biggestDropTeam !== biggestGainTeam && (
                        <span className="text-red-600">
                          {t.biggestDrop}: <strong>{biggestDropTeam}</strong> ({formatDelta(biggestDropDelta, metric.key)})
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* General highlights */}
          <div className="rounded-lg border-l-4 border-[#C5A832] bg-[#C5A832]/5 p-4">
            <p className="mb-2 text-sm font-semibold text-[#8B7523]">{t.highlights}</p>
            <ul className="space-y-1 text-sm text-[#1E293B]">
              {dataset.metrics.map((metric) => {
                const first = metric.data[0];
                const last = metric.data[metric.data.length - 1];
                let bestTeam = "";
                let bestDelta = -Infinity;
                for (const team of dataset.teams) {
                  const delta = (last?.[team] ?? 0) - (first?.[team] ?? 0);
                  if (delta > bestDelta) {
                    bestDelta = delta;
                    bestTeam = team;
                  }
                }
                if (!bestTeam) return null;
                return (
                  <li key={metric.key}>
                    • <strong>{chartLabels[metric.key] || metric.label}</strong>: {bestTeam} {t.biggestGain.toLowerCase()} ({formatDelta(bestDelta, metric.key)})
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}

function formatDelta(delta: number, metricKey: string): string {
  if (metricKey === "operatingMargin") return `${delta > 0 ? "+" : ""}${delta.toFixed(1)}pp`;
  if (metricKey === "sharePrice") return `${delta > 0 ? "+" : ""}R$ ${delta.toFixed(2)}`;
  if (Math.abs(delta) >= 1_000_000) return `${delta > 0 ? "+" : ""}${(delta / 1_000_000).toFixed(1)}M`;
  if (Math.abs(delta) >= 1_000) return `${delta > 0 ? "+" : ""}${(delta / 1_000).toFixed(0)}k`;
  return `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`;
}
