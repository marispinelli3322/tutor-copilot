export interface Game {
  id: number;
  codigo: string;
  nome: string;
  ultimo_periodo_processado: number;
  num_empresas: number;
  jogo_id: number;
}

export interface Team {
  id: number;
  nome: string;
  numero: number;
  grupo_id: number;
}

export interface ServiceEfficiency {
  team: string;
  teamNumber: number;
  capacity: number;
  volumeServed: number;
  utilizationRate: number;
  unmetDemand: number;
  status: "ok" | "overload" | "overcapacity";
}

export interface ServiceEfficiencyReport {
  service: string;
  serviceKey: string;
  teams: ServiceEfficiency[];
  takeaways: string[];
}

export interface ProfitabilityData {
  team: string;
  teamNumber: number;
  service: string;
  totalRevenue: number;
  disallowances: number;
  defaults: number;
  netRevenue: number;
  inputCosts: number;
  laborCosts: number;
  contributionMargin: number;
  marginPercent: number;
}

export interface BenchmarkData {
  team: string;
  teamNumber: number;
  sharePrice: number;
  netRevenue: number;
  netOperatingIncome: number;
  operatingMargin: number;
  ebitda: number;
  ebitdaMargin: number;
  patientsAttended: number;
  registeredDoctors: number;
  nwc: number;
  overallRanking: number;
}

export interface AnalysisModule {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface TimeseriesDataset {
  teams: string[];
  metrics: {
    key: string;
    label: string;
    data: { period: number; [teamName: string]: number }[];
  }[];
}

export interface GovernanceData {
  team: string;
  teamNumber: number;
  score: number;
  creditoRotativo: number;
  totalDispensa: number;
  usoMaoObraExtra: number;
  numeroCertificacoes: number;
  transparencia: number;
  taxaInfeccao: number;
}

// M6: Financial Risk
export interface FinancialRiskData {
  team: string;
  teamNumber: number;
  saldoFinal: number;
  saldoInicialTrimestre: number;
  capitalCirculanteLiq: number;
  patrimonioLiquido: number;
  totalAtivo: number;
  totalPassivo: number;
  creditoRotativo: number;
  utilizacaoCreditoRotativo: number;
  taxaRotativo: number;
  despesaCreditoRotativo: number;
  despesaEmprestimo: number;
  taxaJurosEmprestimo: number;
  planoEmergencial: number;
  receitaLiquidaTotal: number;
  // Computed KPIs
  alavancagem: number;
  coberturaCaixa: number;
  variacaoCaixa: number;
  riskStatus: "healthy" | "attention" | "critical";
}

// M7: Strategy Alignment
export interface StrategyItemAlignment {
  itemName: string;
  variableCode: string;
  weight: number;
  value: number;
  ranking: number;
  totalTeams: number;
  aligned: boolean;
}

export interface StrategyAlignmentData {
  team: string;
  teamNumber: number;
  items: StrategyItemAlignment[];
  alignmentScore: number;
}
