import { Header } from "@/components/header";
import { getGameDetails, getQualityData } from "@/lib/data-provider";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { QualityContent } from "./quality-content";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function QualityPage({ params, searchParams }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { groupId } = await params;
  const { period: periodStr } = await searchParams;
  const gid = parseInt(groupId, 10);
  const game = await getGameDetails(gid);
  if (!game) return notFound();

  const period = periodStr ? parseInt(periodStr, 10) : game.ultimo_periodo_processado;
  const qualityData = await getQualityData(gid, period);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header userName={session.nome} />
      <QualityContent
        groupId={groupId}
        gameCode={game.codigo}
        period={period}
        maxPeriod={game.ultimo_periodo_processado}
        qualityData={qualityData}
      />
    </div>
  );
}
