/**
 * ESG Game Configuration (Negócios ESG)
 * Chemical industry game: Shampoo, Repelente, Selante
 * 6 strategic objectives, ESG governance, environmental management
 */

import type { GameConfig } from "../game-config";

// ── M1: Eficiência Produtiva ──────────────────────────────────
export const ESG_EFFICIENCY_CODES = [
  // Production capacity and volume
  "capacidadeProdutiva",
  "capacidadeProdutiva_p1",
  "capacidadeProdutiva_p2",
  "capacidadeProdutiva_p3",
  "producao_p1",
  "producao_p2",
  "producao_p3",
  "vendasPerdidas_p1",
  "vendasPerdidas_p2",
  "vendasPerdidas_p3",
  "demandaFinal_p1",
  "demandaFinal_p2",
  "demandaFinal_p3",
  "lotesVendidos_p1",
  "lotesVendidos_p2",
  "lotesVendidos_p3",
] as const;

// ── M2: Lucratividade ────────────────────────────────────────
export const ESG_PROFITABILITY_CODES = [
  "receita_total_p1",
  "receita_total_p2",
  "receita_total_p3",
  "receita_liquida_p1",
  "receita_liquida_p2",
  "receita_liquida_p3",
  "custo_producao_p1",
  "custo_producao_p2",
  "custo_producao_p3",
  "custo_materiaprima_p1",
  "custo_materiaprima_p2",
  "custo_materiaprima_p3",
  "custo_pessoal_p1",
  "custo_pessoal_p2",
  "custo_pessoal_p3",
  "margem_contribuicao_p1",
  "margem_contribuicao_p2",
  "margem_contribuicao_p3",
  "percentual_margem_contribuicao_p1",
  "percentual_margem_contribuicao_p2",
  "percentual_margem_contribuicao_p3",
  "receitaLiquidaTotal",
  "resultadoOperacionalLiquido",
  "resultadoBruto",
  "ebitda",
] as const;

// ── M3: Benchmarking ────────────────────────────────────────
export const ESG_BENCHMARKING_CODES = [
  "valor_acao",
  "receitaLiquidaTotal",
  "resultadoOperacionalLiquido",
  "resultadoOperacionalLiquidoAcumulado",
  "capitalCirculanteLiq",
  "patrimonioLiquido",
  "colocacaoRankingPeriodo",
  "numeroPontosPeriodo",
  "saldoFinal",
  "lotesVendidosTotal",
  "faturamentoTotal",
  "lucroAcumulado",
  "governancaCorporativa",
] as const;

// ── M5: Evolução (timeseries) ────────────────────────────────
export const ESG_TIMESERIES_CODES = [
  "valor_acao",
  "receitaLiquidaTotal",
  "resultadoOperacionalLiquido",
  "governancaCorporativa",
] as const;

// ── M6: Risco Financeiro ────────────────────────────────────
export const ESG_FINANCIAL_RISK_CODES = [
  "saldoFinal",
  "saldoInicialMes",
  "capitalCirculanteLiq",
  "patrimonioLiquido",
  "totalAtivo",
  "totalPassivo",
  "creditoRotativo",
  "utilizacaoCreditoRotativo",
  "percentualCreditoRotativo",
  "despesaCreditoRotativo",
  "despesa_emprestimo",
  "taxa_juros_emprestimo",
  "planoEmergencial",
  "receitaLiquidaTotal",
] as const;

// ── M7: Alinhamento Estratégico ──────────────────────────────
export const ESG_STRATEGY_RESULT_CODES = [
  "valor_acao",
  "capitalCirculanteLiq",
  "faturamentoTotal",
  "lucroAcumulado",
  "lotesVendidosTotal",
  "governancaCorporativa",
] as const;

// ── M9: Governança ESG ──────────────────────────────────────
export const ESG_GOVERNANCE_CODES = [
  "governancaCorporativa",
  "governancaCorporativa_horaExtra",
  "governancaCorporativa_demissoes",
  "governancaCorporativa_pluma",
  "governancaCorporativa_certificacoesESG",
  "governancaCorporativa_creditoRotativo",
  "governancaCorporativa_relatorios",
] as const;

// ── M8: Precificação ────────────────────────────────────────
export const ESG_PRICING_DECISION_CODES = [
  "fdPreco_p1",
  "fdPreco_p2",
  "fdPreco_p3",
  "fdUnidadesAProduzir_p1",
  "fdUnidadesAProduzir_p2",
  "fdUnidadesAProduzir_p3",
  "fdInvestimentoPeD_p1",
  "fdInvestimentoPeD_p2",
  "fdInvestimentoPeD_p3",
] as const;

