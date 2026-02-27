/**
 * Mock data for the Hospital Business Game
 * Based on Manual do Jogo de Hospitais v2.3
 *
 * Initial conditions per hospital (from manual):
 * - 2,021 doctors registered
 * - 244 operating beds
 * - 36 ICU beds
 * - 4 surgery rooms
 * - 1,200 employees
 * - 3 service lines: Pronto Atendimento, Internação sem Cirurgia, Cirurgia/Alta Complexidade
 * - 7 health plan operators
 *
 * When the VPN is available, set USE_MOCK=false in .env.local
 * and the data provider will switch to the real database.
 */

import type {
  Game,
  Team,
  ServiceEfficiency,
  ServiceEfficiencyReport,
  ProfitabilityData,
  BenchmarkData,
} from "./types";

// ── Mock Games ──────────────────────────────────────────────
export const MOCK_GAMES: Game[] = [
  {
    id: 101,
    codigo: "HOSP-2025-A",
    nome: "Jogo de Hospitais — Turma A",
    ultimo_periodo_processado: 3,
    num_empresas: 8,
    jogo_id: 1,
  },
  {
    id: 102,
    codigo: "HOSP-2025-B",
    nome: "Jogo de Hospitais — Turma B",
    ultimo_periodo_processado: 1,
    num_empresas: 6,
    jogo_id: 1,
  },
];

// ── Mock Teams (8 hospitals) ────────────────────────────────
export const MOCK_TEAMS: Record<number, Team[]> = {
  101: [
    { id: 1, nome: "Hospital Alpha", numero: 1, grupo_id: 101 },
    { id: 2, nome: "Hospital Beta", numero: 2, grupo_id: 101 },
    { id: 3, nome: "Hospital Gamma", numero: 3, grupo_id: 101 },
    { id: 4, nome: "Hospital Delta", numero: 4, grupo_id: 101 },
    { id: 5, nome: "Hospital Epsilon", numero: 5, grupo_id: 101 },
    { id: 6, nome: "Hospital Zeta", numero: 6, grupo_id: 101 },
    { id: 7, nome: "Hospital Eta", numero: 7, grupo_id: 101 },
    { id: 8, nome: "Hospital Theta", numero: 8, grupo_id: 101 },
  ],
  102: [
    { id: 9, nome: "Hospital Iota", numero: 1, grupo_id: 102 },
    { id: 10, nome: "Hospital Kappa", numero: 2, grupo_id: 102 },
    { id: 11, nome: "Hospital Lambda", numero: 3, grupo_id: 102 },
    { id: 12, nome: "Hospital Mu", numero: 4, grupo_id: 102 },
    { id: 13, nome: "Hospital Nu", numero: 5, grupo_id: 102 },
    { id: 14, nome: "Hospital Xi", numero: 6, grupo_id: 102 },
  ],
};

// ── Game Details ────────────────────────────────────────────
export const MOCK_GAME_DETAILS: Record<
  number,
  Game & { jogo_nome: string }
> = {
  101: {
    ...MOCK_GAMES[0],
    jogo_nome: "Jogo de Hospitais",
  },
  102: {
    ...MOCK_GAMES[1],
    jogo_nome: "Jogo de Hospitais",
  },
};

// ── Helper: team name by number ─────────────────────────────
const teamName = (n: number) => MOCK_TEAMS[101][n - 1]?.nome ?? `Equipe ${n}`;

// ── M1: Efficiency Data (Period 3) ──────────────────────────
// Capacity based on manual: beds, surgery rooms, service areas
// Utilization varies to show different statuses

function buildEfficiency(
  teamNum: number,
  capacity: number,
  volume: number
): ServiceEfficiency {
  const rate = (volume / capacity) * 100;
  let status: "ok" | "overload" | "overcapacity" = "ok";
  if (rate > 95) status = "overload";
  else if (rate < 70) status = "overcapacity";
  return {
    team: teamName(teamNum),
    teamNumber: teamNum,
    capacity,
    volumeServed: volume,
    utilizationRate: Math.round(rate * 10) / 10,
    unmetDemand: Math.max(0, volume - capacity),
    status,
  };
}

