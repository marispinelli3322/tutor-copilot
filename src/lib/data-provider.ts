/**
 * Data Provider — fetches data from the real Simulation database.
 * Falls back to mock data only if USE_MOCK=true in .env.local.
 *
 * The variavel_empresarial table uses an EAV model:
 * Each row = (empresa_id, periodo, codigo, valor)
 * 444 variable codes per team per period.
 */

import type {
  Game,
  Team,
  ServiceEfficiency,
  ServiceEfficiencyReport,
  ProfitabilityData,
  BenchmarkData,
  TimeseriesDataset,
  GovernanceData,
  FinancialRiskData,
  StrategyAlignmentData,
  StrategyItemAlignment,
  PricingTeamData,
  QualityData,
  LostRevenueData,
  LostRevenueServiceData,
} from "./types";

const useMock = () => process.env.USE_MOCK === "true";

// ── Games ───────────────────────────────────────────────────

export type { GameWithProfessors } from "./queries";

export async function getHospitalGames(userId?: number) {
  if (useMock()) {
    const { MOCK_GAMES } = await import("./mock-data");
    return MOCK_GAMES.map((g) => ({
      ...g,
      jogo_nome: "Jogo de Hospitais",
      professors: ["Professor Demo"],
    }));
  }
  const { getHospitalGames: dbGet } = await import("./queries");
  return dbGet(userId);
}

export async function getGameDetails(
  groupId: number
): Promise<(Game & { jogo_nome: string; professor?: string | null }) | null> {
  if (useMock()) {
    const { MOCK_GAME_DETAILS } = await import("./mock-data");
    return MOCK_GAME_DETAILS[groupId] ?? null;
  }
  const { getGameDetails: dbGet } = await import("./queries");
  return dbGet(groupId);
}

export async function getGameTeams(groupId: number): Promise<Team[]> {
  if (useMock()) {
    const { MOCK_TEAMS } = await import("./mock-data");
    return MOCK_TEAMS[groupId] ?? [];
  }
  const { getGameTeams: dbGet } = await import("./queries");
  return dbGet(groupId);
}

// ── M1: Efficiency ──────────────────────────────────────────

function computeEfficiency(
  teamName: string,
  teamNumber: number,
  capacity: number,
  attended: number,
  demand: number,
  lost: number
): ServiceEfficiency {
  const utilizationRate =
    capacity > 0 ? (attended / capacity) * 100 : 0;
  let status: "ok" | "overload" | "overcapacity" = "ok";
  if (lost > 0) status = "overload";
  else if (utilizationRate < 70) status = "overcapacity";

  return {
    team: teamName,
    teamNumber,
    capacity: Math.round(capacity),
    volumeServed: attended,
    utilizationRate: Math.round(utilizationRate * 10) / 10,
    unmetDemand: lost,
    status,
  };
}

