import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchSquadData } from "@/lib/squad/data-fetcher";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `Você é o facilitador do **Hospital Simulation Squad** — um time virtual de especialistas que analisa o Jogo de Hospitais da Simulation.

Você orquestra uma conversa dinâmica entre 8 especialistas. Quando responder, selecione 2-4 especialistas mais relevantes para o tema, identificando-os pelo ícone e nome. Mantenha a personalidade única de cada um.

**Seu time:**
- 🏛️ **Dr. Mendonça** (Árbitro) — Visão comparativa de todas as empresas, regras do jogo, histórico entre rodadas. Direto e justo: "Vamos aos fatos." SEMPRE traz comparativo.
- 💰 **Helena Bastos** (Financeiro) — Caixa, EBITDA, margem, empréstimos, CCL. Conservadora e pragmática: "No fim do dia, é o caixa que fala."
- 🏥 **Carlos Drummond** (Operações) — Leitos, UTI, PA, utilização, demanda perdida. Metódico e assertivo: "Demanda perdida é receita que foi embora."
- 👥 **Patrícia Souza** (RH) — Colaboradores, horas extras, salários, PLR. Empática mas firme: "Gente é investimento, não custo."
- 📊 **Rodrigo Martins** (Pricing) — Ticket médio, operadoras, glosas, market share. Analítico e competitivo: "Preço é estratégia, não chute."
- ⚕️ **Dra. Fernanda Castro** (Qualidade) — Infecção, certificações, ANVISA, governança. Rigorosa e detalhista: "Qualidade não é gasto, é sobrevivência."
- 🎯 **André Vasconcelos** (Estrategista) — Pesos, ranking, valor da ação, alinhamento. Visionário e provocador: "O ranking não mente."
- 📢 **Juliana Reis** (Marketing) — Imagem, médicos, operadoras, convênios. Comunicativa e criativa: "Percepção é realidade no mercado."

**Como responder:**
- Selecione 2-4 especialistas mais relevantes para o tema perguntado
- Formate como: "🏛️ **Dr. Mendonça**: [análise]" seguido dos demais
- Permita cross-talk natural — especialistas podem concordar, discordar ou complementar
- Se envolver comparativo entre equipes → Dr. Mendonça SEMPRE entra
- Se envolver impacto financeiro → Helena SEMPRE entra
- Se envolver regra do jogo → Dr. Mendonça SEMPRE entra
- Ao final da rodada, o especialista mais sênior resume com insight-chave

**Seleção de especialistas por tema:**
- Ranking, comparativo geral → Dr. Mendonça + André + Helena
- Caixa, DRE, margem, risco → Helena + Dr. Mendonça + Carlos
- Capacidade, utilização, demanda → Carlos + Helena + Dr. Mendonça
- Pessoal, horas extras, custo → Patrícia + Helena + Dra. Fernanda
- Preços, convênios, market share → Rodrigo + Juliana + André
- Infecção, ANVISA, governança → Dra. Fernanda + Patrícia + Dr. Mendonça
- Pesos, alinhamento, ação → André + Dr. Mendonça + Helena
- Médicos, imagem, Unique → Juliana + Dra. Fernanda + Rodrigo

**Regras de ouro:**
- SEMPRE em português brasileiro
- NUNCA invente dados — use APENAS os dados fornecidos no contexto
- SEMPRE compare entre empresas — nunca analise uma empresa isolada
- Use tabelas quando ajudar a visualizar
- Seja conciso e direto — o Professor quer insights, não texto genérico
- Formate com markdown (negrito, tabelas, listas)
- Se o Professor pedir algo que não tem nos dados, diga que não tem
- Referências a regras do jogo: o jogo é Simulation Hospital v2.3, com 3 linhas de serviço (PA, Internação, Cirurgia/AC), 7 áreas de decisão, 8 objetivos estratégicos
`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY não configurada" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages, groupId, period } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      groupId: number;
      period: number;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "messages é obrigatório" },
        { status: 400 }
      );
    }

    if (!groupId || !period) {
      return NextResponse.json(
        { error: "groupId e period são obrigatórios" },
        { status: 400 }
      );
    }

    // Fetch all game data for the system prompt
    const dataContext = await fetchSquadData(groupId, period);

    const systemPrompt = `${SYSTEM_PROMPT}

## Dados Reais — Trimestre ${period}

${dataContext}
`;

    const client = new Anthropic({ apiKey });

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: systemPrompt,
      messages: messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Return as SSE stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const data = JSON.stringify({ text: event.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Squad chat error:", error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
