/**
 * Fetches all module data for a game/period and formats as markdown context
 * for the Simulation Squad system prompt.
 */

import {
  getGameDetails,
  getGameTeams,
  getEfficiencyData,
  getProfitabilityData,
  getBenchmarkingData,
  getGovernanceData,
  getFinancialRiskData,
  getStrategyAlignmentData,
  getPricingData,
  getQualityData,
  getLostRevenueData,
  getEnvironmentalData,
} from "@/lib/data-provider";
import { type GameType, detectGameType, getGameConfig } from "@/lib/game-config";

export async function fetchSquadData(groupId: number, period: number, gameType?: GameType): Promise<string> {
  const game = await getGameDetails(groupId);
  if (!game) return "Jogo não encontrado.";

  const resolvedGameType = gameType || detectGameType(game.jogo_nome);
  const config = getGameConfig(resolvedGameType);

  const [
    teams,
    efficiency,
    profitability,
    benchmarking,
    governance,
    financialRisk,
    strategy,
    pricing,
    quality,
    lostRevenue,
    environmental,
  ] = await Promise.all([
    getGameTeams(groupId),
    getEfficiencyData(groupId, period, resolvedGameType),
    getProfitabilityData(groupId, period, resolvedGameType),
    getBenchmarkingData(groupId, period, resolvedGameType),
    getGovernanceData(groupId, period, resolvedGameType),
    getFinancialRiskData(groupId, period, resolvedGameType),
    getStrategyAlignmentData(groupId, period, resolvedGameType),
    getPricingData(groupId, period, resolvedGameType),
    getQualityData(groupId, period, resolvedGameType),
    getLostRevenueData(groupId, period, resolvedGameType),
    resolvedGameType === "esg" ? getEnvironmentalData(groupId, period, resolvedGameType) : Promise.resolve([]),
  ]);

  const teamNames = teams.map((t) => t.nome || `Equipe ${t.numero}`).join(", ");

  const sections: string[] = [];

  // Game context
  sections.push(`## Contexto do Jogo
- **Jogo**: ${game.codigo} (${game.jogo_nome})
- **${config.periodLabel}**: ${period}
- **Professor**: ${game.professor || "N/A"}
- **Equipes (${teams.length})**: ${teamNames}`);

  // M3: Benchmarking / Ranking
  if (benchmarking.length > 0) {
    const rows = benchmarking.map(
      (b) =>
        `| #${b.overallRanking} | ${b.team} | R$${b.sharePrice.toFixed(2)} | R$${(b.netRevenue / 1e6).toFixed(1)}M | ${b.operatingMargin.toFixed(1)}% | ${b.patientsAttended} | ${b.registeredDoctors} | R$${(b.nwc / 1e6).toFixed(1)}M |`
    );
    sections.push(`## Ranking Geral (Benchmarking)
| Pos | Equipe | Ação | Receita Líq. | Margem Op. | Vidas | Médicos | CCL |
|-----|--------|------|-------------|-----------|-------|---------|-----|
${rows.join("\n")}`);
  }

  // M1: Efficiency
  for (const [, report] of Object.entries(efficiency)) {
    const rows = report.teams.map(
      (t) =>
        `| ${t.team} | ${t.capacity} | ${t.volumeServed} | ${t.utilizationRate}% | ${t.unmetDemand} | ${t.status} |`
    );
    sections.push(`## Eficiência — ${report.service}
| Equipe | Capacidade | Atendidos | Utilização | Demanda Perdida | Status |
|--------|-----------|----------|-----------|----------------|--------|
${rows.join("\n")}
${report.takeaways.map((t) => `- ${t}`).join("\n")}`);
  }

  // M2: Profitability
  if (profitability.length > 0) {
    const rows = profitability.map(
      (p) =>
        `| ${p.team} | ${p.service} | R$${(p.totalRevenue / 1e6).toFixed(1)}M | R$${(p.disallowances / 1e6).toFixed(1)}M | R$${(p.netRevenue / 1e6).toFixed(1)}M | R$${(p.contributionMargin / 1e6).toFixed(1)}M | ${p.marginPercent.toFixed(1)}% |`
    );
    sections.push(`## Lucratividade por Serviço
| Equipe | Serviço | Receita Bruta | Glosas | Receita Líq. | Margem Contrib. | Margem % |
|--------|---------|-------------|--------|-------------|----------------|---------|
${rows.join("\n")}`);
  }

  // M6: Financial Risk
  if (financialRisk.length > 0) {
    const rows = financialRisk.map(
      (f) =>
        `| ${f.team} | R$${(f.saldoFinal / 1e6).toFixed(1)}M | R$${(f.capitalCirculanteLiq / 1e6).toFixed(1)}M | ${f.alavancagem.toFixed(2)} | R$${(f.creditoRotativo / 1e6).toFixed(1)}M | ${f.planoEmergencial > 0 ? "SIM" : "Não"} | ${f.riskStatus} |`
    );
    sections.push(`## Risco Financeiro
| Equipe | Caixa | CCL | Alavancagem | Rotativo | Emergencial | Status |
|--------|-------|-----|------------|----------|-------------|--------|
${rows.join("\n")}`);
  }

  // M9: Governance
  if (governance.length > 0) {
    const rows = governance.map(
      (g) =>
        `| ${g.team} | ${g.score.toFixed(1)} | ${g.creditoRotativo} | ${g.totalDispensa} | ${g.usoMaoObraExtra} | ${g.numeroCertificacoes} | ${g.transparencia} | ${g.taxaInfeccao.toFixed(2)} |`
    );
    sections.push(`## Governança Corporativa
| Equipe | Score | Rotativo | Demissões | H.Extra | Certificações | Transparência | Infecção |
|--------|-------|---------|-----------|---------|--------------|--------------|----------|
${rows.join("\n")}`);
  }

  // M7: Strategy Alignment
  if (strategy.length > 0) {
    const summaryRows = strategy.map((s) => {
      const highWeightItems = s.items
        .filter((i) => i.weight >= 2)
        .map((i) => `${i.itemName}(p${i.weight}, #${i.ranking}${i.aligned ? "✓" : "✗"})`)
        .join(", ");
      return `| ${s.team} | ${s.alignmentScore.toFixed(0)}% | ${highWeightItems} |`;
    });
    sections.push(`## Alinhamento Estratégico
| Equipe | Score | Itens Prioritários (peso≥2, ranking, alinhado?) |
|--------|-------|----------------------------------------------|
${summaryRows.join("\n")}`);
  }

  // M8: Pricing
  if (pricing.length > 0) {
    const rows = pricing.map(
      (p) =>
        `| ${p.team} | R$${p.pricePA.toFixed(0)} | R$${p.priceINT.toFixed(0)} | R$${p.priceAC.toFixed(0)} | ${(p.marketSharePA * 100).toFixed(1)}% | ${(p.marketShareINT * 100).toFixed(1)}% | ${(p.marketShareAC * 100).toFixed(1)}% |`
    );
    sections.push(`## Precificação e Market Share
| Equipe | Preço PA | Preço INT | Preço AC | Share PA | Share INT | Share AC |
|--------|---------|----------|---------|---------|----------|---------|
${rows.join("\n")}`);
  }

  // M10: Quality
  if (quality.length > 0) {
    const rows = quality.map(
      (q) =>
        `| ${q.team} | ${q.taxaInfeccao.toFixed(2)} | ${q.certificacoes} | ${q.alertaAnvisa} | ${q.multaAnvisa} | ${q.qualityStatus} |`
    );
    sections.push(`## Qualidade Assistencial
| Equipe | Infecção | Certificações | Alertas ANVISA | Multas | Status |
|--------|---------|--------------|---------------|--------|--------|
${rows.join("\n")}`);
  }

  // M11: Lost Revenue
  if (lostRevenue.length > 0) {
    const rows = lostRevenue.map(
      (l) =>
        `| ${l.team} | R$${(l.totalLostRevenue / 1e6).toFixed(2)}M | ${l.pctRevenueLost.toFixed(1)}% | ${l.dominantType} |`
    );
    sections.push(`## Receita Perdida
| Equipe | Total Perdido | % Receita | Tipo Dominante |
|--------|-------------|----------|---------------|
${rows.join("\n")}`);
  }

  // Environmental (ESG only)
  if (environmental.length > 0) {
    const rows = environmental.map(
      (e) =>
        `| ${e.team} | ${e.nivelPluma.toFixed(1)} | ${e.smsAmbiental.toFixed(1)} | ${e.multaAmbiental} | ${e.numeroCertificacoesESG} | ${e.envStatus} |`
    );
    sections.push(`## Gestão Ambiental
| Equipe | Pluma | SMS | Multas | Cert. ESG | Status |
|--------|-------|-----|--------|----------|--------|
${rows.join("\n")}`);
  }

  return sections.join("\n\n");
}
