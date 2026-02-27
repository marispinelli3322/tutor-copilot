import { Header } from "@/components/header";
import { getHospitalGames } from "@/lib/data-provider";
import { HomeContent } from "@/components/home-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let games: Awaited<ReturnType<typeof getHospitalGames>> = [];
  let error: string | null = null;

  try {
    games = await getHospitalGames();
  } catch (e) {
    error = e instanceof Error ? e.message : "Database connection error";
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <HomeContent games={games} error={error} />
    </div>
  );
}