export async function getEfficiencyData(
  groupId: number,
  period: number
): Promise<Record<string, ServiceEfficiencyReport>> {
  if (useMock()) {
    const { MOCK_EFFICIENCY } = await import("./mock-data");
    return MOCK_EFFICIENCY[period] ?? {};
  }

  const { getTeamVariablesPivot, EFFICIENCY_CODES } = await import("./queries");
  const data = await getTeamVariablesPivot(groupId, period, [...EFFICIENCY_CODES]);

  const services = [
    {
      key: "emergency",
      label: "Pronto Atendimento",
      attended: "atendimentos_prontoAtendimento",
      demand: "demandaFinal_prontoAtendimento",
      limit: "limites_prontoAtendimento",
      lost: "atendimentosPerdidosprontoAtendimento",
    },
    {
      key: "inpatient",
      label: "Internação sem Cirurgia",
      attended: "atendimentos_internacao",
      demand: "demandaFinal_internacao",
      limit: null, // internação doesn't have explicit limit in the data
      lost: "atendimentosPerdidosinternacao",
    },
    {
      key: "surgery",
      label: "Cirurgia / Alta Complexidade",
      attended: "atendimentos_altaComplexidade",
      demand: "demandaFinal_altaComplexidade",
      limit: "limites_altaComplexidade",
      lost: "atendimentosPerdidosaltaComplexidade",
    },
  ];

  const result: Record<string, ServiceEfficiencyReport> = {};

  for (const svc of services) {
    const teams: ServiceEfficiency[] = [];

    for (const teamNum of Object.keys(data).map(Number).sort()) {
      const d = data[teamNum];
      const vars = d as unknown as Record<string, number>;
      const attended = vars[svc.attended] || 0;
      const demand = vars[svc.demand] || 0;
      const capacity = svc.limit ? vars[svc.limit] || demand : demand;
      const lost = vars[svc.lost] || 0;

      teams.push(
        computeEfficiency(
          d.team_name,
          d.team_number,
          capacity,
          attended,
          demand,
          lost
        )
      );
    }

    // Auto-generate takeaways
    const overloaded = teams.filter((t) => t.status === "overload");
    const idle = teams.filter((t) => t.status === "overcapacity");
    const takeaways: string[] = [];

    if (overloaded.length > 0) {
      const names = overloaded.map((t) => t.team).join(", ");
      const totalLost = overloaded.reduce((s, t) => s + t.unmetDemand, 0);
      takeaways.push(
        `${names} ${overloaded.length > 1 ? "estão" : "está"} com sobrecarga em ${svc.label} — ${totalLost.toLocaleString("pt-BR")} atendimentos perdidos no trimestre.`
      );
    }
    if (idle.length > 0) {
      const names = idle.map((t) => t.team).join(", ");
      takeaways.push(
        `${names} opera${idle.length > 1 ? "m" : ""} com alta ociosidade em ${svc.label} — capacidade subutilizada gera custo fixo sem receita correspondente.`
      );
    }
    if (overloaded.length === 0 && idle.length === 0) {
      takeaways.push(
        `Todas as equipes operam dentro da faixa adequada em ${svc.label}.`
      );
    }

    result[svc.key] = {
      service: svc.label,
      serviceKey: svc.key,
      teams,
      takeaways,
    };
  }

  return result;
}

// ── M2: Profitability ───────────────────────────────────────

export async function getProfitabilityData(
  groupId: number,
  period: number
): Promise<ProfitabilityData[]> {
  if (useMock()) {
    const { MOCK_PROFITABILITY } = await import("./mock-data");
    return MOCK_PROFITABILITY[period] ?? [];
  }

  const { getTeamVariablesPivot, PROFITABILITY_CODES } = await import("./queries");
  const data = await getTeamVariablesPivot(groupId, period, [...PROFITABILITY_CODES]);

  const services = [
    { label: "Pronto Atendimento", suffix: "prontoAtendimento" },
    { label: "Internação sem Cirurgia", suffix: "internacao" },
    { label: "Cirurgia / Alta Complexidade", suffix: "altaComplexidade" },
  ];

  const result: ProfitabilityData[] = [];

  for (const teamNum of Object.keys(data).map(Number).sort()) {
    const d = data[teamNum];
    const vars = d as unknown as Record<string, number>;

    for (const svc of services) {
      const totalRevenue = vars[`receita_total_${svc.suffix}`] || 0;
      const disallowances = vars[`glosa_${svc.suffix}`] || 0;
      const defaults = vars[`inadimplenciaParticulares${svc.suffix}`] || 0;
      const netRevenue = vars[`receita_liquida_${svc.suffix}`] || 0;
      const inputCosts = vars[`custo_insumos_${svc.suffix}`] || 0;
      const laborCosts = vars[`custo_pessoal_${svc.suffix}`] || 0;
      const contributionMargin = vars[`margem_contribuicao_${svc.suffix}`] || 0;
      const marginPercent = vars[`percentual_total_margem_contribuicao_${svc.suffix}`] || 0;

      result.push({
        team: d.team_name,
        teamNumber: d.team_number,
        service: svc.label,
        totalRevenue,
        disallowances,
        defaults,
        netRevenue,
        inputCosts,
        laborCosts,
        contributionMargin,
        marginPercent,
      });
    }
  }

  return result;
}

// ── M3: Benchmarking ────────────────────────────────────────

