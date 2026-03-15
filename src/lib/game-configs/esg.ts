/**
 * ESG Game Configuration (Negócios ESG v1.3)
 * Chemical industry game: Shampoo (130), Repelente (131), Selante (132)
 * 6 strategic objectives, ESG governance, environmental management
 *
 * IMPORTANT: ESG uses produto_id column in variavel_empresarial/item_decisao.
 * Per-product codes are stored with produto_id (130/131/132).
 * The query layer synthesizes suffixed keys: fdPreco + produto_id=130 → fdPreco_p1
 */

import type { GameConfig } from "../game-config";

// ── M1: Eficiência Produtiva ──────────────────────────────────
// Aggregate codes (produto_id IS NULL)
export const ESG_EFFICIENCY_CODES = [
  "outrasInfosCapacidadeFabrica",
] as const;

// Per-product codes (queried with produto_id, suffixed as _p1/_p2/_p3)
export const ESG_EFFICIENCY_PRODUCT_CODES = [
  "ctaEstoqueUnidadesProdutosVendidos",
  "ctaEstoqueUnidadesVendasPerdidas",
  "ctaEstoqueUnidadesProdutosProduzidos",
  "outrasInfosUsoCapacidadeFabril",
] as const;

// ── M2: Lucratividade ────────────────────────────────────────
export const ESG_PROFITABILITY_CODES = [
  "ebitda",
  "ebit",
  "dreLucroBruto",
  "dreLucroOperacional",
  "dreLucroLiquidoExercicio",
  "dreCustoProdutosVendidos",
  "dreDepreciacao",
] as const;

export const ESG_PROFITABILITY_PRODUCT_CODES = [
  "ctaCaixaReceitaVenda",
  "ctaEstoqueProdutosVendidos",
  "ctaEstoqueProdutosProduzidos",
  "outrasInfosMateriaPrima",
  "outrasInfosSalariosEEncargos",
  "outrasInfosCustoMedioUnitario",
] as const;

// ── M3: Benchmarking ────────────────────────────────────────
export const ESG_BENCHMARKING_CODES = [
  "outrasInfosPrecoAcao",
  "capitalCirculanteLiquido",
  "patrimonioLiquido",
  "colocacaoRankingPeriodo",
  "numeroPontosPeriodo",
  "ctaCaixaSaldoFinal",
  "totalDeLotesVendidos",
  "ctaCaixaReceitaVenda",
  "resultadoAcumuladoAtual",
  "resultadoAcumuladoAtualAntesDistribuicao",
  "governancaCorporativa",
  "ebitda",
  "dreLucroBruto",
  "dreLucroOperacional",
  "dreLucroLiquidoExercicio",
  "balancoAtivoTotal",
  "balancoPassivoTotal",
  "margemOperacional",
] as const;

// ── M5: Evolução (timeseries) ────────────────────────────────
export const ESG_TIMESERIES_CODES = [
  "outrasInfosPrecoAcao",
  "ctaCaixaReceitaVenda",
  "dreLucroOperacional",
  "governancaCorporativa",
] as const;

// ── M6: Risco Financeiro ────────────────────────────────────
export const ESG_FINANCIAL_RISK_CODES = [
  "ctaCaixaSaldoFinal",
  "ctaCaixaSaldoInicial",
  "capitalCirculanteLiquido",
  "patrimonioLiquido",
  "balancoAtivoTotal",
  "balancoPassivoTotal",
  "balancoCreditoRotativo",
  "balancoEmprestimos",
  "outrasInfosTaxaCreditoRotativo",
  "outrasInfosTaxaJurosEmprestimos",
  "ctaCaixaDespesaFinanceira",
  "ctaCaixaPagamentoCreditoRotativo",
  "ctaCaixaPagamentoEmprestimo",
  "ctaCaixaReceitaVenda",
  "dreLucroOperacional",
  // Balanço Patrimonial — composição do PL para análise de solvência
  "capitalSocial",
  "balancoCapitalSocial",
  "balancoLucroPrejuizoAcumulado",
  "resultadoAcumuladoAtual",
  "resultadoAcumuladoAtualAntesDistribuicao",
] as const;

// ── M7: Alinhamento Estratégico ──────────────────────────────
export const ESG_STRATEGY_RESULT_CODES = [
  "outrasInfosPrecoAcao",
  "capitalCirculanteLiquido",
  "ctaCaixaReceitaVenda",
  "resultadoAcumuladoAtualAntesDistribuicao",
  "totalDeLotesVendidos",
  "governancaCorporativa",
] as const;

