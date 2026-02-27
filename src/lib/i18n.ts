export const LOCALES = ["pt", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  pt: "Português",
  en: "English",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  pt: "🇧🇷",
  en: "🇺🇸",
};

const translations = {
  pt: {
    // Header
    appName: "Tutor Co-Pilot",
    bySimulation: "by Simulation",

    // Home
    hospitalGames: "Jogos de Hospitais",
    selectGame: "Selecione um jogo para visualizar as análises do tutor.",
    connectionError: "Erro de conexão",
    filterByProfessor: "Filtrar por professor...",
    searchGame: "Pesquisar jogo por nome...",
    gamesFound: (n: number) => `${n} jogo${n !== 1 ? "s" : ""} encontrado${n !== 1 ? "s" : ""}`,
    forProfessor: "para",
    noGamesFound: "Nenhum jogo encontrado com os filtros aplicados.",
    teams: "equipes",
    round: "rodada",
    rounds: "rodadas",

    // Dashboard
    backToGames: "Voltar aos jogos",
    quarter: "Trimestre",
    teamsCompeting: "equipes competindo",
    analyzingQuarter: (q: number) => `Analisando o Trimestre ${q}.`,
    periodHint: "Use o seletor de período dentro de cada módulo para navegar entre trimestres.",
    teamsLabel: "Equipes",
    analysisModules: "Módulos de Análise",

    // Modules
    modEfficiency: "Eficiência Operacional",
    modEfficiencyDesc: "Capacidade vs. Demanda por Serviço",
    modProfitability: "Diagnóstico de Lucratividade",
    modProfitabilityDesc: "Margens e Rentabilidade por Linha",
    modBenchmarking: "Benchmarking Inter-Equipes",
    modBenchmarkingDesc: "Ranking Comparativo de Desempenho",
    modFacilitation: "Guia de Facilitação",
    modFacilitationDesc: "Perguntas e Insights para o Tutor",

    // Efficiency
    backToDashboard: "Voltar ao dashboard",
    efficiencyTitle: "Eficiência Operacional",
    efficiencySubtitle: (code: string) => `Capacidade vs. demanda por linha de serviço — ${code}`,
    periodLabel: "Trimestre",
    noDataForPeriod: (p: number) => `Nenhum dado encontrado para o Trimestre ${p}.`,
    team: "Equipe",
    capacity: "Capacidade",
    attended: "Atendidos",
    utilization: "Utilização",
    lostDemand: "Demanda Perdida",
    status: "Status",
    statusOverload: "Sobrecarga",
    statusIdle: "Ociosidade",
    statusOk: "OK",
    highlights: "Destaques",

    // Services
    svcEmergency: "Pronto Atendimento",
    svcInpatient: "Internação sem Cirurgia",
    svcSurgery: "Cirurgia / Alta Complexidade",

    // Profitability
    profitabilityTitle: "Diagnóstico de Lucratividade",
    profitabilitySubtitle: (code: string) => `Margens e rentabilidade por linha de serviço — ${code}`,
    grossRevenue: "Receita Bruta",
    disallowances: "Glosas",
    defaults: "Inadimplência",
    netRevenue: "Receita Líquida",
    inputCosts: "Custos Insumos",
    laborCosts: "Custos Pessoal",
    contributionMargin: "Margem Contribuição",
    marginPct: "Margem %",
    bestMargin: "Maior margem",
    worstMargin: "Menor margem",
    groupAvg: "Média do grupo",
    operatingAtLoss: "operando no prejuízo nesta linha",
    contributionMarginIn: "de margem de contribuição em",

    // Benchmarking
    benchmarkingTitle: "Benchmarking Inter-Equipes",
    benchmarkingSubtitle: (code: string) => `Ranking comparativo de desempenho — ${code}`,
    quarterLeader: "Líder do Trimestre",
    avgRevenue: "Receita Média",
    avgOpMargin: "Margem Op. Média",
    overallRanking: "Ranking Geral",
    sharePrice: "Valor Ação",
    opResult: "Resultado Op.",
    opMargin: "Margem Op.",
    patientsAttended: "Vidas Atendidas",
    doctors: "Médicos",
    nwc: "CCL",
    leadsRanking: "lidera o ranking com ação a",
    andOpMargin: "e margem operacional de",
    lastPlace: "ocupa a última posição",
    lowMarginAdvice: "margem operacional muito baixa, precisa rever estratégia de custos e preços.",
    okMarginAdvice: "margem razoável mas abaixo dos concorrentes, oportunidade de melhoria.",
    revenueSpread: "Spread de receita",
    leader: "líder",
    last: "último",
    difference: "diferença de",

    // Facilitation
    facilitationTitle: "Guia de Facilitação",
    facilitationSubtitle: (code: string) => `Perguntas e insights gerados por IA para o tutor — ${code}`,
    generating: "Gerando Guia de Facilitação",
    generatingDesc: "O Claude está analisando os dados de eficiência, lucratividade e benchmarking para gerar perguntas e insights personalizados...",
    error: "Erro",
    tryAgain: "Tentar novamente",
    generatedBy: "Gerado por Claude AI",
    copyText: "Copiar texto",
    copied: "Copiado",
    regenerate: "Regenerar",

    // Facilitation AI prompt language
    aiLanguage: "português brasileiro",
  },
  en: {
    appName: "Tutor Co-Pilot",
    bySimulation: "by Simulation",

    hospitalGames: "Hospital Games",
    selectGame: "Select a game to view tutor analytics.",
    connectionError: "Connection error",
    filterByProfessor: "Filter by professor...",
    searchGame: "Search game by name...",
    gamesFound: (n: number) => `${n} game${n !== 1 ? "s" : ""} found`,
    forProfessor: "for",
    noGamesFound: "No games found with the applied filters.",
    teams: "teams",
    round: "round",
    rounds: "rounds",

    backToGames: "Back to games",
    quarter: "Quarter",
    teamsCompeting: "teams competing",
    analyzingQuarter: (q: number) => `Analyzing Quarter ${q}.`,
    periodHint: "Use the period selector within each module to navigate between quarters.",
    teamsLabel: "Teams",
    analysisModules: "Analysis Modules",

    modEfficiency: "Operational Efficiency",
    modEfficiencyDesc: "Capacity vs. Demand per Service",
    modProfitability: "Profitability Diagnosis",
    modProfitabilityDesc: "Margins and Profitability by Line",
    modBenchmarking: "Inter-Team Benchmarking",
    modBenchmarkingDesc: "Comparative Performance Ranking",
    modFacilitation: "Facilitation Guide",
    modFacilitationDesc: "Questions and Insights for the Tutor",

    backToDashboard: "Back to dashboard",
    efficiencyTitle: "Operational Efficiency",
    efficiencySubtitle: (code: string) => `Capacity vs. demand per service line — ${code}`,
    periodLabel: "Quarter",
    noDataForPeriod: (p: number) => `No data found for Quarter ${p}.`,
    team: "Team",
    capacity: "Capacity",
    attended: "Attended",
    utilization: "Utilization",
    lostDemand: "Lost Demand",
    status: "Status",
    statusOverload: "Overload",
    statusIdle: "Idle",
    statusOk: "OK",
    highlights: "Highlights",

    svcEmergency: "Emergency Care",
    svcInpatient: "Inpatient (No Surgery)",
    svcSurgery: "Surgery / High Complexity",

    profitabilityTitle: "Profitability Diagnosis",
    profitabilitySubtitle: (code: string) => `Margins and profitability by service line — ${code}`,
    grossRevenue: "Gross Revenue",
    disallowances: "Disallowances",
    defaults: "Defaults",
    netRevenue: "Net Revenue",
    inputCosts: "Input Costs",
    laborCosts: "Labor Costs",
    contributionMargin: "Contribution Margin",
    marginPct: "Margin %",
    bestMargin: "Best margin",
    worstMargin: "Worst margin",
    groupAvg: "Group average",
    operatingAtLoss: "operating at a loss in this line",
    contributionMarginIn: "contribution margin in",

    benchmarkingTitle: "Inter-Team Benchmarking",
    benchmarkingSubtitle: (code: string) => `Comparative performance ranking — ${code}`,
    quarterLeader: "Quarter Leader",
    avgRevenue: "Average Revenue",
    avgOpMargin: "Avg. Op. Margin",
    overallRanking: "Overall Ranking",
    sharePrice: "Share Price",
    opResult: "Op. Result",
    opMargin: "Op. Margin",
    patientsAttended: "Patients Attended",
    doctors: "Doctors",
    nwc: "NWC",
    leadsRanking: "leads the ranking with share price at",
    andOpMargin: "and operating margin of",
    lastPlace: "holds the last position",
    lowMarginAdvice: "very low operating margin, needs to review cost and pricing strategy.",
    okMarginAdvice: "reasonable margin but below competitors, room for improvement.",
    revenueSpread: "Revenue spread",
    leader: "leader",
    last: "last",
    difference: "difference of",

    facilitationTitle: "Facilitation Guide",
    facilitationSubtitle: (code: string) => `AI-generated questions and insights for the tutor — ${code}`,
    generating: "Generating Facilitation Guide",
    generatingDesc: "Claude is analyzing efficiency, profitability, and benchmarking data to generate personalized questions and insights...",
    error: "Error",
    tryAgain: "Try again",
    generatedBy: "Generated by Claude AI",
    copyText: "Copy text",
    copied: "Copied",
    regenerate: "Regenerate",

    aiLanguage: "English",
  },
} as const;

export type Translations = typeof translations.pt;

export function getTranslations(locale: Locale): Translations {
  return translations[locale] as Translations;
}