export async function getBenchmarkingData(
  groupId: number,
  period: number
): Promise<BenchmarkData[]> {
  if (useMock()) {
    const { MOCK_BENCHMARKING } = await import("./mock-data");
    return MOCK_BENCHMARKING[period] ?? [];
  }

  const { getTeamVariablesPivot, BENCHMARKING_CODES } = await import("./queries");
  const data = await getTeamVariablesPivot(groupId, period, [...BENCHMARKING_CODES]);

  const result: BenchmarkData[] = [];

  for (const teamNum of Object.keys(data).map(Number).sort()) {
    const d = data[teamNum];
    const vars = d as unknown as Record<string, number>;

    result.push({
      team: d.team_name,
      teamNumber: d.team_number,
      sharePrice: vars.valor_acao || 0,
      netRevenue: vars.receitaLiquidaTotal || 0,
      netOperatingIncome: vars.resultadoOperacionalLiquido || 0,
      operatingMargin:
        vars.receitaLiquidaTotal > 0
          ? ((vars.resultadoOperacionalLiquido || 0) / vars.receitaLiquidaTotal) * 100
          : 0,
      ebitda: vars.resultadoBruto || 0,
      ebitdaMargin:
        vars.receitaLiquidaTotal > 0
          ? ((vars.resultadoBruto || 0) / vars.receitaLiquidaTotal) * 100
          : 0,
      patientsAttended: vars.vidasAtendidas || 0,
      registeredDoctors: vars.medicosCadastrados || 0,
      nwc: vars.capitalCirculanteLiq || 0,
      overallRanking: vars.colocacaoRankingPeriodo || 0,
    });
  }

  return result.sort((a, b) => a.overallRanking - b.overallRanking);
}

// ── M5: Time Series ────────────────────────────────────────

export async function getTimeseriesData(
  groupId: number,
  maxPeriod: number
): Promise<TimeseriesDataset> {
  if (useMock()) {
    return { teams: [], metrics: [] };
  }

  const { getTimeseriesAllPeriods, TIMESERIES_CODES } = await import("./queries");
  const allData = await getTimeseriesAllPeriods(groupId, maxPeriod, [...TIMESERIES_CODES]);

  // Collect team names from any period that has data
  const teamMap = new Map<number, string>();
  for (const periodData of Object.values(allData)) {
    for (const teamNum of Object.keys(periodData).map(Number)) {
      if (!teamMap.has(teamNum)) {
        teamMap.set(teamNum, periodData[teamNum].team_name);
      }
    }
  }
  const sortedTeamNums = Array.from(teamMap.keys()).sort();
  const teams = sortedTeamNums.map((n) => teamMap.get(n)!);

  const metricDefs = [
    { key: "sharePrice", label: "Valor da Ação", code: "valor_acao", computed: false },
    { key: "netRevenue", label: "Receita Líquida", code: "receitaLiquidaTotal", computed: false },
    { key: "operatingMargin", label: "Margem Operacional (%)", code: null, computed: true },
    { key: "governance", label: "Governança Corporativa", code: "governancaCorporativa", computed: false },
  ];

  const metrics: TimeseriesDataset["metrics"] = metricDefs.map((m) => {
    const data: { period: number; [teamName: string]: number }[] = [];
    for (let p = 1; p <= maxPeriod; p++) {
      const row: { period: number; [teamName: string]: number } = { period: p };
      const periodData = allData[p] || {};
      for (const teamNum of sortedTeamNums) {
        const teamName = teamMap.get(teamNum)!;
        const vars = periodData[teamNum] as Record<string, number> | undefined;
        if (m.computed) {
          // Operating margin = resultadoOperacionalLiquido / receitaLiquidaTotal * 100
          const opResult = vars?.resultadoOperacionalLiquido || 0;
          const revenue = vars?.receitaLiquidaTotal || 0;
          row[teamName] = revenue > 0 ? (opResult / revenue) * 100 : 0;
        } else {
          row[teamName] = vars?.[m.code!] || 0;
        }
      }
      data.push(row);
    }
    return { key: m.key, label: m.label, data };
  });

  return { teams, metrics };
}

