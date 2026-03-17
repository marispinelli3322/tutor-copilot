/**
 * Fetches all module data for a game/period and formats as markdown context
 * for the Simulation Squad system prompt.
 *
 * CRITICAL: This context is ALL the AI has. If data is empty, we MUST say so
 * explicitly — never silently omit sections, or the AI will hallucinate.
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
  getInventoryData,
  getRawVariableData,
  getAllDecisionsData,
} from "@/lib/data-provider";
import { type GameType, detectGameType, getGameConfig } from "@/lib/game-config";

// ── Helper: format number as Brazilian currency ─────────────
function fmt(v: number, decimals = 0): string {
  if (v === 0) return "0";
  if (Math.abs(v) >= 1e6) return `R$${(v / 1e6).toFixed(1)}M`;
  if (Math.abs(v) >= 1e3) return `R$${(v / 1e3).toFixed(0)}k`;
  return `R$${v.toFixed(decimals)}`;
}
function pct(v: number): string { return `${v.toFixed(1)}%`; }
function num(v: number): string { return v.toLocaleString("pt-BR"); }

export async function fetchSquadData(groupId: number, period: number, gameType?: GameType): Promise<string> {
  const game = await getGameDetails(groupId);
  if (!game) return "⚠️ ERRO: Jogo não encontrado. Não há dados disponíveis. Informe ao professor que o jogo não foi localizado.";

  const resolvedGameType = gameType || detectGameType(game.jogo_nome);
  const config = getGameConfig(resolvedGameType);
  const isESG = resolvedGameType === "esg";

  // ── Import report code arrays ──────────────────────────────
  const hospitalCodes = isESG ? null : await import("@/lib/game-configs/hospital");

  // ── Fetch ALL data in parallel ────────────────────────────
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
    inventory,
    // New: full report data
    dreData,
    balanceData,
    cashFlowData,
    indicatorsData,
    hrOpsData,
    rankingData,
    statsData,
    decisionsData,
  ] = await Promise.all([
    getGameTeams(groupId),
    getEfficiencyData(groupId, period, resolvedGameType),
    getProfitabilityData(groupId, period, resolvedGameType),
    getBenchmarkingData(groupId, period, resolvedGameType),
    getGovernanceData(groupId, period, resolvedGameType),
    getFinancialRiskData(groupId, period, resolvedGameType),
    getStrategyAlignmentData(groupId, period, resolvedGameType),
    getPricingData(groupId, period, resolvedGameType),
    isESG ? Promise.resolve([]) : getQualityData(groupId, period, resolvedGameType),
    getLostRevenueData(groupId, period, resolvedGameType),
    isESG ? getEnvironmentalData(groupId, period, resolvedGameType) : Promise.resolve([]),
    isESG ? getInventoryData(groupId, period, resolvedGameType) : Promise.resolve([]),
    // New report sections (Hospital only for now)
    !isESG && hospitalCodes ? getRawVariableData(groupId, period, hospitalCodes.HOSPITAL_DRE_CODES, resolvedGameType) : Promise.resolve({}),
    !isESG && hospitalCodes ? getRawVariableData(groupId, period, hospitalCodes.HOSPITAL_BALANCE_SHEET_FULL_CODES, resolvedGameType) : Promise.resolve({}),
    !isESG && hospitalCodes ? getRawVariableData(groupId, period, hospitalCodes.HOSPITAL_CASH_FLOW_EXTRA_CODES, resolvedGameType) : Promise.resolve({}),
    !isESG && hospitalCodes ? getRawVariableData(groupId, period, hospitalCodes.HOSPITAL_FINANCIAL_INDICATORS_CODES, resolvedGameType) : Promise.resolve({}),
    !isESG && hospitalCodes ? getRawVariableData(groupId, period, hospitalCodes.HOSPITAL_HR_OPERATIONS_CODES, resolvedGameType) : Promise.resolve({}),
    !isESG && hospitalCodes ? getRawVariableData(groupId, period, hospitalCodes.HOSPITAL_RANKING_DETAIL_CODES, resolvedGameType) : Promise.resolve({}),
    !isESG && hospitalCodes ? getRawVariableData(groupId, period, hospitalCodes.HOSPITAL_MARKET_STATS_CODES, resolvedGameType) : Promise.resolve({}),
    !isESG && hospitalCodes ? getAllDecisionsData(groupId, period, hospitalCodes.HOSPITAL_ALL_DECISION_CODES, resolvedGameType) : Promise.resolve({}),
  ]);

  const teamNames = teams.map((t) => t.nome || `Equipe ${t.numero}`).join(", ");
  const sections: string[] = [];

  // ── Game context ──────────────────────────────────────────
  sections.push(`## Contexto do Jogo
- **Jogo**: ${game.codigo} (${game.jogo_nome})
- **Tipo**: ${isESG ? "Negócios ESG (Indústria Química)" : "Hospitais"}
- **${config.periodLabel}**: ${period}
- **Professor**: ${game.professor || "N/A"}
- **Equipes (${teams.length})**: ${teamNames}`);

  // ── M3: Benchmarking / Ranking ────────────────────────────
  if (benchmarking.length > 0) {
    if (isESG) {
      const rows = benchmarking.map(
        (b) =>
          `| #${b.overallRanking} | ${b.team} | R$${b.sharePrice.toFixed(2)} | ${fmt(b.netRevenue)} | ${pct(b.operatingMargin)} | ${b.patientsAttended} | ${b.registeredDoctors.toFixed(1)} | ${fmt(b.nwc)} |`
      );
      sections.push(`## Ranking Geral (Benchmarking)
| Pos | Equipe | Ação | Receita Líq. | Margem Op. | Lotes Vendidos | Gov. ESG | CCL |
|-----|--------|------|-------------|-----------|----------------|----------|-----|
${rows.join("\n")}`);
    } else {
      const rows = benchmarking.map(
        (b) =>
          `| #${b.overallRanking} | ${b.team} | R$${b.sharePrice.toFixed(2)} | ${fmt(b.netRevenue)} | ${pct(b.operatingMargin)} | ${num(b.patientsAttended)} | ${num(b.registeredDoctors)} | ${fmt(b.nwc)} | ${fmt(b.totalAtivo)} | ${fmt(b.patrimonioLiquido)} |`
      );
      sections.push(`## Ranking Geral (Benchmarking)
| Pos | Equipe | Ação | Receita Líq. | Margem Op. | Vidas | Médicos | CCL | Ativo Total | PL |
|-----|--------|------|-------------|-----------|-------|---------|-----|------------|-----|
${rows.join("\n")}`);
    }
  } else {
    sections.push(`## Ranking Geral (Benchmarking)
⚠️ SEM DADOS de benchmarking para este período.`);
  }

  // ── M1: Efficiency ────────────────────────────────────────
  const efficiencyEntries = Object.entries(efficiency);
  if (efficiencyEntries.length > 0) {
    for (const [, report] of efficiencyEntries) {
      const rows = report.teams.map(
        (t) =>
          `| ${t.team} | ${t.capacity} | ${t.volumeServed} | ${pct(t.utilizationRate)} | ${t.unmetDemand} | ${t.status} |`
      );
      const sectionTitle = isESG ? "Eficiência Produtiva" : "Eficiência Operacional";
      sections.push(`## ${sectionTitle} — ${report.service}
| Equipe | Capacidade | ${isESG ? "Lotes Vendidos" : "Atendidos"} | Utilização | ${isESG ? "Vendas Perdidas" : "Demanda Perdida"} | Status |
|--------|-----------|----------|-----------|----------------|--------|
${rows.join("\n")}
${report.takeaways.map((t) => `- ${t}`).join("\n")}`);
    }
  } else {
    sections.push(`## ${isESG ? "Eficiência Produtiva" : "Eficiência Operacional"}
⚠️ SEM DADOS de eficiência para este período.`);
  }

  // ── M2: Profitability ─────────────────────────────────────
  if (profitability.length > 0) {
    const rows = profitability.map(
      (p) =>
        `| ${p.team} | ${p.service} | ${fmt(p.totalRevenue)} | ${fmt(p.disallowances)} | ${fmt(p.netRevenue)} | ${fmt(p.contributionMargin)} | ${pct(p.marginPercent)} |`
    );
    sections.push(`## Lucratividade por ${isESG ? "Produto" : "Serviço"}
| Equipe | ${isESG ? "Produto" : "Serviço"} | Receita Bruta | ${isESG ? "Devoluções" : "Glosas"} | Receita Líq. | Margem Contrib. | Margem % |
|--------|---------|-------------|--------|-------------|----------------|---------|
${rows.join("\n")}`);
  } else {
    sections.push(`## Lucratividade
⚠️ SEM DADOS de lucratividade para este período.`);
  }

  // ── M6: Financial Risk ────────────────────────────────────
  if (financialRisk.length > 0) {
    const rows = financialRisk.map(
      (f) =>
        `| ${f.team} | ${fmt(f.saldoFinal)} | ${fmt(f.capitalCirculanteLiq)} | ${fmt(f.patrimonioLiquido)} | ${f.alavancagem.toFixed(2)} | ${fmt(f.creditoRotativo)} | ${f.planoEmergencial > 0 ? "SIM ⚠️" : "Não"} | ${f.insolvente ? "⚠️ INSOLVENTE" : f.riskStatus} |`
    );
    sections.push(`## Risco Financeiro
| Equipe | Caixa | CCL | PL | Alavancagem | Rotativo | Emergencial | Status |
|--------|-------|-----|-----|------------|----------|-------------|--------|
${rows.join("\n")}`);
  } else {
    sections.push(`## Risco Financeiro
⚠️ SEM DADOS de risco financeiro para este período.`);
  }

  // ── NEW: DRE (Hospital) ───────────────────────────────────
  if (!isESG && Object.keys(dreData).length > 0) {
    const teamNums = Object.keys(dreData).map(Number).sort();
    const rows = teamNums.map((tn) => {
      const v = dreData[tn] as Record<string, number>;
      return `| ${dreData[tn].team_name} | ${fmt(v.receitasOperacionais || 0)} | ${fmt(v.receitaLiquidaTotal || 0)} | ${fmt(v.resultadoBruto || 0)} | ${fmt(v.despesasTotais || 0)} | ${fmt(v.resultadoAntesDosImpostos || 0)} | ${fmt(v.imposto_de_renda || 0)} | ${fmt(v.resultadoOperacionalLiquido || 0)} | ${fmt(v.resultadoOperacionalLiquidoAcumulado || 0)} | ${fmt(v.dividendosDistribuidos || 0)} |`;
    });
    sections.push(`## DRE — Demonstração de Resultados
| Equipe | Receita Op. | Receita Líq. | Resultado Bruto | Despesas Totais | Resultado antes IR | IR | Resultado Op. Líq. | Resultado Acumulado | Dividendos |
|--------|------------|-------------|----------------|----------------|-------------------|-----|-------------------|-------------------|-----------|
${rows.join("\n")}`);
  } else if (!isESG) {
    sections.push(`## DRE — Demonstração de Resultados
⚠️ SEM DADOS de DRE para este período.`);
  }

  // ── NEW: Balanço Patrimonial (Hospital) ───────────────────
  if (!isESG && Object.keys(balanceData).length > 0) {
    const teamNums = Object.keys(balanceData).map(Number).sort();
    const rows = teamNums.map((tn) => {
      const v = balanceData[tn] as Record<string, number>;
      const ativo = v.balancoAtivoTotal || v.totalAtivo || 0;
      const passivo = v.balancoPassivoTotal || v.totalPassivo || 0;
      const pl = v.patrimonioLiquido || 0;
      const cs = v.balancoCapitalSocial || v.capitalSocial || 0;
      const lucroAcum = v.balancoLucroPrejuizoAcumulado || 0;
      return `| ${balanceData[tn].team_name} | ${fmt(v.balancoCaixa || 0)} | ${fmt(v.balancoAplicacoesFinanceiras || 0)} | ${fmt(v.balancoEstoques || 0)} | ${fmt(v.balancoImobilizado || 0)} | ${fmt(ativo)} | ${fmt(v.balancoEmprestimos || 0)} | ${fmt(v.balancoCreditoRotativo || 0)} | ${fmt(passivo)} | ${fmt(cs)} | ${fmt(lucroAcum)} | ${fmt(pl)} | ${pl <= 0 ? "⚠️" : "OK"} |`;
    });
    sections.push(`## Balanço Patrimonial
| Equipe | Caixa | Aplicações | Estoques | Imobilizado | Ativo Total | Empréstimos | Rotativo | Passivo Total | Capital Social | Lucro/Prej. Acum. | PL | Solvência |
|--------|-------|-----------|---------|------------|------------|-----------|---------|-------------|---------------|-----------------|-----|----------|
${rows.join("\n")}`);
  } else if (!isESG) {
    sections.push(`## Balanço Patrimonial
⚠️ SEM DADOS de balanço patrimonial para este período.`);
  }

  // ── NEW: Indicadores Financeiros (Hospital) ───────────────
  if (!isESG && Object.keys(indicatorsData).length > 0) {
    const teamNums = Object.keys(indicatorsData).map(Number).sort();
    const rows = teamNums.map((tn) => {
      const v = indicatorsData[tn] as Record<string, number>;
      return `| ${indicatorsData[tn].team_name} | ${(v.liquidezCorrente || 0).toFixed(2)} | ${(v.liquidezSeca || 0).toFixed(2)} | ${(v.liquidezGeral || 0).toFixed(2)} | ${(v.liquidezImediata || 0).toFixed(2)} | ${(v.endividamentoGeral || 0).toFixed(2)} | ${pct(v.margemBruta || 0)} | ${pct(v.margemOperacional || 0)} | ${pct(v.margemLiquida || 0)} | ${pct(v.rentabilidadeDoPatrimonioLiquido || 0)} | ${(v.giroDoAtivo || 0).toFixed(2)} |`;
    });
    sections.push(`## Indicadores Financeiros
| Equipe | Liq. Corrente | Liq. Seca | Liq. Geral | Liq. Imediata | Endividamento | Margem Bruta | Margem Op. | Margem Líq. | Rentab. PL | Giro Ativo |
|--------|-------------|----------|-----------|-------------|-------------|-------------|-----------|-----------|-----------|-----------|
${rows.join("\n")}`);
  } else if (!isESG) {
    sections.push(`## Indicadores Financeiros
⚠️ SEM DADOS de indicadores financeiros para este período.`);
  }

  // ── NEW: RH e Operações (Hospital) ────────────────────────
  if (!isESG && Object.keys(hrOpsData).length > 0) {
    const teamNums = Object.keys(hrOpsData).map(Number).sort();
    const rows = teamNums.map((tn) => {
      const v = hrOpsData[tn] as Record<string, number>;
      const totalColab = (v.colaboradores_admin || 0) + (v.colaboradores_saude || 0);
      return `| ${hrOpsData[tn].team_name} | ${num(totalColab)} | ${num(v.colaboradores_admin || 0)} | ${num(v.colaboradores_saude || 0)} | ${num(v.colaboradoresOciosos || 0)} | ${pct((v.usoMaoOBraExtra || 0) * 100)} | ${num(v.totalDispensa || 0)} | ${num(v.diasDeGreve || 0)} | ${num(v.medicosCadastrados || 0)} | ${num(v.fdAtivos_leitosoperacionais || 0)} | ${num(v.fdAtivos_leitosuti || 0)} |`;
    });
    sections.push(`## RH e Operações
| Equipe | Total Colab. | Admin | Saúde | Ociosos | Hora Extra | Demissões | Greve (dias) | Médicos | Leitos Op. | Leitos UTI |
|--------|------------|-------|-------|---------|-----------|----------|-------------|---------|-----------|-----------|
${rows.join("\n")}`);

    // Staff per service detail
    const detailRows = teamNums.map((tn) => {
      const v = hrOpsData[tn] as Record<string, number>;
      return `| ${hrOpsData[tn].team_name} | ${num(v.colaboradoresNecessarios_prontoAtendimento || 0)}/${num(v.colaboradoresDisponiveis_prontoAtendimento || 0)} | ${num(v.colaboradoresNecessarios_internacao || 0)}/${num(v.colaboradoresDisponiveis_internacao || 0)} | ${num(v.colaboradoresNecessarios_altaComplexidade || 0)}/${num(v.colaboradoresDisponiveis_altaComplexidade || 0)} |`;
    });
    sections.push(`### Colaboradores por Serviço (Necessários/Disponíveis)
| Equipe | PA | Internação | Cirurgia/AC |
|--------|-----|-----------|------------|
${detailRows.join("\n")}`);
  } else if (!isESG) {
    sections.push(`## RH e Operações
⚠️ SEM DADOS de RH e operações para este período.`);
  }

  // ── NEW: Decisões (Bloco F) ───────────────────────────────
  if (!isESG && Object.keys(decisionsData).length > 0) {
    const teamNums = Object.keys(decisionsData).map(Number).sort();

    // Pricing decisions
    const pricingRows = teamNums.map((tn) => {
      const v = decisionsData[tn] as Record<string, number>;
      const convenios = ["boaSaude", "goodShape", "healthy", "outras", "particulares", "tipTop", "unique"]
        .filter((c) => v[c] === 1).join(", ") || "nenhum";
      return `| ${decisionsData[tn].team_name} | R$${(v.fdreceitapa || 0).toFixed(0)} | R$${(v.fdreceitaint || 0).toFixed(0)} | R$${(v.fdreceitaaltacomplexidade || 0).toFixed(0)} | ${convenios} |`;
    });
    sections.push(`## Decisões — Preços e Convênios (Bloco F)
| Equipe | Preço PA | Preço INT | Preço AC | Convênios Aceitos |
|--------|---------|----------|---------|------------------|
${pricingRows.join("\n")}`);

    // Investment decisions
    const investRows = teamNums.map((tn) => {
      const v = decisionsData[tn] as Record<string, number>;
      return `| ${decisionsData[tn].team_name} | ${fmt(v.fdinvestimentoimagemcorporativa || 0)} | ${fmt(v.fdinvestimentoinovacaotecnologia || 0)} | ${fmt(v.fdinvestimentocertificaointernacional || 0)} | ${fmt(v.fdinvestimentocontroleinfeccao || 0)} | ${fmt(v.fdinvestimentodescartelixo || 0)} |`;
    });
    sections.push(`### Decisões — Investimentos
| Equipe | Imagem | Inovação | Certificação | Infecção | Lixo |
|--------|--------|---------|-------------|---------|------|
${investRows.join("\n")}`);

    // HR decisions
    const hrRows = teamNums.map((tn) => {
      const v = decisionsData[tn] as Record<string, number>;
      return `| ${decisionsData[tn].team_name} | ${num(v.fdcolaboradores || 0)} | R$${(v.fdsalariotrimestral || 0).toFixed(0)} | R$${(v.fdbeneficiosportrabalhador || 0).toFixed(0)} | ${pct((v.fdmaxhorasextras || 0) * 100)} | ${pct((v.fdparticipacaotrimestrallucros || 0) * 100)} |`;
    });
    sections.push(`### Decisões — RH
| Equipe | Colaboradores | Salário Trim. | Benefícios/Trab. | Max H.Extra | PLR |
|--------|-------------|-------------|----------------|-----------|------|
${hrRows.join("\n")}`);

    // Financial decisions
    const finRows = teamNums.map((tn) => {
      const v = decisionsData[tn] as Record<string, number>;
      return `| ${decisionsData[tn].team_name} | ${fmt(v.fdaplicacaoFinanceira || 0)} | ${fmt(v.fdEmprestimos || 0)} | ${fmt(v.fdDividendos || 0)} | ${v.fdLiberarRelatoriosFinanceirosHospitais ? "SIM" : "NÃO"} |`;
    });
    sections.push(`### Decisões — Financeiro
| Equipe | Aplicação | Empréstimos | Dividendos | Liberou Relatórios |
|--------|----------|-----------|-----------|-------------------|
${finRows.join("\n")}`);

    // Infrastructure decisions
    const infraRows = teamNums.map((tn) => {
      const v = decisionsData[tn] as Record<string, number>;
      return `| ${decisionsData[tn].team_name} | ${num(v.fdNovos_leitosoperacionais || 0)} | ${num(v.fdNovos_leitosuti || 0)} | ${num(v.fdunidadespa || 0)} | ${pct((v.fdPercentualAtivos_leitosoperacionais || 0) * 100)} | ${pct((v.fdPercentualAtivos_leitosuti || 0) * 100)} |`;
    });
    sections.push(`### Decisões — Infraestrutura
| Equipe | Novos Leitos Op. | Novos Leitos UTI | Unid. PA | % Ativos Op. | % Ativos UTI |
|--------|---------------|--------------|---------|------------|------------|
${infraRows.join("\n")}`);
  } else if (!isESG) {
    sections.push(`## Decisões (Bloco F)
⚠️ SEM DADOS de decisões para este período.`);
  }

  // ── NEW: Ranking Detalhado (Hospital) ─────────────────────
  if (!isESG && Object.keys(rankingData).length > 0) {
    const teamNums = Object.keys(rankingData).map(Number).sort();
    const items = [
      { label: "Ação", pts: "numeroPontos_valor_acao", ord: "numeroOrdem_valor_acao" },
      { label: "Médicos", pts: "numeroPontos_medicosCadastrados", ord: "numeroOrdem_medicosCadastrados" },
      { label: "Receita", pts: "numeroPontos_receitaLiquidaTotal", ord: "numeroOrdem_receitaLiquidaTotal" },
      { label: "Res.Acum.", pts: "numeroPontos_resultadoOperacionalLiquidoAcumulado", ord: "numeroOrdem_resultadoOperacionalLiquidoAcumulado" },
      { label: "CCL", pts: "numeroPontos_capitalCirculanteLiq", ord: "numeroOrdem_capitalCirculanteLiq" },
      { label: "Vidas", pts: "numeroPontos_vidasAtendidas", ord: "numeroOrdem_vidasAtendidas" },
      { label: "Governança", pts: "numeroPontos_governancaCorporativa", ord: "numeroOrdem_governancaCorporativa" },
    ];
    const rows = teamNums.map((tn) => {
      const v = rankingData[tn] as Record<string, number>;
      const cells = items.map((it) => `#${v[it.ord] || "?"}(${(v[it.pts] || 0).toFixed(1)})`).join(" | ");
      return `| ${rankingData[tn].team_name} | #${v.colocacaoRankingPeriodo || "?"} | ${(v.numeroPontosPeriodo || 0).toFixed(1)} | ${cells} |`;
    });
    sections.push(`## Ranking Detalhado por Objetivo
| Equipe | Pos. Geral | Pontos | Ação | Médicos | Receita | Res.Acum. | CCL | Vidas | Governança |
|--------|-----------|--------|------|---------|---------|----------|------|-------|-----------|
${rows.join("\n")}
*Formato: #posição(pontos)*`);
  } else if (!isESG) {
    sections.push(`## Ranking Detalhado
⚠️ SEM DADOS de ranking detalhado para este período.`);
  }

  // ── NEW: Estatísticas de Mercado (Hospital) ───────────────
  if (!isESG && Object.keys(statsData).length > 0) {
    // Stats are same for all teams (market-level), pick first team
    const firstTeam = Object.keys(statsData).map(Number)[0];
    if (firstTeam !== undefined) {
      const v = statsData[firstTeam] as Record<string, number>;
      const metrics = [
        { label: "Valor Ação", prefix: "estatisticasValorAcao" },
        { label: "Receitas Op.", prefix: "estatisticasReceitasOperacionaisServicos" },
        { label: "Resultado Op. Líq.", prefix: "estatisticasResultadoOperacionalLiquido" },
        { label: "Lucro Líquido", prefix: "estatisticasLucroLiq" },
        { label: "Salários + Encargos", prefix: "estatisticasSalariosEncargos" },
        { label: "Benefícios", prefix: "estatisticasBeneficiosFuncionarios" },
        { label: "Colaboradores", prefix: "estatisticasColaboradores" },
        { label: "Salário Médio", prefix: "estatisticasSalarioMedio" },
        { label: "Dividendos", prefix: "estatisticasDividendos" },
        { label: "PLR", prefix: "estatisticasParticipacaoLucros" },
        { label: "Imagem Corp.", prefix: "estatisticasImagemCorporativa" },
        { label: "Inovação Tec.", prefix: "estatisticasInovacaoTecnologia" },
        { label: "Certificações Int.", prefix: "estatisticasCertificacoesInternacionais" },
        { label: "Taxa Infecção UTI", prefix: "estatisticasTaxaInfeccaoUti" },
        { label: "Médicos Cadastrados", prefix: "estatisticasMedicosCadastrados" },
        { label: "Leitos Op. Ativos", prefix: "estatisticasLeitosOperacionaisAtivos" },
        { label: "Leitos Op. Disp.", prefix: "estatisticasLeitosOperacionaisDisponiveis" },
        { label: "Leitos UTI Ativos", prefix: "estatisticasLeitosUtiAtivos" },
        { label: "Leitos UTI Disp.", prefix: "estatisticasLeitosUitDisponiveis" },
        { label: "Unid. PA Ativas", prefix: "estatisticasUnidadesPaAtivas" },
      ];
      const rows = metrics
        .filter((m) => (v[`${m.prefix}Med`] || 0) !== 0)
        .map((m) => {
          const min = v[`${m.prefix}Min`] || 0;
          const med = v[`${m.prefix}Med`] || 0;
          const max = v[`${m.prefix}Max`] || 0;
          return `| ${m.label} | ${num(min)} | ${num(med)} | ${num(max)} |`;
        });
      if (rows.length > 0) {
        sections.push(`## Estatísticas de Mercado (Min / Média / Máx)
| Indicador | Mínimo | Média | Máximo |
|-----------|--------|-------|--------|
${rows.join("\n")}`);
      }
    }
  }

  // ── M9: Governance ────────────────────────────────────────
  if (governance.length > 0) {
    if (isESG) {
      const rows = governance.map(
        (g) =>
          `| ${g.team} | ${g.score.toFixed(1)} | ${g.creditoRotativo} | ${g.totalDispensa} | ${g.usoMaoObraExtra} | ${g.numeroCertificacoes} | ${g.transparencia} | ${g.taxaInfeccao.toFixed(2)} |`
      );
      sections.push(`## Governança ESG
| Equipe | Score | Rotativo | Demissões | H.Extra | Cert. ESG | Relatórios | Pluma |
|--------|-------|---------|-----------|---------|----------|-----------|-------|
${rows.join("\n")}`);
    } else {
      const rows = governance.map(
        (g) =>
          `| ${g.team} | ${g.score.toFixed(1)} | ${g.creditoRotativo} | ${g.totalDispensa} | ${g.usoMaoObraExtra} | ${g.numeroCertificacoes} | ${g.transparencia} | ${g.taxaInfeccao.toFixed(2)} |`
      );
      sections.push(`## Governança Corporativa
| Equipe | Score | Rotativo | Demissões | H.Extra | Certificações | Transparência | Infecção |
|--------|-------|---------|-----------|---------|--------------|--------------|----------|
${rows.join("\n")}`);
    }
  } else {
    sections.push(`## Governança
⚠️ SEM DADOS de governança para este período.`);
  }

  // ── M7: Strategy Alignment ────────────────────────────────
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
  } else {
    sections.push(`## Alinhamento Estratégico
⚠️ SEM DADOS de alinhamento estratégico para este período.`);
  }

  // ── M8: Pricing ───────────────────────────────────────────
  if (pricing.length > 0) {
    if (isESG) {
      const rows = pricing.map(
        (p) =>
          `| ${p.team} | R$${p.pricePA.toFixed(0)} | R$${p.priceINT.toFixed(0)} | R$${p.priceAC.toFixed(0)} | ${pct(p.marketSharePA * 100)} | ${pct(p.marketShareINT * 100)} | ${pct(p.marketShareAC * 100)} |`
      );
      sections.push(`## Precificação e Market Share
| Equipe | Preço Shampoo | Preço Repelente | Preço Selante | Share Shampoo | Share Repelente | Share Selante |
|--------|-------------|---------------|-------------|-------------|---------------|-------------|
${rows.join("\n")}`);
    } else {
      const rows = pricing.map(
        (p) =>
          `| ${p.team} | R$${p.pricePA.toFixed(0)} | R$${p.priceINT.toFixed(0)} | R$${p.priceAC.toFixed(0)} | ${pct(p.marketSharePA * 100)} | ${pct(p.marketShareINT * 100)} | ${pct(p.marketShareAC * 100)} |`
      );
      sections.push(`## Precificação e Market Share
| Equipe | Preço PA | Preço INT | Preço AC | Share PA | Share INT | Share AC |
|--------|---------|----------|---------|---------|----------|---------|
${rows.join("\n")}`);
    }
  } else {
    sections.push(`## Precificação
⚠️ SEM DADOS de precificação para este período.`);
  }

  // ── M10: Quality (Hospital only) ──────────────────────────
  if (!isESG) {
    if (quality.length > 0) {
      const rows = quality.map(
        (q) =>
          `| ${q.team} | ${q.taxaInfeccao.toFixed(2)} | ${q.certificacoes} | ${q.alertaAnvisa} | ${q.multaAnvisa} | ${q.qualityStatus} |`
      );
      sections.push(`## Qualidade Assistencial
| Equipe | Infecção | Certificações | Alertas ANVISA | Multas | Status |
|--------|---------|--------------|---------------|--------|--------|
${rows.join("\n")}`);
    } else {
      sections.push(`## Qualidade Assistencial
⚠️ SEM DADOS de qualidade para este período.`);
    }
  }

  // ── Environmental (ESG only) ──────────────────────────────
  if (isESG) {
    if (environmental.length > 0) {
      const rows = environmental.map(
        (e) =>
          `| ${e.team} | ${e.nivelPluma.toFixed(1)} | ${e.smsAmbiental.toFixed(1)} | ${e.multaAmbiental} | ${e.numeroCertificacoesESG} | ${e.envStatus} |`
      );
      sections.push(`## Gestão Ambiental
| Equipe | Pluma | SMS | Multas | Cert. ESG | Status |
|--------|-------|-----|--------|----------|--------|
${rows.join("\n")}`);
    } else {
      sections.push(`## Gestão Ambiental
⚠️ SEM DADOS de gestão ambiental para este período.`);
    }
  }

  // ── Inventory (ESG only) ──────────────────────────────────
  if (isESG) {
    if (inventory.length > 0) {
      const rows: string[] = [];
      for (const inv of inventory) {
        for (const prod of inv.products) {
          rows.push(
            `| ${inv.team} | ${prod.name} | ${prod.estoque} | R$${prod.custoUnitario.toFixed(0)} | R$${prod.custoArmazenagem.toFixed(0)} | ${prod.producao} | ${prod.capacidadeProdutiva} | ${pct(prod.utilizacao)} |`
          );
        }
      }
      sections.push(`## Estoque e Produção
| Equipe | Produto | Estoque | Custo Unit. | Armazenagem | Produção | Capacidade | Utilização |
|--------|---------|---------|-----------|------------|---------|-----------|-----------|
${rows.join("\n")}`);
    } else {
      sections.push(`## Estoque e Produção
⚠️ SEM DADOS de estoque para este período.`);
    }
  }

  // ── M11: Lost Revenue ─────────────────────────────────────
  if (lostRevenue.length > 0) {
    const rows = lostRevenue.map(
      (l) =>
        `| ${l.team} | ${fmt(l.totalLostRevenue)} | ${pct(l.pctRevenueLost)} | ${l.dominantType} |`
    );
    sections.push(`## Receita Perdida
| Equipe | Total Perdido | % Receita | Tipo Dominante |
|--------|-------------|----------|---------------|
${rows.join("\n")}`);
  } else {
    sections.push(`## Receita Perdida
⚠️ SEM DADOS de receita perdida para este período.`);
  }

  return sections.join("\n\n");
}
