import { Header } from "@/components/header";
import { getGameDetails, getEnvironmentalData } from "@/lib/data-provider";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { detectGameType } from "@/lib/game-config";
import { EnvironmentalContent } from "./environmental-content";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function EnvironmentalPage({ params, searchParams }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { groupId } = await params;
  const { period: periodStr } = await searchParams;
  const gid = parseInt(groupId, 10);
  const game = await getGameDetails(gid);
  if (!game) return notFound();

  const gameType = detectGameType(game.jogo_nome);
  if (gameType !== "esg") return notFound();

  const period = periodStr ? parseInt(periodStr, 10) : game.ultimo_periodo_processado;
  const envData = await getEnvironmentalData(gid, period, gameType);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header userName={session.nome} />
      <EnvironmentalContent
        groupId={groupId}
        gameCode={game.codigo}
        period={period}
        maxPeriod={game.ultimo_periodo_processado}
        data={envData}
      />
    </div>
  );
}