// ── M9: Governance ─────────────────────────────────────────

export async function getGovernanceData(
  groupId: number,
  period: number
): Promise<GovernanceData[]> {
  if (useMock()) {
    return [];
  }

  const { getTeamVariablesPivot, GOVERNANCE_CODES } = await import("./queries");
  const data = await getTeamVariablesPivot(groupId, period, [...GOVERNANCE_CODES]);

  const result: GovernanceData[] = [];

  for (const teamNum of Object.keys(data).map(Number).sort()) {
    const d = data[teamNum];
    const vars = d as unknown as Record<string, number>;

    result.push({
      team: d.team_name,
      teamNumber: d.team_number,
      score: vars.governancaCorporativa || 0,
      creditoRotativo: vars.governancaCorporativa_creditoRotativo || 0,
      totalDispensa: vars.governancaCorporativa_totalDispensa || 0,
      usoMaoObraExtra: vars.governancaCorporativa_usoMaoOBraExtra || 0,
      numeroCertificacoes: vars.governancaCorporativa_numeroCertificacoes || 0,
      transparencia: vars.governancaCorporativa_liberouRelatoriosFinanceirosHospitais || 0,
      taxaInfeccao: vars.governancaCorporativa_atratividadeParcial_taxaInfeccao || 0,
    });
  }

  return result.sort((a, b) => b.score - a.score);
}

// ── M6: Financial Risk ─────────────────────────────────────

export async function getFinancialRiskData(
  groupId: number,
  period: number
): Promise<FinancialRiskData[]> {
  if (useMock()) {
    return [];
  }

  const { getTeamVariablesPivot, FINANCIAL_RISK_CODES } = await import("./queries");
  const data = await getTeamVariablesPivot(groupId, period, [...FINANCIAL_RISK_CODES]);

  const result: FinancialRiskData[] = [];

  for (const teamNum of Object.keys(data).map(Number).sort()) {
    const d = data[teamNum];
    const vars = d as unknown as Record<string, number>;

    const saldoFinal = vars.saldoFinal || 0;
    const saldoInicialTrimestre = vars.saldoInicialTrimestre || 0;
    const capitalCirculanteLiq = vars.capitalCirculanteLiq || 0;
    const patrimonioLiquido = vars.patrimonioLiquido || 0;
    const totalPassivo = vars.totalPassivo || 0;
    const creditoRotativo = vars.creditoRotativo || 0;
    const planoEmergencial = vars.planoEmergencial || 0;
    const receitaLiquidaTotal = vars.receitaLiquidaTotal || 0;

    const alavancagem = patrimonioLiquido !== 0 ? totalPassivo / patrimonioLiquido : 0;
    const coberturaCaixa = receitaLiquidaTotal > 0 ? (saldoFinal / receitaLiquidaTotal) * 100 : 0;
    const variacaoCaixa = saldoFinal - saldoInicialTrimestre;

    let riskStatus: "healthy" | "attention" | "critical" = "healthy";
    if (capitalCirculanteLiq < 0 || planoEmergencial > 0) {
      riskStatus = "critical";
    } else if (creditoRotativo > 0) {
      riskStatus = "attention";
    }

    result.push({
      team: d.team_name,
      teamNumber: d.team_number,
      saldoFinal,
      saldoInicialTrimestre,
      capitalCirculanteLiq,
      patrimonioLiquido,
      totalAtivo: vars.totalAtivo || 0,
      totalPassivo,
      creditoRotativo,
      utilizacaoCreditoRotativo: vars.utilizacaoCreditoRotativo || 0,
      taxaRotativo: vars.hospitalPercentualCreditoRotativo || 0,
      despesaCreditoRotativo: vars.despesaCreditoRotativo || 0,
      despesaEmprestimo: vars.despesa_emprestimo || 0,
      taxaJurosEmprestimo: vars.taxa_juros_emprestimo || 0,
      planoEmergencial,
      receitaLiquidaTotal,
      alavancagem,
      coberturaCaixa,
      variacaoCaixa,
      riskStatus,
    });
  }

  return result;
}

