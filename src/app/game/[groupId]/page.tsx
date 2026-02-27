import { Header } from "@/components/header";
import { getGameDetails, getGameTeams } from "@/lib/data-provider";
import { MODULES } from "@/lib/constants";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  DollarSign,
  BarChart3,
  MessageSquare,
  ArrowLeft,
  Users,
  GraduationCap,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Activity,
  DollarSign,
  BarChart3,
  MessageSquare,
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GameDashboard({ params }: PageProps) {
  const { groupId } = await params;
  const gid = parseInt(groupId, 10);
  const game = await getGameDetails(gid);

  if (!game) return notFound();

  const teams = await getGameTeams(gid);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos jogos
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">
              {game.codigo || `Jogo #${game.id}`}
            </h1>
            <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">
              Trimestre {game.ultimo_periodo_processado}
            </Badge>
          </div>
          <p className="mt-2 text-[#64748B]">
            {game.jogo_nome} — {teams.length} equipes competindo
          </p>
          {(game as { professor?: string | null }).professor && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#8B7523]">
              <GraduationCap className="h-4 w-4" />
              {(game as { professor?: string | null }).professor}
            </p>
          )}
        </div>

        {/* Teams overview */}
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#64748B]">
            Equipes
          </h2>
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => (
              <Badge
                key={team.id}
                variant="outline"
                className="gap-1.5 px-3 py-1.5"
              >
                <Users className="h-3 w-3" />
                {team.nome || `Equipe ${team.numero}`}
              </Badge>
            ))}
          </div>
        </div>

        {/* Period selector hint */}
        <div className="mb-6 rounded-lg border border-[#C5A832]/30 bg-[#C5A832]/5 p-3">
          <p className="text-sm text-[#8B7523]">
            Analisando o <strong>Trimestre {game.ultimo_periodo_processado}</strong>.
            Use o seletor de período dentro de cada módulo para navegar entre trimestres.
          </p>
        </div>

        {/* Analysis modules */}
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#64748B]">
          Módulos de Análise
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {MODULES.map((mod) => {
            const Icon = iconMap[mod.icon] || Activity;
            return (
              <Link
                key={mod.id}
                href={`/game/${groupId}/${mod.href}?period=${game.ultimo_periodo_processado}`}
              >
                <Card className="cursor-pointer transition-all hover:border-[#C5A832] hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A365D]/10">
                        <Icon className="h-5 w-5 text-[#1A365D]" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-[#1A365D]">
                          {mod.title}
                        </CardTitle>
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
    </div>
  );
}