export const ESG_PRICING_RESULT_CODES = [
  "marketShare_p1",
  "marketShare_p2",
  "marketShare_p3",
  "medias_p1",
  "medias_p2",
  "medias_p3",
  "receita_total_p1",
  "receita_total_p2",
  "receita_total_p3",
  "lotesVendidos_p1",
  "lotesVendidos_p2",
  "lotesVendidos_p3",
  "investimentoPeD_p1",
  "investimentoPeD_p2",
  "investimentoPeD_p3",
] as const;

// ── M10: Gestão Ambiental (ESG-specific) ────────────────────
export const ESG_ENVIRONMENTAL_CODES = [
  "pluma",
  "nivelPluma",
  "smsAmbiental",
  "multaAmbiental",
  "remediacao",
  "investimentoRemediacao",
  "certificacaoESG",
  "numeroCertificacoesESG",
  "investimentoCertificacaoESG",
  "investimentoAcumuladoCertificacaoESG",
  "gastoDescarte",
] as const;

// ── M11: Receita Perdida ────────────────────────────────────
export const ESG_LOST_REVENUE_CODES = [
  "vendasPerdidas_p1",
  "vendasPerdidas_p2",
  "vendasPerdidas_p3",
  "receita_liquida_p1",
  "receita_liquida_p2",
  "receita_liquida_p3",
  "lotesVendidos_p1",
  "lotesVendidos_p2",
  "lotesVendidos_p3",
  "margem_contribuicao_p1",
  "margem_contribuicao_p2",
  "margem_contribuicao_p3",
  "demandaFinal_p1",
  "demandaFinal_p2",
  "demandaFinal_p3",
] as const;

// ── Estoque e Produção ──────────────────────────────────────
export const ESG_INVENTORY_CODES = [
  "estoque_p1",
  "estoque_p2",
  "estoque_p3",
  "custoUnitario_p1",
  "custoUnitario_p2",
  "custoUnitario_p3",
  "custoArmazenagem_p1",
  "custoArmazenagem_p2",
  "custoArmazenagem_p3",
  "producao_p1",
  "producao_p2",
  "producao_p3",
  "capacidadeProdutiva_p1",
  "capacidadeProdutiva_p2",
  "capacidadeProdutiva_p3",
] as const;

// No quality codes — ESG replaces quality with environmental
export const ESG_QUALITY_CODES = [] as const;

export const ESG_STRATEGY_ITEMS = [
  { name: "Valor da Ação", code: "valor_acao" },
  { name: "Capital Circulante Líq.", code: "capitalCirculanteLiq" },
  { name: "Faturamento Total", code: "faturamentoTotal" },
  { name: "Lucro Acumulado", code: "lucroAcumulado" },
  { name: "Lotes Vendidos Total", code: "lotesVendidosTotal" },
  { name: "Governança ESG", code: "governancaCorporativa" },
];

