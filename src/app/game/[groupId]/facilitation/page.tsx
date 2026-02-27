import { Header } from "@/components/header";
import { getGameDetails } from "@/lib/data-provider";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FacilitationContent } from "./facilitation-content";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function FacilitationPage({
  params,
  searchParams,
}: PageProps) {
  const { groupId } = await params;
  const { period: periodStr } = await searchParams;
  const gid = parseInt(groupId, 10);
  const game = await getGameDetails(gid);
  if (!game) return notFound();

  const period = periodStr
    ? parseInt(periodStr, 10)
    : game.ultimo_periodo_processado;

  const periods = Array.from(
    { length: game.ultimo_periodo_processado },
    (_, i) => i + 1
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href={`/game/${groupId}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao dashboard
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">
              Guia de Facilitação
            </h1>
            <Badge className="bg-[#C5A832] text-white hover:bg-[#8B7523]">
              Trimestre {period}
            </Badge>
          </div>
          <p className="mt-2 text-[#64748B]">
            Perguntas e insights gerados por IA para o tutor — {game.codigo}
          </p>
        </div>

        {/* Period selector */}
        <div className="mb-8 flex items-center gap-2">
          <span className="text-sm font-medium text-[#64748B]">Trimestre:</span>
          <div className="flex gap-1">
            {periods.map((p) => (
              <Link
                key={p}
                href={`/game/${groupId}/facilitation?period=${p}`}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  p === period
                    ? "bg-[#1A365D] text-white"
                    : "bg-white text-[#64748B] hover:bg-[#1A365D]/10 hover:text-[#1A365D]"
                }`}
              >
                T{p}
              </Link>
            ))}
          </div>
        </div>

        <FacilitationContent groupId={gid} period={period} />
      </main>
    </div>
  );
}