// ── M7: Strategy Alignment ─────────────────────────────────

const STRATEGY_ITEMS = [
  { name: "Preço da Ação", code: "valor_acao" },
  { name: "Médicos Cadastrados", code: "medicosCadastrados" },
  { name: "Receitas Op. Líquidas", code: "receitaLiquidaTotal" },
  { name: "Resultado Op. Acumulado", code: "resultadoOperacionalLiquidoAcumulado" },
  { name: "Capital Circulante Líq.", code: "capitalCirculanteLiq" },
  { name: "Vidas Atendidas", code: "vidasAtendidas" },
  { name: "Governança Corporativa", code: "governancaCorporativa" },
];

export async function getStrategyAlignmentData(
  groupId: number,
  period: number
): Promise<StrategyAlignmentData[]> {
  if (useMock()) {
    return [];
  }

  const { getTeamVariablesPivot, STRATEGY_RESULT_CODES, getStrategyWeights } = await import("./queries");

  // Fetch weights and results in parallel
  const [weightsData, resultsData] = await Promise.all([
    getStrategyWeights(groupId),
    getTeamVariablesPivot(groupId, period, [...STRATEGY_RESULT_CODES]),
  ]);

  const teamNums = Object.keys(resultsData).map(Number).sort();
  const totalTeams = teamNums.length;

  // Compute rankings per variable code (higher = better, rank 1 = best)
  const rankings: Record<string, Record<number, number>> = {};
  for (const item of STRATEGY_ITEMS) {
    const values = teamNums.map((tn) => ({
      teamNum: tn,
      value: ((resultsData[tn] as unknown as Record<string, number>)?.[item.code]) || 0,
    }));
    values.sort((a, b) => b.value - a.value);
    rankings[item.code] = {};
    values.forEach((v, i) => {
      rankings[item.code][v.teamNum] = i + 1;
    });
  }

  const result: StrategyAlignmentData[] = [];

  for (const teamNum of teamNums) {
    const teamWeights = weightsData[teamNum];
    const teamResults = resultsData[teamNum];
    const vars = teamResults as unknown as Record<string, number>;

    const items: StrategyItemAlignment[] = [];
    let alignedCount = 0;
    let weightedCount = 0;

    for (const item of STRATEGY_ITEMS) {
      // Find weight from DB — match by variable_code or item_name
      let weight = 0;
      if (teamWeights) {
        for (const w of Object.values(teamWeights.weights)) {
          if (w.variable_code === item.code || w.item_name === item.name) {
            weight = w.peso;
            break;
          }
        }
      }

      const value = vars[item.code] || 0;
      const ranking = rankings[item.code]?.[teamNum] || totalTeams;
      const topHalf = ranking <= Math.ceil(totalTeams / 2);
      const aligned = weight >= 2 ? topHalf : true; // low weight = not penalized

      if (weight > 0) {
        weightedCount++;
        if (weight >= 2 && topHalf) alignedCount++;
        else if (weight < 2) alignedCount++;
      }

      items.push({
        itemName: item.name,
        variableCode: item.code,
        weight,
        value,
        ranking,
        totalTeams,
        aligned,
      });
    }

    const alignmentScore = weightedCount > 0 ? (alignedCount / weightedCount) * 100 : 0;

    result.push({
      team: teamResults.team_name,
      teamNumber: teamResults.team_number,
      items,
      alignmentScore,
    });
  }

  return result.sort((a, b) => b.alignmentScore - a.alignmentScore);
}

// ── M8: Pricing ─────────────────────────────────────────────

const CONVENIOS = ["boaSaude", "goodShape", "healthy", "outras", "particulares", "tipTop", "unique"] as const;
const SERVICES_PRICING = [
  { key: "PA", suffix: "prontoAtendimento" },
  { key: "INT", suffix: "internacao" },
  { key: "AC", suffix: "altaComplexidade" },
] as const;

