export const APP_NAME = "Tutor Co-Pilot";
export const APP_DESCRIPTION =
  "Assistente inteligente para tutores de jogos de negócios";

export const BRAND = {
  gold: "#C5A832",
  goldLight: "#E8D98A",
  goldDark: "#8B7523",
  navy: "#1A365D",
  navyLight: "#2D5A9E",
  background: "#F8FAFC",
  text: "#1E293B",
  textMuted: "#64748B",
  white: "#FFFFFF",
  success: "#16A34A",
  warning: "#EAB308",
  danger: "#DC2626",
} as const;

export const SERVICES = {
  emergency: {
    key: "emergency",
    label: "Pronto Atendimento",
    labelEn: "Emergency Care",
    color: BRAND.navyLight,
  },
  inpatient: {
    key: "inpatient",
    label: "Internação sem Cirurgia",
    labelEn: "Hospitalization without Surgery",
    color: BRAND.gold,
  },
  surgery: {
    key: "surgery",
    label: "Cirurgia / Alta Complexidade",
    labelEn: "Surgery / High Complexity",
    color: BRAND.success,
  },
} as const;

export const EFFICIENCY_THRESHOLDS = {
  optimal: { min: 85, max: 95 },
  low: 70,
  high: 95,
} as const;

export const MODULES = [
  {
    id: "efficiency",
    title: "Eficiência Operacional",
    description: "Capacidade vs. Demanda por Serviço",
    icon: "Activity",
    href: "efficiency",
  },
  {
    id: "profitability",
    title: "Diagnóstico de Lucratividade",
    description: "Margens e Rentabilidade por Linha",
    icon: "DollarSign",
    href: "profitability",
  },
  {
    id: "benchmarking",
    title: "Benchmarking Inter-Equipes",
    description: "Ranking Comparativo de Desempenho",
    icon: "BarChart3",
    href: "benchmarking",
  },
  {
    id: "facilitation",
    title: "Guia de Facilitação",
    description: "Perguntas e Insights para o Tutor",
    icon: "MessageSquare",
    href: "facilitation",
  },
] as const;