// ── M9: Governança ESG ──────────────────────────────────────
export const ESG_GOVERNANCE_CODES = [
  "governancaCorporativa",
  "governancaCorporativa_usoMaoOBraExtra",
  "governancaCorporativa_totalDispensa",
  "governancaCorporativa_ambPlumaAtual",
  "governancaCorporativa_indQuimEsgCertificacaoInternacionalAcumulado",
  "governancaCorporativa_balancoCreditoRotativo",
  "governancaCorporativa_liberouRelatoriosFinanceiros",
] as const;

// ── M8: Precificação ────────────────────────────────────────
// Aggregate decision codes
export const ESG_PRICING_DECISION_CODES = [
  "fdCapacidadeFabril",
  "fdNumTrabalhadores",
] as const;

// Per-product decision codes
export const ESG_PRICING_DECISION_PRODUCT_CODES = [
  "fdPreco",
  "fdUnidadesAProduzir",
  "fdPesqDesenvolvimento",
  "fdPropagandaPromocao",
] as const;

// Per-product result codes
export const ESG_PRICING_RESULT_PRODUCT_CODES = [
  "marketShare",
  "ctaCaixaReceitaVenda",
  "ctaEstoqueUnidadesProdutosVendidos",
] as const;

// Aggregate result codes
export const ESG_PRICING_RESULT_CODES = [
  "totalDeLotesVendidos",
  "outrasInfosCapacidadeFabrica",
] as const;

// ── M10: Gestão Ambiental (ESG-specific) ────────────────────
export const ESG_ENVIRONMENTAL_CODES = [
  "ambPlumaAtual",
  "ambMultaAmbiental",
  "ambQtdeMultas",
  "ambInvestSmsAcumulado",
  "ambFoiFiscalizada",
  "ambObteveTecnologia",
  "ambRemediacaoTerreno",
  "indQuimEsgCertificacaoInternacional",
  "indQuimEsgCertificacaoInternacionalAcumulado",
  "indQuimEsgInvestimentoCertificacaoInternacionalAcumulado",
  "indQuiInvestimentoAcumuladaoMinimoCertificacoesInternacionais",
  "liberouRelatoriosFinanceiros",
  "mediaInvestSms",
] as const;

// ── M11: Receita Perdida ────────────────────────────────────
export const ESG_LOST_REVENUE_CODES = [] as const;

export const ESG_LOST_REVENUE_PRODUCT_CODES = [
  "ctaEstoqueUnidadesVendasPerdidas",
  "ctaEstoqueUnidadesProdutosVendidos",
  "ctaCaixaReceitaVenda",
  "ctaEstoqueProdutosVendidos",
] as const;

// ── Estoque e Produção ──────────────────────────────────────
export const ESG_INVENTORY_CODES = [
  "outrasInfosCapacidadeFabrica",
] as const;

export const ESG_INVENTORY_PRODUCT_CODES = [
  "ctaEstoqueUnidadesEstoqueFinal",
  "ctaEstoqueUnidadesEstoqueInicial",
  "outrasInfosCustoMedioUnitario",
  "outrasInfosCustoUnitarioPadrao",
  "ctaEstoqueUnidadesProdutosProduzidos",
  "outrasInfosUsoCapacidadeFabril",
  "ctaEstoqueEstoqueFinal",
  "ctaEstoqueEstoqueInicial",
] as const;

// No quality codes — ESG replaces quality with environmental
export const ESG_QUALITY_CODES = [] as const;

export const ESG_STRATEGY_ITEMS = [
  { name: "Valor da Ação", code: "outrasInfosPrecoAcao" },
  { name: "Capital Circulante Líq.", code: "capitalCirculanteLiquido" },
  { name: "Receita de Vendas", code: "ctaCaixaReceitaVenda" },
  { name: "Resultado Acumulado", code: "resultadoAcumuladoAtualAntesDistribuicao" },
  { name: "Lotes Vendidos Total", code: "totalDeLotesVendidos" },
  { name: "Governança ESG", code: "governancaCorporativa" },
];

