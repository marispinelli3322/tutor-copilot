import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getGameDetails,
  getGameTeams,
  getEfficiencyData,
  getProfitabilityData,
  getBenchmarkingData,
} from "@/lib/data-provider";
import { getTranslations } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export const maxDuration = 60;

const client = new Anthropic();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = parseInt(searchParams.get("groupId") || "0", 10);
  const period = parseInt(searchParams.get("period") || "0", 10);
  const locale = (searchParams.get("locale") || "pt") as Locale;
  const t = getTranslations(locale === "en" ? "en" : "pt");

  if (!groupId || !period) {
    return NextResponse.json(
      { error: "groupId and period are required" },
      { status: 400 }
    );
  }

  try {
    const [game, teams, efficiency, profitability, benchmarking] =
      await Promise.all([
        getGameDetails(groupId),
        getGameTeams(groupId),
        getEfficiencyData(groupId, period),
        getProfitabilityData(groupId, period),
        getBenchmarkingData(groupId, period),
      ]);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const teamNames = teams.map((t) => t.nome || `Team ${t.numero}`).join(", ");

    // Efficiency summary
    const effSummary = Object.entries(efficiency)
      .map(([key, report]) => {
        const overloaded = report.teams
          .filter((t) => t.unmetDemand > 0)
          .map((t) => `${t.team} (${t.unmetDemand} lost, ${t.utilizationRate}%)`);
        const idle = report.teams
          .filter((t) => t.status === "overcapacity")
          .map((t) => `${t.team} (${t.utilizationRate}%)`);
        const ok = report.teams
          .filter((t) => t.status === "ok" && t.unmetDemand === 0)
          .map((t) => `${t.team} (${t.utilizationRate}%)`);
        return `${report.service}:\n  Overload: ${overloaded.length > 0 ? overloaded.join(", ") : "none"}\n  Idle: ${idle.length > 0 ? idle.join(", ") : "none"}\n  OK: ${ok.join(", ") || "none"}`;
      })
      .join("\n\n");

    // Profitability summary
    const profByTeam = new Map<string, { services: string[] }>();
    for (const p of profitability) {
      if (!profByTeam.has(p.team)) profByTeam.set(p.team, { services: [] });
      profByTeam.get(p.team)!.services.push(
        `${p.service}: gross revenue R$${(p.totalRevenue / 1e6).toFixed(1)}M, disallowances R$${(p.disallowances / 1e6).toFixed(1)}M, contribution margin ${p.marginPercent.toFixed(1)}%`
      );
    }
    const profSummary = Array.from(profByTeam.entries())
      .map(([team, data]) => `${team}:\n  ${data.services.join("\n  ")}`)
      .join("\n\n");

    // Benchmarking summary
    const benchSummary = benchmarking
      .map(
        (b) =>
          `#${b.overallRanking} ${b.team}: share R$${b.sharePrice.toFixed(2)}, revenue R$${(b.netRevenue / 1e6).toFixed(1)}M, op. result R$${(b.netOperatingIncome / 1e6).toFixed(1)}M (margin ${b.operatingMargin.toFixed(1)}%), ${b.patientsAttended} patients, ${b.registeredDoctors} doctors`
      )
      .join("\n");

    const langInstruction = t.aiLanguage;

    const prompt = `You are a specialist consultant in hospital business simulation games. Analyze the data below for Quarter ${period} of game "${game.codigo}" (${game.jogo_nome}) with ${teams.length} teams competing: ${teamNames}.

## OPERATIONAL EFFICIENCY DATA (Capacity vs Demand)

${effSummary}

## PROFITABILITY DATA (by service line)

${profSummary}

## OVERALL RANKING (Benchmarking)

${benchSummary}

---

Based on this data, generate a Facilitation Guide for the tutor/professor who will lead the class discussion. The guide must contain:

1. **EXECUTIVE SUMMARY** (3-4 sentences): Quarter overview — who is standing out, what are the main competitive tensions.

2. **OPENING QUESTIONS** (3 questions): Provocative questions to open the discussion, without directly revealing data but stimulating reflection.

3. **ANALYSIS BY THEME** — For each theme below, provide 2 targeted questions and 1 insight the tutor can use:
   - Capacity Management (operational efficiency)
   - Pricing and Revenue Strategy (profitability)
   - Competitive Positioning (benchmarking)

4. **DISCUSSION HIGHLIGHTS** (3-4 bullets): Specific team situations that deserve attention — bold decisions, evident mistakes, recoveries, or divergent strategies.

5. **CLOSING QUESTION** (1 question): A reflective question to close the session, connecting learnings to real-world hospital management.

Rules:
- Use professional but accessible language
- Reference teams by name
- Include specific numbers when relevant
- Write entirely in ${langInstruction}
- Use markdown formatting`;

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
          e instanceof Error ? e.message : "Error generating facilitation guide",
      },
      { status: 500 }
    );
  }
}
