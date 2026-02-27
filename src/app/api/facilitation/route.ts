import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getGameDetails,
  getGameTeams,
  getEfficiencyData,
  getProfitabilityData,
  getBenchmarkingData,
} from "@/lib/data-provider";

export const maxDuration = 60;

const client = new Anthropic();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = parseInt(searchParams.get("groupId") || "0", 10);
  const period = parseInt(searchParams.get("period") || "0", 10);

  if (!groupId || !period) {
    return NextResponse.json(
      { error: "groupId e period são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    // Fetch all data in parallel
    const [game, teams, efficiency, profitability, benchmarking] =
      await Promise.all([
        getGameDetails(groupId),
        getGameTeams(groupId),
        getEfficiencyData(groupId, period),
        getProfitabilityData(groupId, period),
        getBenchmarkingData(groupId, period),
      ]);

    if (!game) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
    }

    // Build context summary for Claude
    const teamNames = teams.map((t) => t.nome || `Equipe ${t.numero}`).join(", ");

    // Efficiency summary
    const effSummary = Object.entries(efficiency)
      .map(([key, report]) => {
        const overloaded = report.teams
          .filter((t) => t.unmetDemand > 0)
          .map((t) => `${t.team} (${t.unmetDemand} perdidos, ${t.utilizationRate}%)`);
        const idle = report.teams
          .filter((t) => t.status === "overcapacity")
          .map((t) => `${t.team} (${t.utilizationRate}%)`);
        const ok = report.teams
          .filter((t) => t.status === "ok" && t.unmetDemand === 0)
          .map((t) => `${t.team} (${t.utilizationRate}%)`);
        return `${report.service}:\n  Sobrecarga: ${overloaded.length > 0 ? overloaded.join(", ") : "nenhum"}\n  Ociosidade: ${idle.length > 0 ? idle.join(", ") : "nenhum"}\n  OK: ${ok.join(", ") || "nenhum"}`;
      })
      .join("\n\n");

    // Profitability summary - group by team
    const profByTeam = new Map<string, { services: string[] }>();
    for (const p of profitability) {
      if (!profByTeam.has(p.team)) profByTeam.set(p.team, { services: [] });
      profByTeam.get(p.team)!.services.push(
        `${p.service}: receita bruta R$${(p.totalRevenue / 1e6).toFixed(1)}M, glosa R$${(p.disallowances / 1e6).toFixed(1)}M, margem contribuição ${p.marginPercent.toFixed(1)}%`
      );
    }
    const profSummary = Array.from(profByTeam.entries())
      .map(([team, data]) => `${team}:\n  ${data.services.join("\n  ")}`)
      .join("\n\n");

    // Benchmarking summary
    const benchSummary = benchmarking
      .map(
        (b) =>
          `#${b.overallRanking} ${b.team}: ação R$${b.sharePrice.toFixed(2)}, receita R$${(b.netRevenue / 1e6).toFixed(1)}M, resultado op. R$${(b.netOperatingIncome / 1e6).toFixed(1)}M (margem ${b.operatingMargin.toFixed(1)}%), ${b.patientsAttended} vidas, ${b.registeredDoctors} médicos`
      )
      .join("\n");

    const prompt = `Você é um consultor especialista em jogos de simulação de hospitais. Analise os dados abaixo do Trimestre ${period} do jogo "${game.codigo}" (${game.jogo_nome}) com ${teams.length} equipes competindo: ${teamNames}.

## DADOS DE EFICIÊNCIA OPERACIONAL (Capacidade vs Demanda)

${effSummary}

## DADOS DE LUCRATIVIDADE (por linha de serviço)

${profSummary}

## RANKING GERAL (Benchmarking)

${benchSummary}

---

Com base nestes dados, gere um Guia de Facilitação para o tutor/professor que vai conduzir a discussão em sala. O guia deve conter:

1. **RESUMO EXECUTIVO** (3-4 frases): Visão geral do trimestre — quem está se destacando, quais são as principais tensões competitivas.

2. **PERGUNTAS DE ABERTURA** (3 perguntas): Perguntas provocativas para abrir a discussão, sem revelar diretamente os dados mas estimulando reflexão.

3. **ANÁLISE POR TEMA** — Para cada tema abaixo, forneça 2 perguntas direcionadas e 1 insight que o tutor pode usar:
   - Gestão de Capacidade (eficiência operacional)
   - Estratégia de Preços e Receita (lucratividade)
   - Posicionamento Competitivo (benchmarking)

4. **DESTAQUES PARA DISCUSSÃO** (3-4 bullets): Situações específicas de equipes que merecem atenção — decisões ousadas, erros evidentes, recuperações, ou estratégias divergentes.

5. **PERGUNTA DE ENCERRAMENTO** (1 pergunta): Uma pergunta reflexiva para fechar a sessão, conectando os aprendizados ao mundo real da gestão hospitalar.

Regras:
- Use linguagem profissional mas acessível
- Referencie equipes pelo nome
- Inclua números específicos quando relevante
- Escreva em português brasileiro
- Use formatação markdown`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({
      content,
      game: game.codigo,
      period,
      teams: teams.length,
    });
  } catch (e) {
    console.error("Facilitation API error:", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Erro ao gerar guia de facilitação",
      },
      { status: 500 }
    );
  }
}