export const MOCK_EFFICIENCY: Record<number, Record<string, ServiceEfficiencyReport>> = {
  // Period 3
  3: {
    emergency: {
      service: "Pronto Atendimento",
      serviceKey: "emergency",
      teams: [
        buildEfficiency(1, 4800, 4560),  // 95% OK
        buildEfficiency(2, 4800, 5040),  // 105% overload
        buildEfficiency(3, 5200, 4420),  // 85% OK
        buildEfficiency(4, 4400, 4180),  // 95% OK
        buildEfficiency(5, 4800, 3120),  // 65% overcapacity
        buildEfficiency(6, 5000, 4750),  // 95% OK
        buildEfficiency(7, 4600, 4830),  // 105% overload
        buildEfficiency(8, 4800, 4320),  // 90% OK
      ],
      takeaways: [
        "Hospital Beta e Eta estão com sobrecarga no PA — demanda superior à capacidade em ~5%. Risco de perda de pacientes e queda na qualidade.",
        "Hospital Epsilon opera com alta ociosidade (65%) — capacidade subutilizada gera custo fixo sem receita correspondente.",
        "Alpha, Delta e Theta operam na faixa ideal (85-95%) — boa calibragem entre investimento em capacidade e demanda captada.",
      ],
    },
    inpatient: {
      service: "Internação sem Cirurgia",
      serviceKey: "inpatient",
      teams: [
        buildEfficiency(1, 1220, 1098),  // 90% OK
        buildEfficiency(2, 1220, 1342),  // 110% overload
        buildEfficiency(3, 1340, 1072),  // 80% OK
        buildEfficiency(4, 1100, 990),   // 90% OK
        buildEfficiency(5, 1220, 793),   // 65% overcapacity
        buildEfficiency(6, 1280, 1152),  // 90% OK
        buildEfficiency(7, 1160, 1218),  // 105% overload
        buildEfficiency(8, 1220, 1159),  // 95% OK
      ],
      takeaways: [
        "Hospital Beta excede capacidade de leitos em 10% — pacientes podem estar sendo recusados ou realocados.",
        "Internação sem Cirurgia é o serviço com maior pressão de demanda na maioria dos hospitais.",
        "Epsilon tem leitos ociosos (65%) — considerar redução de leitos ou aumento de captação.",
      ],
    },
    surgery: {
      service: "Cirurgia / Alta Complexidade",
      serviceKey: "surgery",
      teams: [
        buildEfficiency(1, 480, 432),   // 90% OK
        buildEfficiency(2, 480, 528),   // 110% overload
        buildEfficiency(3, 520, 390),   // 75% atenção
        buildEfficiency(4, 440, 396),   // 90% OK
        buildEfficiency(5, 480, 288),   // 60% overcapacity
        buildEfficiency(6, 500, 475),   // 95% OK
        buildEfficiency(7, 460, 506),   // 110% overload
        buildEfficiency(8, 480, 456),   // 95% OK
      ],
      takeaways: [
        "Cirurgias são o gargalo mais crítico — Beta e Eta com filas (>105%). Cada cirurgia perdida é alta receita desperdiçada.",
        "Epsilon opera muito abaixo da capacidade (60%) em cirurgias — pode indicar falta de médicos especialistas ou preço acima do mercado.",
        "Zeta e Theta calibraram bem a capacidade cirúrgica — operando na faixa 95%, maximizando retorno.",
      ],
    },
  },
  // Period 2
  2: {
    emergency: {
      service: "Pronto Atendimento",
      serviceKey: "emergency",
      teams: [
        buildEfficiency(1, 4600, 4140),
        buildEfficiency(2, 4600, 4600),
        buildEfficiency(3, 4800, 4080),
        buildEfficiency(4, 4400, 3960),
        buildEfficiency(5, 4600, 3220),
        buildEfficiency(6, 4800, 4320),
        buildEfficiency(7, 4400, 4400),
        buildEfficiency(8, 4600, 4140),
      ],
      takeaways: [
        "No T2, a maioria dos hospitais manteve utilização entre 85-95% no PA.",
        "Epsilon já apresentava ociosidade desde o T2 — tendência persistente.",
      ],
    },
    inpatient: {
      service: "Internação sem Cirurgia",
      serviceKey: "inpatient",
      teams: [
        buildEfficiency(1, 1200, 1020),
        buildEfficiency(2, 1200, 1200),
        buildEfficiency(3, 1280, 1024),
        buildEfficiency(4, 1100, 935),
        buildEfficiency(5, 1200, 780),
        buildEfficiency(6, 1240, 1054),
        buildEfficiency(7, 1120, 1120),
        buildEfficiency(8, 1200, 1080),
      ],
      takeaways: [
        "Beta e Eta no limite exato da capacidade (100%) — risco de sobrecarga no próximo trimestre.",
      ],
    },
    surgery: {
      service: "Cirurgia / Alta Complexidade",
      serviceKey: "surgery",
      teams: [
        buildEfficiency(1, 460, 391),
        buildEfficiency(2, 460, 460),
        buildEfficiency(3, 500, 375),
        buildEfficiency(4, 440, 374),
        buildEfficiency(5, 460, 276),
        buildEfficiency(6, 480, 408),
        buildEfficiency(7, 440, 440),
        buildEfficiency(8, 460, 414),
      ],
      takeaways: [
        "Cirurgia com utilização crescente — Beta e Eta no limite, tendência de estouro no T3.",
      ],
    },
  },
  // Period 1
  1: {
    emergency: {
      service: "Pronto Atendimento",
      serviceKey: "emergency",
      teams: [
        buildEfficiency(1, 4400, 3520),
        buildEfficiency(2, 4400, 3960),
        buildEfficiency(3, 4400, 3520),
        buildEfficiency(4, 4400, 3740),
        buildEfficiency(5, 4400, 3520),
        buildEfficiency(6, 4400, 3740),
        buildEfficiency(7, 4400, 3960),
        buildEfficiency(8, 4400, 3520),
      ],
      takeaways: [
        "T1 — todos partiram da mesma base. Diferenças emergem das primeiras decisões de investimento.",
      ],
    },
    inpatient: {
      service: "Internação sem Cirurgia",
      serviceKey: "inpatient",
      teams: [
        buildEfficiency(1, 1200, 960),
        buildEfficiency(2, 1200, 1080),
        buildEfficiency(3, 1200, 960),
        buildEfficiency(4, 1200, 1020),
        buildEfficiency(5, 1200, 960),
        buildEfficiency(6, 1200, 1020),
        buildEfficiency(7, 1200, 1080),
        buildEfficiency(8, 1200, 960),
      ],
      takeaways: [
        "Internação partiu uniforme — a diferenciação começa no T2 com investimentos em leitos.",
      ],
    },
    surgery: {
      service: "Cirurgia / Alta Complexidade",
      serviceKey: "surgery",
      teams: [
        buildEfficiency(1, 460, 368),
        buildEfficiency(2, 460, 414),
        buildEfficiency(3, 460, 368),
        buildEfficiency(4, 460, 391),
        buildEfficiency(5, 460, 368),
        buildEfficiency(6, 460, 391),
        buildEfficiency(7, 460, 414),
        buildEfficiency(8, 460, 368),
      ],
      takeaways: [
        "Cirurgia no T1 com todos partindo de 4 salas — diferenças vêm de alocação de médicos.",
      ],
    },
  },
};