export async function getPricingData(
  groupId: number,
  period: number
): Promise<PricingTeamData[]> {
  if (useMock()) return [];

  const { getTeamVariablesPivot, getTeamDecisions, PRICING_RESULT_CODES, PRICING_DECISION_CODES } = await import("./queries");

  const [decisions, results] = await Promise.all([
    getTeamDecisions(groupId, period, [...PRICING_DECISION_CODES]),
    getTeamVariablesPivot(groupId, period, [...PRICING_RESULT_CODES]),
  ]);

  const teamNums = new Set([
    ...Object.keys(decisions).map(Number),
    ...Object.keys(results).map(Number),
  ]);
  const sortedNums = Array.from(teamNums).sort();

  const result: PricingTeamData[] = [];

  for (const teamNum of sortedNums) {
    const dec = decisions[teamNum] as Record<string, unknown> | undefined;
    const res = results[teamNum] as Record<string, unknown> | undefined;
    const teamName = (dec?.team_name || res?.team_name || `Equipe ${teamNum}`) as string;

    const pricePA = Number(dec?.fdreceitapa || 0);
    const priceINT = Number(dec?.fdreceitaint || 0);
    const priceAC = Number(dec?.fdreceitaaltacomplexidade || 0);
    const avgPrice = (pricePA + priceINT + priceAC) / 3;

    const conveniosAceitos: Record<string, boolean> = {};
    for (const c of CONVENIOS) {
      conveniosAceitos[c] = Number(dec?.[c] || 0) === 1;
    }

    const revenueByConvenio: Record<string, number> = {};
    const attractivenessByConvenio: Record<string, number> = {};
    for (const c of CONVENIOS) {
      let totalRev = 0;
      let totalAttr = 0;
      for (const svc of SERVICES_PRICING) {
        totalRev += Number(res?.[`receita_servico_plano_${svc.suffix}_${c}`] || 0);
        totalAttr += Number(res?.[`atratividadeFinal_${svc.suffix}_${c}`] || 0);
      }
      revenueByConvenio[c] = totalRev;
      attractivenessByConvenio[c] = totalAttr / SERVICES_PRICING.length;
    }

    result.push({
      team: teamName,
      teamNumber: teamNum,
      pricePA,
      priceINT,
      priceAC,
      avgPrice,
      marketSharePA: Number(res?.marketShareAtendimentosprontoAtendimento || 0),
      marketShareINT: Number(res?.marketShareAtendimentosinternacao || 0),
      marketShareAC: Number(res?.marketShareAtendimentosaltaComplexidade || 0),
      mediaPA: Number(res?.medias_prontoAtendimento || 0),
      mediaINT: Number(res?.medias_internacao || 0),
      mediaAC: Number(res?.medias_altaComplexidade || 0),
      conveniosAceitos,
      revenueByConvenio,
      attractivenessByConvenio,
    });
  }

  return result;
}

// ── M10: Quality ────────────────────────────────────────────

export async function getQualityData(
  groupId: number,
  period: number
): Promise<QualityData[]> {
  if (useMock()) return [];

  const { getTeamVariablesPivot, QUALITY_CODES } = await import("./queries");
  const data = await getTeamVariablesPivot(groupId, period, [...QUALITY_CODES]);

  const result: QualityData[] = [];

  for (const teamNum of Object.keys(data).map(Number).sort()) {
    const d = data[teamNum];
    const vars = d as unknown as Record<string, number>;

    const taxaInfeccao = vars.atratividadeParcial_taxaInfeccao || 0;
    const certificacoes = vars.numeroCertificacoes || 0;
    const multaAnvisa = vars.multaAnvisa || 0;
    const alertaAnvisa = vars.alertaAnvisa || 0;

    let qualityStatus: "excellent" | "adequate" | "critical" = "adequate";
    if (multaAnvisa > 0 || alertaAnvisa > 2) {
      qualityStatus = "critical";
    } else if (certificacoes > 0 && multaAnvisa === 0) {
      qualityStatus = "excellent";
    }

    result.push({
      team: d.team_name,
      teamNumber: d.team_number,
      taxaInfeccao,
      atratividadeInfeccao: vars.atratividadeParcial_atratividade_Infeccao || 0,
      certificacoes,
      atratividadeCertificacoes: vars.atratividadeParcial_certificacoesInternacionais || 0,
      investAcumCertificacao: vars.investimentosAcumuladosCertificacao || 0,
      investAcumInfeccao: vars.investimentosACumuladosControleInfeccao || 0,
      investAcumLixo: vars.investimentosAcumuladosLixo || 0,
      alertaAnvisa,
      fiscalizacaoAnvisa: vars.fiscalizacaoAnvisa || 0,
      multaAnvisa,
      sucessoCertificacoes: vars.sucessoCertificacoes || 0,
      investPeriodoCertificacao: vars.fdinvestimentocertificaointernacional || 0,
      investPeriodoInfeccao: vars.fdinvestimentocontroleinfeccao || 0,
      gastosLixo: vars.gastosEmTerceirizacaoDelixo || 0,
      govTaxaInfeccao: vars.governancaCorporativa_atratividadeParcial_taxaInfeccao || 0,
      qualityStatus,
    });
  }

  return result;
}

