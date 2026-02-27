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
} from "./types";

const useMock = () => process.env.USE_MOCK === "true";

// ── Games ───────────────────────────────────────────────────

export type { GameWithProfessors } from "./queries";

export async function getHospitalGames() {
  if (useMock()) {
    const { MOCK_GAMES } = await import("./mock-data");
    return MOCK_GAMES.map((g) => ({
      ...g,
      jogo_nome: "Jogo de Hospitais",
      professors: ["Professor Demo"],
    }));
  }
  const { getHospitalGames: dbGet } = await import("./queries");
  return dbGet();
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
