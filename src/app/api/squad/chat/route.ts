import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchSquadData } from "@/lib/squad/data-fetcher";
import { type GameType, detectGameType, getGameConfig } from "@/lib/game-config";
import { getGameDetails } from "@/lib/data-provider";

export const runtime = "nodejs";
export const maxDuration = 60;

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

    // Detect game type and fetch data
    const game = await getGameDetails(groupId);
    const gameType: GameType = game ? detectGameType(game.jogo_nome) : "hospital";
    const config = getGameConfig(gameType);
    const dataContext = await fetchSquadData(groupId, period, gameType);

    const systemPrompt = `${config.squadPrompt}

## Dados Reais — ${config.periodLabel} ${period}

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
