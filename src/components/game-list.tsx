"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Play, Search, GraduationCap, X } from "lucide-react";
import type { GameWithProfessors } from "@/lib/queries";
import { useLocale } from "@/lib/use-locale";

interface GameListProps {
  games: GameWithProfessors[];
}

export function GameList({ games }: GameListProps) {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [professorFilter, setProfessorFilter] = useState("");
  const [showProfessorDropdown, setShowProfessorDropdown] = useState(false);

  const allProfessors = useMemo(() => {
    const profs = new Set<string>();
    for (const game of games) {
      for (const p of game.professors) {
        if (p && p !== "ADMIN" && p !== "ARBITRO TESTE") {
          profs.add(p);
        }
      }
    }
    return Array.from(profs).sort();
  }, [games]);

  const filteredProfessors = useMemo(() => {
    if (!professorFilter) return allProfessors;
    const q = professorFilter.toLowerCase();
    return allProfessors.filter((p) => p.toLowerCase().includes(q));
  }, [allProfessors, professorFilter]);

  const filteredGames = useMemo(() => {
    let result = games;
    if (professorFilter && allProfessors.includes(professorFilter)) {
      result = result.filter((g) => g.professors.includes(professorFilter));
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.codigo.toLowerCase().includes(q) ||
          (g.nome && g.nome.toLowerCase().includes(q))
      );
    }
    return result;
  }, [games, search, professorFilter, allProfessors]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder={t.filterByProfessor}
            value={professorFilter}
            onChange={(e) => {
              setProfessorFilter(e.target.value);
              setShowProfessorDropdown(true);
            }}
            onFocus={() => setShowProfessorDropdown(true)}
            onBlur={() => setTimeout(() => setShowProfessorDropdown(false), 200)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-8 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#C5A832] focus:outline-none focus:ring-2 focus:ring-[#C5A832]/20"
          />
          {professorFilter && (
            <button
              onClick={() => {
                setProfessorFilter("");
                setShowProfessorDropdown(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1A365D]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {showProfessorDropdown && filteredProfessors.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {filteredProfessors.slice(0, 20).map((prof) => (
                <button
                  key={prof}
                  onMouseDown={() => {
                    setProfessorFilter(prof);
                    setShowProfessorDropdown(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-[#1E293B] hover:bg-[#C5A832]/10"
                >
                  {prof}
                </button>
              ))}
              {filteredProfessors.length > 20 && (
                <div className="px-4 py-2 text-xs text-[#94A3B8]">
                  +{filteredProfessors.length - 20} more...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder={t.searchGame}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-8 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#C5A832] focus:outline-none focus:ring-2 focus:ring-[#C5A832]/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1A365D]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-[#64748B]">
        {t.gamesFound(filteredGames.length)}
        {professorFilter && allProfessors.includes(professorFilter) && (
          <span>
            {" "}{t.forProfessor}{" "}
            <strong className="text-[#1A365D]">{professorFilter}</strong>
          </span>
        )}
      </div>

      {filteredGames.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[#64748B]">{t.noGamesFound}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGames.map((game) => (
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
                <CardDescription>{game.jogo_nome}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {game.num_empresas} {t.teams}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Play className="h-4 w-4" />
                    {game.ultimo_periodo_processado}{" "}
                    {game.ultimo_periodo_processado > 1 ? t.rounds : t.round}
                  </span>
                </div>
                {game.professors.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[#8B7523]">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {game.professors
                        .filter((p) => p !== "ADMIN" && p !== "ARBITRO TESTE")
                        .join(", ")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
