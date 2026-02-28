import { Header } from "@/components/header";
import { getGameDetails, getPricingData } from "@/lib/data-provider";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { PricingContent } from "./pricing-content";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function PricingPage({ params, searchParams }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { groupId } = await params;
  const { period: periodStr } = await searchParams;
  const gid = parseInt(groupId, 10);
  const game = await getGameDetails(gid);
  if (!game) return notFound();

  const period = periodStr ? parseInt(periodStr, 10) : game.ultimo_periodo_processado;
  const pricingData = await getPricingData(gid, period);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header userName={session.nome} />
      <PricingContent
        groupId={groupId}
        gameCode={game.codigo}
        period={period}
        maxPeriod={game.ultimo_periodo_processado}
        pricingData={pricingData}
      />
    </div>
  );
}
