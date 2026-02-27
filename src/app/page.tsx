import { Header } from "@/components/header";
import { getHospitalGames } from "@/lib/data-provider";
import { GameList } from "@/components/game-list";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let games: Awaited<ReturnType<typeof getHospitalGames>> = [];
  let error: string | null = null;

  try {
    games = await getHospitalGames();
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "Não foi possível conectar ao banco de dados.";
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">
            Jogos de Hospitais
          </h1>
          <p className="mt-2 text-[#64748B]">
            Selecione um jogo para visualizar as análises do tutor.
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-700">
                <strong>Erro de conexão:</strong> {error}
              </p>
            </CardContent>
          </Card>
        )}

        {!error && <GameList games={games} />}
      </main>
    </div>
  );
}
