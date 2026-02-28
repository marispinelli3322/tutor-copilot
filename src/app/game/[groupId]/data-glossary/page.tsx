import { Header } from "@/components/header";
import { getGameDetails } from "@/lib/data-provider";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { DataGlossaryContent } from "./data-glossary-content";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function DataGlossaryPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { groupId } = await params;
  const gid = parseInt(groupId, 10);
  const game = await getGameDetails(gid);
  if (!game) return notFound();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header userName={session.nome} />
      <DataGlossaryContent
        groupId={groupId}
        gameCode={game.codigo}
      />
    </div>
  );
}
