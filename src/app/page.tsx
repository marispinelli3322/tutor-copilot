import { Header } from "@/components/header";
import { getActiveGames } from "@/lib/queries";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Play } from "lucide-react";

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
        : "Não foi possível conectar ao banco de dados. Verifique a VPN.";
  }

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
              <p className="mt-1 text-xs text-red-600">
                Certifique-se de que a VPN está conectada.
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link key={game.id} href={`/game/${game.id}`}>
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
                  <CardDescription>Jogo #{game.id}</CardDescription>
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
          ))}
        </div>
      </main>
    </div>
  );
}
