import { Header } from "@/components/header";
import { getGames } from "@/lib/data-provider";
import { HomeContent } from "@/components/home-content";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let games: Awaited<ReturnType<typeof getGames>> = [];
  let error: string | null = null;

  try {
    games = await getGames(session.isAdmin ? undefined : session.userId);
  } catch (e) {
    error = e instanceof Error ? e.message : "Database connection error";
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header userName={session.nome} />
      <HomeContent games={games} error={error} />
    </div>
  );
}
