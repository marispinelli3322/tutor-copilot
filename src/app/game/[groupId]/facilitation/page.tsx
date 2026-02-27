import { Header } from "@/components/header";
import { getGameDetails } from "@/lib/data-provider";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function FacilitationPage({ params }: PageProps) {
  const { groupId } = await params;
  const gid = parseInt(groupId, 10);
  const game = await getGameDetails(gid);
  if (!game) return notFound();

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

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">
              Guia de Facilitação
            </h1>
            <Badge className="bg-[#C5A832] text-white">
              Trimestre {game.ultimo_periodo_processado}
            </Badge>
          </div>
          <p className="mt-2 text-[#64748B]">
            Perguntas e insights para o tutor — {game.codigo}
          </p>
        </div>

        <Card className="border-[#C5A832]/30 bg-[#C5A832]/5">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1A365D]/10">
              <Sparkles className="h-8 w-8 text-[#C5A832]" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[#1A365D]">
              Em Breve
            </h2>
            <p className="max-w-md text-sm text-[#64748B]">
              Este módulo usará inteligência artificial para gerar automaticamente
              perguntas de facilitação, insights comparativos e sugestões de temas
              para discussão em sala de aula, baseados nos dados reais do jogo.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#64748B]">
              <MessageSquare className="h-4 w-4" />
              Powered by Claude AI
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
