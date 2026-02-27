import { Header } from "@/components/header";
import { getActiveGames } from "@/lib/data-provider";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Play, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let games: Awaited<ReturnType<typeof getActiveGames>> = [];
  let error: string | null = null;

  try {
    games = await getActiveGames();
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "Não foi possível conectar ao banco de dados.";
  }

  // Separate hospital games from others
  const hospitalGames = games.filter((g) =>
    (g as { jogo_nome?: string }).jogo_nome?.toLowerCase().includes("hospit")
  );
  const otherGames = games.filter(
    (g) => !(g as { jogo_nome?: string }).jogo_nome?.toLowerCase().includes("hospit")
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">
            Jogos Ativos
          </h1>
          <p className="mt-2 text-[#64748B]">
            Selecione um jogo para visualizar as análises do tutor.
          </p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-700">
                <strong>Erro de conexão:</strong> {error}
              </p>
            </CardContent>
          </Card>
        )}

        {!error && games.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-[#64748B]">
                Nenhum jogo com rodadas processadas encontrado.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Hospital Games */}
        {hospitalGames.length > 0 && (
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#1A365D]" />
              <h2 className="text-lg font-semibold text-[#1A365D]">
                Jogos de Hospitais
              </h2>
              <Badge variant="secondary" className="bg-[#C5A832]/20 text-[#8B7523]">
                {hospitalGames.length}
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hospitalGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {/* Other Games */}
        {otherGames.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[#64748B]">
              Outros Jogos
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function GameCard({ game }: { game: Awaited<ReturnType<typeof getActiveGames>>[number] }) {
  const jogoNome = (game as { jogo_nome?: string }).jogo_nome;
  return (
    <Link href={`/game/${game.id}`}>
      <Card className="cursor-pointer transition-all hover:border-[#C5A832] hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-[#1A365D]">
              {game.codigo}
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-[#1A365D]/10 text-[#1A365D]"
            >
              T{game.ultimo_periodo_processado}
            </Badge>
          </div>
          {jogoNome && (
            <CardDescription>{jogoNome}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {game.num_empresas} equipes
            </span>
            <span className="flex items-center gap-1.5">
              <Play className="h-4 w-4" />
              {game.ultimo_periodo_processado} rodada
              {game.ultimo_periodo_processado > 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
