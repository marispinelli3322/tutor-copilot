"use client";

import Link from "next/link";
import { Activity, DollarSign, BarChart3, MessageSquare, TrendingUp, Shield, AlertTriangle, Target, Tag, HeartPulse, CircleDollarSign, BookOpen, ArrowLeft, ArrowRight, Users, GraduationCap, Sparkles, MessagesSquare, Leaf, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/use-locale";
import type { Team } from "@/lib/types";
import { type GameType, getGameConfig } from "@/lib/game-config";

const iconMap: Record<string, React.ElementType> = { Activity, DollarSign, BarChart3, MessageSquare, TrendingUp, Shield, AlertTriangle, Target, Tag, HeartPulse, CircleDollarSign, BookOpen, Leaf, Package };

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
  gameType: GameType;
}

export function DashboardContent({ groupId, game, teams, gameType }: Props) {
  const { t } = useLocale();
  const config = getGameConfig(gameType);

  const analysisModules = config.modules.map((mod) => ({
    id: mod.id,
    title: (t as Record<string, string>)[mod.titleKey] || mod.titleKey,
    description: (t as Record<string, string>)[mod.descriptionKey] || mod.descriptionKey,
    icon: mod.icon,
    href: mod.href,
  }));

  const periodQuery = `?period=${game.ultimo_periodo_processado}`;

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
          <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">{config.periodLabel} {game.ultimo_periodo_processado}</Badge>
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

      {/* Period hint */}
      <div className="mb-8 rounded-lg border border-[#C5A832]/30 bg-[#C5A832]/5 p-3">
        <p className="text-sm text-[#8B7523]">
          <strong>{t.analyzingQuarter(game.ultimo_periodo_processado)}</strong>{" "}
          {t.periodHint}
        </p>
      </div>

      {/* Hero cards: Facilitation + Squad */}
      <div className="mb-10">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#C5A832]">{t.startHere}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href={`/game/${groupId}/facilitation${periodQuery}`}>
            <Card className="border-[#C5A832] bg-gradient-to-r from-[#1A365D] to-[#234681] transition-all hover:shadow-lg h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#C5A832]/20">
                    <Sparkles className="h-7 w-7 text-[#C5A832]" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-white">{t.modFacilitation}</CardTitle>
                    <CardDescription className="mt-1 text-white/70">{t.facilitationHeroDesc}</CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#C5A832]" />
                </div>
              </CardHeader>
            </Card>
          </Link>
          <Link href={`/game/${groupId}/squad`}>
            <Card className="border-[#C5A832] bg-gradient-to-r from-[#234681] to-[#1A365D] transition-all hover:shadow-lg h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#C5A832]/20">
                    <MessagesSquare className="h-7 w-7 text-[#C5A832]" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-white">{t.modSquad}</CardTitle>
                    <CardDescription className="mt-1 text-white/70">{t.squadHeroDesc}</CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#C5A832]" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* Analysis modules grid */}
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#64748B]">{t.analysisModules}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {analysisModules.map((mod) => {
          const Icon = iconMap[mod.icon] || Activity;
          return (
            <Link key={mod.id} href={`/game/${groupId}/${mod.href}${periodQuery}`}>
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

      {/* Glossary link — discrete */}
      <div className="mt-8 text-center">
        <Link
          href={`/game/${groupId}/data-glossary${periodQuery}`}
          className="inline-flex items-center gap-2 text-sm text-[#64748B] transition-colors hover:text-[#1A365D]"
        >
          <BookOpen className="h-4 w-4" />
          {t.viewGlossary}
        </Link>
      </div>
    </main>
  );
}
