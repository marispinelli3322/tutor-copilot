import { Header } from "@/components/header";
import { getGameDetails, getEfficiencyData } from "@/lib/data-provider";
import { detectGameType, getGameConfig } from "@/lib/game-config";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { EfficiencyContent } from "./efficiency-content";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function EfficiencyPage({
  params,
  searchParams,
}: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { groupId } = await params;
  const { period: periodStr } = await searchParams;
  const gid = parseInt(groupId, 10);
  const game = await getGameDetails(gid);
  if (!game) return notFound();
  const gameType = detectGameType(game.jogo_nome);

  const period = periodStr
    ? parseInt(periodStr, 10)
    : game.ultimo_periodo_processado;

  const config = getGameConfig(gameType);
  const efficiency = await getEfficiencyData(gid, period, gameType);
  const serviceKeys = Object.keys(efficiency);
  const serviceNames = Object.fromEntries(
    Object.entries(efficiency).map(([k, v]) => [k, v.service])
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header userName={session.nome} />
      <EfficiencyContent
        groupId={groupId}
        gameCode={game.codigo}
        period={period}
        maxPeriod={game.ultimo_periodo_processado}
        efficiency={efficiency}
        periodLabel={config.periodLabel}
        periodLabelShort={config.periodLabelShort}
        serviceKeys={serviceKeys}
        serviceNames={serviceNames}
      />
    </div>
  );
}
