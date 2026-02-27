import { Header } from "@/components/header";
import { getGameDetails, getProfitabilityData } from "@/lib/data-provider";
import { notFound } from "next/navigation";
import { ProfitabilityContent } from "./profitability-content";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function ProfitabilityPage({ params, searchParams }: PageProps) {
  const { groupId } = await params;
  const { period: periodStr } = await searchParams;
  const gid = parseInt(groupId, 10);
  const game = await getGameDetails(gid);
  if (!game) return notFound();

  const period = periodStr ? parseInt(periodStr, 10) : game.ultimo_periodo_processado;
  const profData = await getProfitabilityData(gid, period);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <ProfitabilityContent
        groupId={groupId}
        gameCode={game.codigo}
        period={period}
        maxPeriod={game.ultimo_periodo_processado}
        profData={profData}
      />
    </div>
  );
}
