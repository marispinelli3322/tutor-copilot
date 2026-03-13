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
} from "@/lib/data-provider";

export async function fetchSquadData(groupId: number, period: number): Promise<string> {
  const [
    game,
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
  ] = await Promise.all([
    getGameDetails(groupId),
    getGameTeams(groupId),
    getEfficiencyData(groupId, period),
    getProfitabilityData(groupId, period),
    getBenchmarkingData(groupId, period),
    getGovernanceData(groupId, period),
    getFinancialRiskData(groupId, period),
    getStrategyAlignmentData(groupId, period),
    getPricingData(groupId, period),
    getQualityData(groupId, period),
    getLostRevenueData(groupId, period),
  ]);

  if (!game) return "Jogo não encontrado.";

  const teamNames = teams.map((t) => t.nome || `Equipe ${t.numero}`).join(", ");

  const sections: string[] = [];

  // Game context
  sections.push(`## Contexto do Jogo
- **Jogo**: ${game.codigo} (${game.jogo_nome})
- **Trimestre**: ${period}
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

  return sections.join("\n\n");
}
