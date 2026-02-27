"use client";

import { useLocale } from "@/lib/use-locale";
import { Card, CardContent } from "@/components/ui/card";
import { GameList } from "@/components/game-list";
import type { GameWithProfessors } from "@/lib/queries";

interface Props {
  games: GameWithProfessors[];
  error: string | null;
}

export function HomeContent({ games, error }: Props) {
  const { t } = useLocale();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.hospitalGames}</h1>
        <p className="mt-2 text-[#64748B]">{t.selectGame}</p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700"><strong>{t.connectionError}:</strong> {error}</p>
          </CardContent>
        </Card>
      )}

      {!error && <GameList games={games} />}
    </main>
  );
}
