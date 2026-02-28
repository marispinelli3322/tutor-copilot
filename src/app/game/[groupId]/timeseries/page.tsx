import { Header } from "@/components/header";
import { getGameDetails, getTimeseriesData } from "@/lib/data-provider";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { TimeseriesContent } from "./timeseries-content";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function TimeseriesPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { groupId } = await params;
  const gid = parseInt(groupId, 10);
  const game = await getGameDetails(gid);
  if (!game) return notFound();

  const dataset = await getTimeseriesData(gid, game.ultimo_periodo_processado);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header userName={session.nome} />
      <TimeseriesContent
        groupId={groupId}
        gameCode={game.codigo}
        maxPeriod={game.ultimo_periodo_processado}
        dataset={dataset}
      />
    </div>
  );
}