const ESG_SQUAD_PROMPT = `Você orquestra o **Simulation Squad** — uma sala de análise com 8 especialistas de indústria química/ESG discutindo o Jogo de Negócios ESG. O Professor é quem comanda a sessão.

## O TIME (sempre use ícone + nome + cargo ao se apresentar)

🏛️ **Dr. Mendonça, Árbitro-Geral** — Ex-CEO de 2 indústrias químicas, 30 anos de gestão industrial. Pausado, cirúrgico nas palavras. Conhece CADA regra do jogo ESG. Fala em comparativos — nunca analisa uma equipe sem mostrar as outras. Bate na mesa quando vê dado distorcido. Frases: Vamos aos fatos. / O comparativo não perdoa. / Isso aqui é regra, não sugestão.

💰 **Helena Bastos, Diretora Financeira** — Ex-Goldman Sachs, especialista em indústria. Conservadora, fala em cenários de caixa. Quando o caixa está bem, sorri discretamente. Quando está mal, olha por cima dos óculos e diz a verdade crua. Adora tabelas. Frases: O caixa não mente. / Margem negativa é hemorragia. / Mostre-me o DRE antes de opinar.

🏭 **Carlos Drummond, Diretor Industrial** — Engenheiro químico, 20 anos em fábricas. Pensa em capacidade produtiva: lote produzido é receita, capacidade ociosa é custo fixo queimando, venda perdida é dinheiro que foi embora. Fica impaciente com decisões que ignoram capacidade fabril. Frases: Venda perdida é receita que foi embora. / Quanta capacidade sobrou? / Não adianta vender se a fábrica não produz.

🌿 **Marina Santos, Gerente Ambiental** — Engenheira ambiental, 15 anos em SMS. Rigorosa com Pluma, certificações ESG e descarte. Vê sustentabilidade como vantagem competitiva, não custo. Alerta sobre multas ambientais antes que aconteçam. Frases: ESG não é gasto, é investimento. / Pluma alta é bomba-relógio. / Certificação ESG leva tempo — comece agora.

📊 **Rodrigo Martins, Head de Produto** — Economista, ex-consultor P&G. Vê preço e P&D como alavancas estratégicas. Analítico, competitivo — compara market share entre equipes com prazer. Provoca quando alguém precifica no escuro. Frases: Preço é estratégia, não chute. / Olha o market share antes de subir preço. / Sem P&D, seu produto morre.

👥 **Patrícia Souza, Diretora de RH** — Psicóloga organizacional, defensora ferrenha do time. Empática mas firme — se alguém sugere cortar pessoal sem justificativa, ela retruca na hora. Monitora horas extras como termômetro de saúde operacional. Frases: Gente é investimento, não custo. / Hora extra crônica é bomba-relógio. / Quem demitiu demais, vai pagar em governança.

🎯 **André Vasconcelos, Estrategista-Chefe** — Ex-Bain, MBA Wharton. Vê o jogo como um tabuleiro de xadrez — analisa o que cada equipe NÃO fez tanto quanto o que fez. Provocador, desafia o status quo. Quando o ranking muda, ele já sabe por quê. Frases: O ranking não mente. / Quem não alinha peso com resultado, cai. / Antecipe — não reaja.

📢 **Juliana Reis, Diretora Comercial** — Comunicadora nata, 10 anos em marketing de bens de consumo. Vê marca e P&D como ativos estratégicos. Briga com Rodrigo sobre preço vs. posicionamento. Energética, usa analogias do mercado. Frases: Percepção é realidade no mercado. / Produto com P&D vende mais. / Shampoo é commodity — diferencie ou morra.

## COMO A SALA FUNCIONA

**Formato de fala — SEMPRE assim:**
🏛️ **Dr. Mendonça, Árbitro-Geral:** [fala em 2-4 frases, direto ao ponto]

**Dinâmica da conversa:**
- Selecione 2-4 especialistas por rodada, os mais relevantes pro tema
- Cada um fala CURTO — 2-5 frases no máximo, com personalidade
- Traga TABELAS COMPARATIVAS sempre que possível — o Professor precisa ver os números lado a lado
- Permita DEBATE REAL: discordâncias, interrupções, construção sobre o ponto do outro
- Cross-talk natural: "Como a Helena mostrou..." / "Discordo do André aqui..." / "Carlos, tem capacidade pra isso?"
- Comportamentos vivos: bater na mesa, levantar sobrancelha, sorrir discretamente, ajustar os óculos
- Ao final, o especialista mais sênior fecha com 1 insight-chave

**Seleção inteligente:**
- Comparativo/ranking → Dr. Mendonça + André + Helena
- Caixa/DRE/margem/risco → Helena + Dr. Mendonça + Carlos
- Capacidade/produção/demanda → Carlos + Helena + Dr. Mendonça
- Pessoal/horas extras → Patrícia + Helena + Marina
- Preços/market share/P&D → Rodrigo + Juliana + André
- Pluma/SMS/ambiental/governança → Marina + Patrícia + Dr. Mendonça
- Pesos/alinhamento/ação → André + Dr. Mendonça + Helena
- Produtos/marca → Juliana + Rodrigo + Marina
- Se regra do jogo → Dr. Mendonça SEMPRE entra
- Se impacto financeiro → Helena SEMPRE entra

## ESTILO DE RESPOSTA

- Português brasileiro, sem aspas desnecessárias
- CONCISO — cada especialista fala 2-5 frases, NÃO parágrafos longos
- VISUAL — use tabelas markdown para comparar equipes SEMPRE que tiver dados numéricos
- DADOS PRIMEIRO — abra com o número, depois o insight
- NUNCA invente dados — use APENAS o que está no contexto. Se não tem, diga que não tem
- Jogo: Negócios ESG — 3 produtos (Shampoo, Repelente, Selante), gestão fabril, SMS ambiental, certificações ESG, 6 objetivos estratégicos`;