// ── M2: Profitability Data (Period 3) ───────────────────────
// Revenue & costs by service line per team
// Values in R$ thousands, based on manual price ranges

export const MOCK_PROFITABILITY: Record<number, ProfitabilityData[]> = {
  3: [
    // Team 1 - Alpha: balanced, good margins
    { team: teamName(1), teamNumber: 1, service: "Pronto Atendimento", totalRevenue: 2736, disallowances: 137, defaults: 55, netRevenue: 2544, inputCosts: 912, laborCosts: 764, contributionMargin: 868, marginPercent: 34.1 },
    { team: teamName(1), teamNumber: 1, service: "Internação sem Cirurgia", totalRevenue: 3294, disallowances: 165, defaults: 66, netRevenue: 3063, inputCosts: 1098, laborCosts: 856, contributionMargin: 1109, marginPercent: 36.2 },
    { team: teamName(1), teamNumber: 1, service: "Cirurgia / Alta Complexidade", totalRevenue: 4320, disallowances: 216, defaults: 86, netRevenue: 4018, inputCosts: 1296, laborCosts: 1036, contributionMargin: 1686, marginPercent: 42.0 },

    // Team 2 - Beta: high volume but overloaded, quality costs
    { team: teamName(2), teamNumber: 2, service: "Pronto Atendimento", totalRevenue: 3024, disallowances: 302, defaults: 91, netRevenue: 2631, inputCosts: 1058, laborCosts: 841, contributionMargin: 732, marginPercent: 27.8 },
    { team: teamName(2), teamNumber: 2, service: "Internação sem Cirurgia", totalRevenue: 4026, disallowances: 403, defaults: 121, netRevenue: 3502, inputCosts: 1408, laborCosts: 1048, contributionMargin: 1046, marginPercent: 29.9 },
    { team: teamName(2), teamNumber: 2, service: "Cirurgia / Alta Complexidade", totalRevenue: 5280, disallowances: 528, defaults: 158, netRevenue: 4594, inputCosts: 1742, laborCosts: 1320, contributionMargin: 1532, marginPercent: 33.4 },

    // Team 3 - Gamma: conservative, good margins but lower volume
    { team: teamName(3), teamNumber: 3, service: "Pronto Atendimento", totalRevenue: 2210, disallowances: 88, defaults: 44, netRevenue: 2078, inputCosts: 796, laborCosts: 663, contributionMargin: 619, marginPercent: 29.8 },
    { team: teamName(3), teamNumber: 3, service: "Internação sem Cirurgia", totalRevenue: 2680, disallowances: 107, defaults: 54, netRevenue: 2519, inputCosts: 912, laborCosts: 724, contributionMargin: 883, marginPercent: 35.1 },
    { team: teamName(3), teamNumber: 3, service: "Cirurgia / Alta Complexidade", totalRevenue: 3510, disallowances: 140, defaults: 70, netRevenue: 3300, inputCosts: 1053, laborCosts: 878, contributionMargin: 1369, marginPercent: 41.5 },

    // Team 4 - Delta: efficient, moderate volume
    { team: teamName(4), teamNumber: 4, service: "Pronto Atendimento", totalRevenue: 2508, disallowances: 100, defaults: 50, netRevenue: 2358, inputCosts: 836, laborCosts: 710, contributionMargin: 812, marginPercent: 34.4 },
    { team: teamName(4), teamNumber: 4, service: "Internação sem Cirurgia", totalRevenue: 2970, disallowances: 119, defaults: 59, netRevenue: 2792, inputCosts: 990, laborCosts: 802, contributionMargin: 1000, marginPercent: 35.8 },
    { team: teamName(4), teamNumber: 4, service: "Cirurgia / Alta Complexidade", totalRevenue: 3960, disallowances: 158, defaults: 79, netRevenue: 3723, inputCosts: 1188, laborCosts: 990, contributionMargin: 1545, marginPercent: 41.5 },

    // Team 5 - Epsilon: low volume, high unit cost
    { team: teamName(5), teamNumber: 5, service: "Pronto Atendimento", totalRevenue: 1560, disallowances: 78, defaults: 47, netRevenue: 1435, inputCosts: 624, laborCosts: 562, contributionMargin: 249, marginPercent: 17.4 },
    { team: teamName(5), teamNumber: 5, service: "Internação sem Cirurgia", totalRevenue: 1903, disallowances: 95, defaults: 57, netRevenue: 1751, inputCosts: 761, laborCosts: 665, contributionMargin: 325, marginPercent: 18.6 },
    { team: teamName(5), teamNumber: 5, service: "Cirurgia / Alta Complexidade", totalRevenue: 2304, disallowances: 115, defaults: 69, netRevenue: 2120, inputCosts: 922, laborCosts: 783, contributionMargin: 415, marginPercent: 19.6 },

    // Team 6 - Zeta: high prices, good margins
    { team: teamName(6), teamNumber: 6, service: "Pronto Atendimento", totalRevenue: 2850, disallowances: 114, defaults: 57, netRevenue: 2679, inputCosts: 950, laborCosts: 760, contributionMargin: 969, marginPercent: 36.2 },
    { team: teamName(6), teamNumber: 6, service: "Internação sem Cirurgia", totalRevenue: 3456, disallowances: 138, defaults: 69, netRevenue: 3249, inputCosts: 1094, laborCosts: 864, contributionMargin: 1291, marginPercent: 39.7 },
    { team: teamName(6), teamNumber: 6, service: "Cirurgia / Alta Complexidade", totalRevenue: 4750, disallowances: 190, defaults: 95, netRevenue: 4465, inputCosts: 1425, laborCosts: 1090, contributionMargin: 1950, marginPercent: 43.7 },

    // Team 7 - Eta: overloaded like Beta, higher costs
    { team: teamName(7), teamNumber: 7, service: "Pronto Atendimento", totalRevenue: 2898, disallowances: 290, defaults: 87, netRevenue: 2521, inputCosts: 1014, laborCosts: 812, contributionMargin: 695, marginPercent: 27.6 },
    { team: teamName(7), teamNumber: 7, service: "Internação sem Cirurgia", totalRevenue: 3654, disallowances: 365, defaults: 110, netRevenue: 3179, inputCosts: 1279, laborCosts: 988, contributionMargin: 912, marginPercent: 28.7 },
    { team: teamName(7), teamNumber: 7, service: "Cirurgia / Alta Complexidade", totalRevenue: 5060, disallowances: 506, defaults: 152, netRevenue: 4402, inputCosts: 1670, laborCosts: 1265, contributionMargin: 1467, marginPercent: 33.3 },

    // Team 8 - Theta: balanced mid-performer
    { team: teamName(8), teamNumber: 8, service: "Pronto Atendimento", totalRevenue: 2592, disallowances: 104, defaults: 52, netRevenue: 2436, inputCosts: 864, laborCosts: 726, contributionMargin: 846, marginPercent: 34.7 },
    { team: teamName(8), teamNumber: 8, service: "Internação sem Cirurgia", totalRevenue: 3477, disallowances: 139, defaults: 70, netRevenue: 3268, inputCosts: 1114, laborCosts: 870, contributionMargin: 1284, marginPercent: 39.3 },
    { team: teamName(8), teamNumber: 8, service: "Cirurgia / Alta Complexidade", totalRevenue: 4560, disallowances: 182, defaults: 91, netRevenue: 4287, inputCosts: 1368, laborCosts: 1048, contributionMargin: 1871, marginPercent: 43.6 },
  ],
};