const ESG_SQUAD_PROMPT = `## REGRA ABSOLUTA — ZERO INVENÇÃO
⚠️ Você tem APENAS os dados fornecidos na seção "Dados Reais" abaixo. Se uma seção diz "SEM DADOS", você NÃO TEM essa informação.
- **NUNCA invente números, métricas, valores ou fatos** — nem aproximados, nem "provavelmente", nem "tipicamente"
- **Se não tem o dado, diga explicitamente**: "Não tenho esse dado disponível no contexto atual"
- **Se uma tabela está vazia ou ausente, diga**: "Não tenho dados de [módulo] para este período"
- **Proibido**: chutar, estimar sem base, usar "conhecimento geral" como substituto de dados reais
- Violar esta regra é PIOR do que não responder

---

Você orquestra o **Simulation Squad** — uma sala de análise com 8 especialistas de indústria química/ESG discutindo o Jogo de Negócios ESG. O Professor é quem comanda a sessão.

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
- ⚠️ NUNCA invente dados — use APENAS o que está nas tabelas acima. Se a tabela diz "SEM DADOS", responda que não tem essa informação. JAMAIS preencha com valores inventados.
- Jogo: Negócios ESG — 3 produtos (Shampoo, Repelente, Selante), gestão fabril, SMS ambiental, certificações ESG, 6 objetivos estratégicos`;

export const esgConfig: GameConfig = {
  type: "esg",
  periodLabel: "Mês",
  periodLabelShort: "M",
  maxPeriods: 12,
  nameFilter: "%ESG%",
  productMap: { 130: "p1", 131: "p2", 132: "p3" },
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
      attended: "ctaEstoqueUnidadesProdutosVendidos_p1",
      demand: undefined,
      limit: undefined,
      lost: "ctaEstoqueUnidadesVendasPerdidas_p1",
      hasIdleness: false,
    },
    {
      key: "repelente",
      label: "Repelente",
      suffix: "p2",
      attended: "ctaEstoqueUnidadesProdutosVendidos_p2",
      demand: undefined,
      limit: undefined,
      lost: "ctaEstoqueUnidadesVendasPerdidas_p2",
      hasIdleness: false,
    },
    {
      key: "selante",
      label: "Selante",
      suffix: "p3",
      attended: "ctaEstoqueUnidadesProdutosVendidos_p3",
      demand: undefined,
      limit: undefined,
      lost: "ctaEstoqueUnidadesVendasPerdidas_p3",
      hasIdleness: false,
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
    efficiencyProduct: ESG_EFFICIENCY_PRODUCT_CODES,
    profitability: ESG_PROFITABILITY_CODES,
    profitabilityProduct: ESG_PROFITABILITY_PRODUCT_CODES,
    benchmarking: ESG_BENCHMARKING_CODES,
    timeseries: ESG_TIMESERIES_CODES,
    financialRisk: ESG_FINANCIAL_RISK_CODES,
    strategyResults: ESG_STRATEGY_RESULT_CODES,
    governance: ESG_GOVERNANCE_CODES,
    pricingDecisions: ESG_PRICING_DECISION_CODES,
    pricingDecisionsProduct: ESG_PRICING_DECISION_PRODUCT_CODES,
    pricingResults: ESG_PRICING_RESULT_CODES,
    pricingResultsProduct: ESG_PRICING_RESULT_PRODUCT_CODES,
    quality: ESG_QUALITY_CODES,
    lostRevenue: ESG_LOST_REVENUE_CODES,
    lostRevenueProduct: ESG_LOST_REVENUE_PRODUCT_CODES,
    environmental: ESG_ENVIRONMENTAL_CODES,
    inventory: ESG_INVENTORY_CODES,
    inventoryProduct: ESG_INVENTORY_PRODUCT_CODES,
  },
  strategyItems: ESG_STRATEGY_ITEMS,
  governanceComponents: [
    { key: "horaExtra", code: "governancaCorporativa_usoMaoOBraExtra", labelKey: "govHorasExtras" },
    { key: "demissoes", code: "governancaCorporativa_totalDispensa", labelKey: "govDispensas" },
    { key: "pluma", code: "governancaCorporativa_ambPlumaAtual", labelKey: "govPluma" },
    { key: "certificacoesESG", code: "governancaCorporativa_indQuimEsgCertificacaoInternacionalAcumulado", labelKey: "govCertificacoesESG" },
    { key: "creditoRotativo", code: "governancaCorporativa_balancoCreditoRotativo", labelKey: "govCreditoRotativo" },
    { key: "relatorios", code: "governancaCorporativa_liberouRelatoriosFinanceiros", labelKey: "govRelatorios" },
  ],
  squadPrompt: ESG_SQUAD_PROMPT,
};
