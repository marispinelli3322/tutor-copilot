import { Header } from "@/components/header";
import { getGameDetails, getBenchmarkingData } from "@/lib/data-provider";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { BenchmarkingContent } from "./benchmarking-content";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function BenchmarkingPage({ params, searchParams }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { groupId } = await params;
  const { period: periodStr } = await searchParams;
  const gid = parseInt(groupId, 10);
  const game = await getGameDetails(gid);
  if (!game) return notFound();

  const period = periodStr ? parseInt(periodStr, 10) : game.ultimo_periodo_processado;
  const benchData = await getBenchmarkingData(gid, period);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header userName={session.nome} />
      <BenchmarkingContent
        groupId={groupId}
        gameCode={game.codigo}
        period={period}
        maxPeriod={game.ultimo_periodo_processado}
        benchData={benchData}
      />
    </div>
  );
}