// ── M3: Benchmarking Data (Period 3) ────────────────────────
export const MOCK_BENCHMARKING: Record<number, BenchmarkData[]> = {
  3: [
    { team: teamName(1), teamNumber: 1, sharePrice: 14.20, netRevenue: 9625, netOperatingIncome: 2180, operatingMargin: 22.7, ebitda: 2890, ebitdaMargin: 30.0, patientsAttended: 5990, registeredDoctors: 2150, nwc: 3200, overallRanking: 2 },
    { team: teamName(2), teamNumber: 2, sharePrice: 11.80, netRevenue: 10727, netOperatingIncome: 1520, operatingMargin: 14.2, ebitda: 2340, ebitdaMargin: 21.8, patientsAttended: 6910, registeredDoctors: 2280, nwc: 2100, overallRanking: 5 },
    { team: teamName(3), teamNumber: 3, sharePrice: 12.50, netRevenue: 7897, netOperatingIncome: 1680, operatingMargin: 21.3, ebitda: 2250, ebitdaMargin: 28.5, patientsAttended: 5282, registeredDoctors: 2050, nwc: 3800, overallRanking: 4 },
    { team: teamName(4), teamNumber: 4, sharePrice: 13.90, netRevenue: 8873, netOperatingIncome: 2050, operatingMargin: 23.1, ebitda: 2720, ebitdaMargin: 30.7, patientsAttended: 5566, registeredDoctors: 2100, nwc: 3500, overallRanking: 3 },
    { team: teamName(5), teamNumber: 5, sharePrice: 8.30, netRevenue: 5306, netOperatingIncome: -120, operatingMargin: -2.3, ebitda: 580, ebitdaMargin: 10.9, patientsAttended: 4201, registeredDoctors: 1900, nwc: 1200, overallRanking: 8 },
    { team: teamName(6), teamNumber: 6, sharePrice: 15.40, netRevenue: 10393, netOperatingIncome: 2680, operatingMargin: 25.8, ebitda: 3380, ebitdaMargin: 32.5, patientsAttended: 6377, registeredDoctors: 2200, nwc: 4100, overallRanking: 1 },
    { team: teamName(7), teamNumber: 7, sharePrice: 10.60, netRevenue: 10102, netOperatingIncome: 1280, operatingMargin: 12.7, ebitda: 2100, ebitdaMargin: 20.8, patientsAttended: 6554, registeredDoctors: 2250, nwc: 1800, overallRanking: 6 },
    { team: teamName(8), teamNumber: 8, sharePrice: 13.50, netRevenue: 9991, netOperatingIncome: 2280, operatingMargin: 22.8, ebitda: 2950, ebitdaMargin: 29.5, patientsAttended: 5935, registeredDoctors: 2120, nwc: 3600, overallRanking: 2 },
  ],
  2: [
    { team: teamName(1), teamNumber: 1, sharePrice: 12.80, netRevenue: 8500, netOperatingIncome: 1850, operatingMargin: 21.8, ebitda: 2500, ebitdaMargin: 29.4, patientsAttended: 5320, registeredDoctors: 2080, nwc: 2900, overallRanking: 3 },
    { team: teamName(2), teamNumber: 2, sharePrice: 11.20, netRevenue: 9200, netOperatingIncome: 1380, operatingMargin: 15.0, ebitda: 2100, ebitdaMargin: 22.8, patientsAttended: 6000, registeredDoctors: 2150, nwc: 2000, overallRanking: 5 },
    { team: teamName(3), teamNumber: 3, sharePrice: 11.90, netRevenue: 7100, netOperatingIncome: 1420, operatingMargin: 20.0, ebitda: 2000, ebitdaMargin: 28.2, patientsAttended: 4760, registeredDoctors: 2030, nwc: 3400, overallRanking: 4 },
    { team: teamName(4), teamNumber: 4, sharePrice: 12.60, netRevenue: 7900, netOperatingIncome: 1750, operatingMargin: 22.2, ebitda: 2400, ebitdaMargin: 30.4, patientsAttended: 5000, registeredDoctors: 2060, nwc: 3200, overallRanking: 2 },
    { team: teamName(5), teamNumber: 5, sharePrice: 9.50, netRevenue: 5000, netOperatingIncome: 100, operatingMargin: 2.0, ebitda: 700, ebitdaMargin: 14.0, patientsAttended: 3900, registeredDoctors: 1950, nwc: 1500, overallRanking: 8 },
    { team: teamName(6), teamNumber: 6, sharePrice: 13.80, netRevenue: 9100, netOperatingIncome: 2200, operatingMargin: 24.2, ebitda: 2900, ebitdaMargin: 31.9, patientsAttended: 5700, registeredDoctors: 2100, nwc: 3800, overallRanking: 1 },
    { team: teamName(7), teamNumber: 7, sharePrice: 10.80, netRevenue: 8800, netOperatingIncome: 1200, operatingMargin: 13.6, ebitda: 1900, ebitdaMargin: 21.6, patientsAttended: 5800, registeredDoctors: 2120, nwc: 1700, overallRanking: 6 },
    { team: teamName(8), teamNumber: 8, sharePrice: 12.40, netRevenue: 8700, netOperatingIncome: 1900, operatingMargin: 21.8, ebitda: 2550, ebitdaMargin: 29.3, patientsAttended: 5400, registeredDoctors: 2070, nwc: 3300, overallRanking: 3 },
  ],
  1: [
    { team: teamName(1), teamNumber: 1, sharePrice: 11.00, netRevenue: 7200, netOperatingIncome: 1200, operatingMargin: 16.7, ebitda: 1800, ebitdaMargin: 25.0, patientsAttended: 4848, registeredDoctors: 2021, nwc: 2500, overallRanking: 3 },
    { team: teamName(2), teamNumber: 2, sharePrice: 11.00, netRevenue: 7800, netOperatingIncome: 1100, operatingMargin: 14.1, ebitda: 1750, ebitdaMargin: 22.4, patientsAttended: 5454, registeredDoctors: 2021, nwc: 2000, overallRanking: 5 },
    { team: teamName(3), teamNumber: 3, sharePrice: 11.00, netRevenue: 6800, netOperatingIncome: 1050, operatingMargin: 15.4, ebitda: 1650, ebitdaMargin: 24.3, patientsAttended: 4848, registeredDoctors: 2021, nwc: 2800, overallRanking: 6 },
    { team: teamName(4), teamNumber: 4, sharePrice: 11.00, netRevenue: 7000, netOperatingIncome: 1150, operatingMargin: 16.4, ebitda: 1780, ebitdaMargin: 25.4, patientsAttended: 5151, registeredDoctors: 2021, nwc: 2600, overallRanking: 4 },
    { team: teamName(5), teamNumber: 5, sharePrice: 11.00, netRevenue: 6500, netOperatingIncome: 800, operatingMargin: 12.3, ebitda: 1400, ebitdaMargin: 21.5, patientsAttended: 4848, registeredDoctors: 2021, nwc: 2200, overallRanking: 8 },
    { team: teamName(6), teamNumber: 6, sharePrice: 11.00, netRevenue: 7500, netOperatingIncome: 1300, operatingMargin: 17.3, ebitda: 1900, ebitdaMargin: 25.3, patientsAttended: 5151, registeredDoctors: 2021, nwc: 3000, overallRanking: 1 },
    { team: teamName(7), teamNumber: 7, sharePrice: 11.00, netRevenue: 7600, netOperatingIncome: 1000, operatingMargin: 13.2, ebitda: 1680, ebitdaMargin: 22.1, patientsAttended: 5454, registeredDoctors: 2021, nwc: 1900, overallRanking: 7 },
    { team: teamName(8), teamNumber: 8, sharePrice: 11.00, netRevenue: 7100, netOperatingIncome: 1180, operatingMargin: 16.6, ebitda: 1800, ebitdaMargin: 25.4, patientsAttended: 4848, registeredDoctors: 2021, nwc: 2700, overallRanking: 2 },
  ],
};
