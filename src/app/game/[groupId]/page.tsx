import { Header } from "@/components/header";
import { getGameDetails, getGameTeams } from "@/lib/data-provider";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { DashboardContent } from "./dashboard-content";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GameDashboard({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { groupId } = await params;
  const gid = parseInt(groupId, 10);
  const game = await getGameDetails(gid);
  if (!game) return notFound();

  const teams = await getGameTeams(gid);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header userName={session.nome} />
      <DashboardContent groupId={groupId} game={game as any} teams={teams} />
    </div>
  );
}