// ── M11: Lost Revenue ───────────────────────────────────────

export async function getLostRevenueData(
  groupId: number,
  period: number
): Promise<LostRevenueData[]> {
  if (useMock()) return [];

  const { getTeamVariablesPivot, LOST_REVENUE_CODES } = await import("./queries");
  const data = await getTeamVariablesPivot(groupId, period, [...LOST_REVENUE_CODES]);

  const services = [
    { label: "Pronto Atendimento", suffix: "prontoAtendimento", hasIdleness: true },
    { label: "Internação", suffix: "internacao", hasIdleness: false },
    { label: "Alta Complexidade", suffix: "altaComplexidade", hasIdleness: true },
  ];

  const result: LostRevenueData[] = [];

  for (const teamNum of Object.keys(data).map(Number).sort()) {
    const d = data[teamNum];
    const vars = d as unknown as Record<string, number>;

    const svcData: LostRevenueServiceData[] = [];
    let totalLost = 0;

    for (const svc of services) {
      const attended = vars[`atendimentos_${svc.suffix}`] || 0;
      const netRevenue = vars[`receita_liquida_${svc.suffix}`] || 0;
      const revenuePerUnit = attended > 0 ? netRevenue / attended : 0;
      const lostVolume = vars[`atendimentosPerdidos${svc.suffix}`] || 0;
      const lostRevenue = lostVolume * revenuePerUnit;

      const idleness = svc.hasIdleness ? (vars[`ociosidade_${svc.suffix}`] || 0) : 0;
      const margin = vars[`margem_contribuicao_${svc.suffix}`] || 0;
      const marginPerUnit = attended > 0 ? margin / attended : 0;
      const idlenessRevenue = idleness * marginPerUnit;

      let dominantType: "overload" | "idleness" | "balanced" = "balanced";
      if (lostRevenue > idlenessRevenue * 1.5) dominantType = "overload";
      else if (idlenessRevenue > lostRevenue * 1.5) dominantType = "idleness";

      svcData.push({
        service: svc.label,
        lostVolume,
        revenuePerUnit,
        lostRevenue,
        idleness,
        idlenessRevenue,
        dominantType,
      });

      totalLost += lostRevenue + idlenessRevenue;
    }

    const totalNetRevenue = services.reduce(
      (s, svc) => s + (vars[`receita_liquida_${svc.suffix}`] || 0),
      0
    );
    const pctRevenueLost = totalNetRevenue > 0 ? (totalLost / totalNetRevenue) * 100 : 0;

    const overloadTotal = svcData.reduce((s, sv) => s + sv.lostRevenue, 0);
    const idlenessTotal = svcData.reduce((s, sv) => s + sv.idlenessRevenue, 0);
    let dominantType: "overload" | "idleness" | "balanced" = "balanced";
    if (overloadTotal > idlenessTotal * 1.5) dominantType = "overload";
    else if (idlenessTotal > overloadTotal * 1.5) dominantType = "idleness";

    result.push({
      team: d.team_name,
      teamNumber: d.team_number,
      services: svcData,
      totalLostRevenue: totalLost,
      dominantType,
      pctRevenueLost,
    });
  }

  return result;
}