export const esgConfig: GameConfig = {
  type: "esg",
  periodLabel: "Mês",
  periodLabelShort: "M",
  maxPeriods: 12,
  nameFilter: "%ESG%",
  products: [
    { key: "P1", name: "Shampoo", suffix: "p1" },
    { key: "P2", name: "Repelente", suffix: "p2" },
    { key: "P3", name: "Selante", suffix: "p3" },
  ],
  services: [
    {
      key: "shampoo",
      label: "Shampoo",
      suffix: "p1",
      attended: "lotesVendidos_p1",
      demand: "demandaFinal_p1",
      limit: "capacidadeProdutiva_p1",
      lost: "vendasPerdidas_p1",
      hasIdleness: true,
    },
    {
      key: "repelente",
      label: "Repelente",
      suffix: "p2",
      attended: "lotesVendidos_p2",
      demand: "demandaFinal_p2",
      limit: "capacidadeProdutiva_p2",
      lost: "vendasPerdidas_p2",
      hasIdleness: true,
    },
    {
      key: "selante",
      label: "Selante",
      suffix: "p3",
      attended: "lotesVendidos_p3",
      demand: "demandaFinal_p3",
      limit: "capacidadeProdutiva_p3",
      lost: "vendasPerdidas_p3",
      hasIdleness: true,
    },
  ],
  modules: [
    { id: "efficiency", titleKey: "modEsgEfficiency", descriptionKey: "modEsgEfficiencyDesc", icon: "Activity", href: "efficiency" },
    { id: "profitability", titleKey: "modProfitability", descriptionKey: "modEsgProfitabilityDesc", icon: "DollarSign", href: "profitability" },
    { id: "benchmarking", titleKey: "modBenchmarking", descriptionKey: "modBenchmarkingDesc", icon: "BarChart3", href: "benchmarking" },
    { id: "timeseries", titleKey: "modTimeseries", descriptionKey: "modTimeseriesDesc", icon: "TrendingUp", href: "timeseries" },
    { id: "governance", titleKey: "modEsgGovernance", descriptionKey: "modEsgGovernanceDesc", icon: "Shield", href: "governance" },
    { id: "financial-risk", titleKey: "modFinancialRisk", descriptionKey: "modFinancialRiskDesc", icon: "AlertTriangle", href: "financial-risk" },
    { id: "strategy", titleKey: "modStrategy", descriptionKey: "modStrategyDesc", icon: "Target", href: "strategy" },
    { id: "pricing", titleKey: "modEsgPricing", descriptionKey: "modEsgPricingDesc", icon: "Tag", href: "pricing" },
    { id: "environmental", titleKey: "modEnvironmental", descriptionKey: "modEnvironmentalDesc", icon: "Leaf", href: "environmental" },
    { id: "inventory", titleKey: "modInventory", descriptionKey: "modInventoryDesc", icon: "Package", href: "inventory" },
    { id: "lost-revenue", titleKey: "modLostRevenue", descriptionKey: "modEsgLostRevenueDesc", icon: "CircleDollarSign", href: "lost-revenue" },
  ],
  codes: {
    efficiency: ESG_EFFICIENCY_CODES,
    profitability: ESG_PROFITABILITY_CODES,
    benchmarking: ESG_BENCHMARKING_CODES,
    timeseries: ESG_TIMESERIES_CODES,
    financialRisk: ESG_FINANCIAL_RISK_CODES,
    strategyResults: ESG_STRATEGY_RESULT_CODES,
    governance: ESG_GOVERNANCE_CODES,
    pricingDecisions: ESG_PRICING_DECISION_CODES,
    pricingResults: ESG_PRICING_RESULT_CODES,
    quality: ESG_QUALITY_CODES,
    lostRevenue: ESG_LOST_REVENUE_CODES,
    environmental: ESG_ENVIRONMENTAL_CODES,
    inventory: ESG_INVENTORY_CODES,
  },
  strategyItems: ESG_STRATEGY_ITEMS,
  governanceComponents: [
    { key: "horaExtra", code: "governancaCorporativa_horaExtra", labelKey: "govHorasExtras" },
    { key: "demissoes", code: "governancaCorporativa_demissoes", labelKey: "govDispensas" },
    { key: "pluma", code: "governancaCorporativa_pluma", labelKey: "govPluma" },
    { key: "certificacoesESG", code: "governancaCorporativa_certificacoesESG", labelKey: "govCertificacoesESG" },
    { key: "creditoRotativo", code: "governancaCorporativa_creditoRotativo", labelKey: "govCreditoRotativo" },
    { key: "relatorios", code: "governancaCorporativa_relatorios", labelKey: "govRelatorios" },
  ],
  squadPrompt: ESG_SQUAD_PROMPT,
};
