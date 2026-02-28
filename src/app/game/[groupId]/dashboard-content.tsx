"use client";

import Link from "next/link";
import { Activity, DollarSign, BarChart3, MessageSquare, TrendingUp, Shield, AlertTriangle, Target, Tag, HeartPulse, CircleDollarSign, BookOpen, ArrowLeft, Users, GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/use-locale";
import type { Team } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = { Activity, DollarSign, BarChart3, MessageSquare, TrendingUp, Shield, AlertTriangle, Target, Tag, HeartPulse, CircleDollarSign, BookOpen };

interface Props {
  groupId: string;
  game: {
    id: number;
    codigo: string;
    jogo_nome: string;
    ultimo_periodo_processado: number;
    professor?: string | null;
  };
  teams: Team[];
}

export function DashboardContent({ groupId, game, teams }: Props) {
  const { t } = useLocale();

  const modules = [
    // 10 análises determinísticas
    { id: "efficiency", title: t.modEfficiency, description: t.modEfficiencyDesc, icon: "Activity", href: "efficiency" },
    { id: "profitability", title: t.modProfitability, description: t.modProfitabilityDesc, icon: "DollarSign", href: "profitability" },
    { id: "benchmarking", title: t.modBenchmarking, description: t.modBenchmarkingDesc, icon: "BarChart3", href: "benchmarking" },
    { id: "timeseries", title: t.modTimeseries, description: t.modTimeseriesDesc, icon: "TrendingUp", href: "timeseries" },
    { id: "governance", title: t.modGovernance, description: t.modGovernanceDesc, icon: "Shield", href: "governance" },
    { id: "financial-risk", title: t.modFinancialRisk, description: t.modFinancialRiskDesc, icon: "AlertTriangle", href: "financial-risk" },
    { id: "strategy", title: t.modStrategy, description: t.modStrategyDesc, icon: "Target", href: "strategy" },
    { id: "pricing", title: t.modPricing, description: t.modPricingDesc, icon: "Tag", href: "pricing" },
    { id: "quality", title: t.modQuality, description: t.modQualityDesc, icon: "HeartPulse", href: "quality" },
    { id: "lost-revenue", title: t.modLostRevenue, description: t.modLostRevenueDesc, icon: "CircleDollarSign", href: "lost-revenue" },
    // 11. Guia de Facilitação (IA)
    { id: "facilitation", title: t.modFacilitation, description: t.modFacilitationDesc, icon: "MessageSquare", href: "facilitation" },
    // 12. Glossário de Dados
    { id: "data-glossary", title: t.modGlossary, description: t.modGlossaryDesc, icon: "BookOpen", href: "data-glossary" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToGames}
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">
            {game.codigo || `Game #${game.id}`}
          </h1>
          <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">{t.quarter} {game.ultimo_periodo_processado}</Badge>
        </div>
        <p className="mt-2 text-[#64748B]">
          {game.jogo_nome} — {teams.length} {t.teamsCompeting}
        </p>
        {game.professor && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#8B7523]">
            <GraduationCap className="h-4 w-4" />
            {game.professor}
          </p>
        )}
      </div>

      {/* Teams overview */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#64748B]">{t.teamsLabel}</h2>
        <div className="flex flex-wrap gap-2">
          {teams.map((team) => (
            <Badge key={team.id} variant="outline" className="gap-1.5 px-3 py-1.5">
              <Users className="h-3 w-3" />
              {team.nome || `${t.team} ${team.numero}`}
            </Badge>
          ))}
        </div>
      </div>

      {/* Period selector hint */}
      <div className="mb-6 rounded-lg border border-[#C5A832]/30 bg-[#C5A832]/5 p-3">
        <p className="text-sm text-[#8B7523]">
          <strong>{t.analyzingQuarter(game.ultimo_periodo_processado)}</strong>{" "}
          {t.periodHint}
        </p>
      </div>

      {/* Analysis modules */}
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#64748B]">{t.analysisModules}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((mod) => {
          const Icon = iconMap[mod.icon] || Activity;
          return (
            <Link key={mod.id} href={`/game/${groupId}/${mod.href}?period=${game.ultimo_periodo_processado}`}>
              <Card className="cursor-pointer transition-all hover:border-[#C5A832] hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A365D]/10">
                      <Icon className="h-5 w-5 text-[#1A365D]" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-[#1A365D]">{mod.title}</CardTitle>
                      <CardDescription>{mod.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
