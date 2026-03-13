/**
 * Hospital Game Configuration
 * Extracted from queries.ts and data-provider.ts
 */

import type { GameConfig } from "../game-config";

export const HOSPITAL_EFFICIENCY_CODES = [
  "atendimentos_prontoAtendimento",
  "atendimentos_internacao",
  "atendimentos_altaComplexidade",
  "atendimentosPerdidosprontoAtendimento",
  "atendimentosPerdidosinternacao",
  "atendimentosPerdidosaltaComplexidade",
  "demandaFinal_prontoAtendimento",
  "demandaFinal_internacao",
  "demandaFinal_altaComplexidade",
  "limites_prontoAtendimento",
  "limites_altaComplexidade",
  "ociosidade_prontoAtendimento",
  "ociosidade_altaComplexidade",
] as const;

export const HOSPITAL_PROFITABILITY_CODES = [
  "receita_total_prontoAtendimento",
  "receita_total_internacao",
  "receita_total_altaComplexidade",
  "receita_liquida_prontoAtendimento",
  "receita_liquida_internacao",
  "receita_liquida_altaComplexidade",
  "glosa_prontoAtendimento",
  "glosa_internacao",
  "glosa_altaComplexidade",
  "inadimplenciaParticularesprontoAtendimento",
  "inadimplenciaParticularesinternacao",
  "inadimplenciaParticularesaltaComplexidade",
  "custo_insumos_prontoAtendimento",
  "custo_insumos_internacao",
  "custo_insumos_altaComplexidade",
  "custo_pessoal_prontoAtendimento",
  "custo_pessoal_internacao",
  "custo_pessoal_altaComplexidade",
  "margem_contribuicao_prontoAtendimento",
  "margem_contribuicao_internacao",
  "margem_contribuicao_altaComplexidade",
  "percentual_total_margem_contribuicao_prontoAtendimento",
  "percentual_total_margem_contribuicao_internacao",
  "percentual_total_margem_contribuicao_altaComplexidade",
] as const;

export const HOSPITAL_BENCHMARKING_CODES = [
  "valor_acao",
  "receitaLiquidaTotal",
  "resultadoOperacionalLiquido",
  "resultadoOperacionalLiquidoAcumulado",
  "vidasAtendidas",
  "medicosCadastrados",
  "capitalCirculanteLiq",
  "patrimonioLiquido",
  "colocacaoRankingPeriodo",
  "numeroPontosPeriodo",
  "saldoFinal",
  "receitasOperacionais",
  "despesasTotais",
  "resultadoBruto",
  "resultadoAntesDosImpostos",
] as const;

export const HOSPITAL_TIMESERIES_CODES = [
  "valor_acao",
  "receitaLiquidaTotal",
  "resultadoOperacionalLiquido",
  "governancaCorporativa",
] as const;

export const HOSPITAL_FINANCIAL_RISK_CODES = [
  "saldoFinal",
  "saldoInicialTrimestre",
  "capitalCirculanteLiq",
  "patrimonioLiquido",
  "totalAtivo",
  "totalPassivo",
  "creditoRotativo",
  "utilizacaoCreditoRotativo",
  "hospitalPercentualCreditoRotativo",
  "despesaCreditoRotativo",
  "despesa_emprestimo",
  "taxa_juros_emprestimo",
  "planoEmergencial",
  "receitaLiquidaTotal",
] as const;

export const HOSPITAL_STRATEGY_RESULT_CODES = [
  "valor_acao",
  "medicosCadastrados",
  "receitaLiquidaTotal",
  "resultadoOperacionalLiquidoAcumulado",
  "capitalCirculanteLiq",
  "vidasAtendidas",
  "governancaCorporativa",
] as const;

export const HOSPITAL_GOVERNANCE_CODES = [
  "governancaCorporativa",
  "governancaCorporativa_creditoRotativo",
  "governancaCorporativa_totalDispensa",
  "governancaCorporativa_usoMaoOBraExtra",
  "governancaCorporativa_numeroCertificacoes",
  "governancaCorporativa_liberouRelatoriosFinanceirosHospitais",
  "governancaCorporativa_atratividadeParcial_taxaInfeccao",
] as const;

export const HOSPITAL_PRICING_DECISION_CODES = [
  "fdreceitapa",
  "fdreceitaint",
  "fdreceitaaltacomplexidade",
  "boaSaude",
  "goodShape",
  "healthy",
  "outras",
  "particulares",
  "tipTop",
  "unique",
] as const;

export const HOSPITAL_PRICING_RESULT_CODES = [
  "marketShareAtendimentosprontoAtendimento",
  "marketShareAtendimentosinternacao",
  "marketShareAtendimentosaltaComplexidade",
  "medias_prontoAtendimento",
  "medias_internacao",
  "medias_altaComplexidade",
  "receita_servico_plano_prontoAtendimento_boaSaude",
  "receita_servico_plano_prontoAtendimento_goodShape",
  "receita_servico_plano_prontoAtendimento_healthy",
  "receita_servico_plano_prontoAtendimento_outras",
  "receita_servico_plano_prontoAtendimento_particulares",
  "receita_servico_plano_prontoAtendimento_tipTop",
  "receita_servico_plano_prontoAtendimento_unique",
  "receita_servico_plano_internacao_boaSaude",
  "receita_servico_plano_internacao_goodShape",
  "receita_servico_plano_internacao_healthy",
  "receita_servico_plano_internacao_outras",
  "receita_servico_plano_internacao_particulares",
  "receita_servico_plano_internacao_tipTop",
  "receita_servico_plano_internacao_unique",
  "receita_servico_plano_altaComplexidade_boaSaude",
  "receita_servico_plano_altaComplexidade_goodShape",
  "receita_servico_plano_altaComplexidade_healthy",
  "receita_servico_plano_altaComplexidade_outras",
  "receita_servico_plano_altaComplexidade_particulares",
  "receita_servico_plano_altaComplexidade_tipTop",
  "receita_servico_plano_altaComplexidade_unique",
  "atratividadeFinal_prontoAtendimento_boaSaude",
  "atratividadeFinal_prontoAtendimento_goodShape",
  "atratividadeFinal_prontoAtendimento_healthy",
  "atratividadeFinal_prontoAtendimento_outras",
  "atratividadeFinal_prontoAtendimento_particulares",
  "atratividadeFinal_prontoAtendimento_tipTop",
  "atratividadeFinal_prontoAtendimento_unique",
  "atratividadeFinal_internacao_boaSaude",
  "atratividadeFinal_internacao_goodShape",
  "atratividadeFinal_internacao_healthy",
  "atratividadeFinal_internacao_outras",
  "atratividadeFinal_internacao_particulares",
  "atratividadeFinal_internacao_tipTop",
  "atratividadeFinal_internacao_unique",
  "atratividadeFinal_altaComplexidade_boaSaude",
  "atratividadeFinal_altaComplexidade_goodShape",
  "atratividadeFinal_altaComplexidade_healthy",
  "atratividadeFinal_altaComplexidade_outras",
  "atratividadeFinal_altaComplexidade_particulares",
  "atratividadeFinal_altaComplexidade_tipTop",
  "atratividadeFinal_altaComplexidade_unique",
] as const;

export const HOSPITAL_QUALITY_CODES = [
  "atratividadeParcial_taxaInfeccao",
  "atratividadeParcial_atratividade_Infeccao",
  "atratividadeParcial_certificacoesInternacionais",
  "numeroCertificacoes",
  "investimentosAcumuladosCertificacao",
  "investimentosACumuladosControleInfeccao",
  "investimentosAcumuladosLixo",
  "alertaAnvisa",
  "fiscalizacaoAnvisa",
  "multaAnvisa",
  "sucessoCertificacoes",
  "fdinvestimentocertificaointernacional",
  "fdinvestimentocontroleinfeccao",
  "gastosEmTerceirizacaoDelixo",
  "governancaCorporativa_atratividadeParcial_taxaInfeccao",
] as const;

export const HOSPITAL_LOST_REVENUE_CODES = [
  "ociosidade_prontoAtendimento",
  "ociosidade_altaComplexidade",
  "atendimentosPerdidosprontoAtendimento",
  "atendimentosPerdidosinternacao",
  "atendimentosPerdidosaltaComplexidade",
  "receita_liquida_prontoAtendimento",
  "receita_liquida_internacao",
  "receita_liquida_altaComplexidade",
  "atendimentos_prontoAtendimento",
  "atendimentos_internacao",
  "atendimentos_altaComplexidade",
  "margem_contribuicao_prontoAtendimento",
  "margem_contribuicao_internacao",
  "margem_contribuicao_altaComplexidade",
  "limites_prontoAtendimento",
  "limites_altaComplexidade",
  "demandaFinal_prontoAtendimento",
  "demandaFinal_internacao",
  "demandaFinal_altaComplexidade",
] as const;

export const HOSPITAL_CONVENIOS = ["boaSaude", "goodShape", "healthy", "outras", "particulares", "tipTop", "unique"] as const;

export const HOSPITAL_SERVICES_PRICING = [
  { key: "PA", suffix: "prontoAtendimento" },
  { key: "INT", suffix: "internacao" },
  { key: "AC", suffix: "altaComplexidade" },
] as const;

export const HOSPITAL_STRATEGY_ITEMS = [
  { name: "Preço da Ação", code: "valor_acao" },
  { name: "Médicos Cadastrados", code: "medicosCadastrados" },
  { name: "Receitas Op. Líquidas", code: "receitaLiquidaTotal" },
  { name: "Resultado Op. Acumulado", code: "resultadoOperacionalLiquidoAcumulado" },
  { name: "Capital Circulante Líq.", code: "capitalCirculanteLiq" },
  { name: "Vidas Atendidas", code: "vidasAtendidas" },
  { name: "Governança Corporativa", code: "governancaCorporativa" },
];

const HOSPITAL_SQUAD_PROMPT = `Você orquestra o **Simulation Squad** — uma sala de análise com 8 especialistas hospitalares discutindo o Jogo de Hospitais. O Professor é quem comanda a sessão.

## O TIME (sempre use ícone + nome + cargo ao se apresentar)

🏛️ **Dr. Mendonça, Árbitro-Geral** — Ex-superintendente de 3 redes hospitalares, 30 anos de gestão. Pausado, cirúrgico nas palavras. Conhece CADA regra do manual v2.3. Fala em comparativos — nunca analisa uma equipe sem mostrar as outras. Bate na mesa quando vê dado distorcido. Frases: Vamos aos fatos. / O comparativo não perdoa. / Isso aqui é regra, não sugestão.

💰 **Helena Bastos, Diretora Financeira** — Ex-Goldman Sachs, voltou pro setor de saúde por vocação. Conservadora, fala em cenários de caixa. Quando o caixa está bem, sorri discretamente. Quando está mal, olha por cima dos óculos e diz a verdade crua. Adora tabelas. Frases: O caixa não mente. / Margem negativa é hemorragia. / Mostre-me o DRE antes de opinar.

🏥 **Carlos Drummond, Diretor de Operações** — Engenheiro biomédico, 20 anos em hospitais. Pensa em fluxo: leito ocupado é receita, leito vazio é custo fixo queimando, demanda perdida é dinheiro que foi embora. Fica impaciente com decisões que ignoram capacidade. Frases: Demanda perdida é receita que foi embora. / Quantos leitos sobraram? / Não adianta faturar se o PA não atende.

👥 **Patrícia Souza, Diretora de RH** — Psicóloga organizacional, defensora ferrenha do time. Empática mas firme — se alguém sugere cortar pessoal sem justificativa, ela retruca na hora. Monitora horas extras como termômetro de saúde operacional. Frases: Gente é investimento, não custo. / Hora extra crônica é bomba-relógio. / Quem demitiu demais, vai pagar em governança.

📊 **Rodrigo Martins, Head de Pricing** — Economista, ex-consultor de operadoras. Vê preço como ferramenta estratégica, não planilha. Analítico, competitivo — compara ticket médio entre equipes com prazer. Provoca quando alguém precifica no escuro. Frases: Preço é estratégia, não chute. / Glosa alta é preço mal negociado. / Olha o market share antes de subir preço.

⚕️ **Dra. Fernanda Castro, Diretora de Qualidade** — Infectologista, 15 anos de CCIH. Rigorosa, detalhista — taxa de infecção é seu termômetro pessoal. Alerta sobre ANVISA antes que o problema apareça. Discorda de Helena quando qualidade é sacrificada por margem. Frases: Qualidade não é gasto, é sobrevivência. / ANVISA não perdoa reincidência. / Certificação leva tempo — comece agora.

🎯 **André Vasconcelos, Estrategista-Chefe** — Ex-Bain, MBA Wharton. Vê o jogo como um tabuleiro de xadrez — analisa o que cada equipe NÃO fez tanto quanto o que fez. Provocador, desafia o status quo. Quando o ranking muda, ele já sabe por quê. Frases: O ranking não mente. / Quem não alinha peso com resultado, cai. / Antecipe — não reaja.

📢 **Juliana Reis, Diretora Comercial** — Comunicadora nata, 10 anos em marketing hospitalar. Vê imagem e médicos como ativos estratégicos. Briga com Rodrigo sobre preço vs. posicionamento. Energética, usa analogias do mercado. Frases: Percepção é realidade no mercado. / Médico bom atrai paciente. / Unique é premium — trate como tal.

## COMO A SALA FUNCIONA

**Formato de fala — SEMPRE assim:**
🏛️ **Dr. Mendonça, Árbitro-Geral:** [fala em 2-4 frases, direto ao ponto]

**Dinâmica da conversa:**
- Selecione 2-4 especialistas por rodada, os mais relevantes pro tema
- Cada um fala CURTO — 2-5 frases no máximo, com personalidade
- Traga TABELAS COMPARATIVAS sempre que possível — o Professor precisa ver os números lado a lado
- Permita DEBATE REAL: discordâncias, interrupções, construção sobre o ponto do outro
- Cross-talk natural: "Como a Helena mostrou..." / "Discordo do André aqui..." / "Carlos, tem leito pra isso?"
- Comportamentos vivos: bater na mesa, levantar sobrancelha, sorrir discretamente, ajustar os óculos
- Ao final, o especialista mais sênior fecha com 1 insight-chave

**Seleção inteligente:**
- Comparativo/ranking → Dr. Mendonça + André + Helena
- Caixa/DRE/margem/risco → Helena + Dr. Mendonça + Carlos
- Capacidade/utilização/demanda → Carlos + Helena + Dr. Mendonça
- Pessoal/horas extras → Patrícia + Helena + Dra. Fernanda
- Preços/convênios/market share → Rodrigo + Juliana + André
- Infecção/ANVISA/governança → Dra. Fernanda + Patrícia + Dr. Mendonça
- Pesos/alinhamento/ação → André + Dr. Mendonça + Helena
- Médicos/imagem → Juliana + Dra. Fernanda + Rodrigo
- Se regra do jogo → Dr. Mendonça SEMPRE entra
- Se impacto financeiro → Helena SEMPRE entra

## ESTILO DE RESPOSTA

- Português brasileiro, sem aspas desnecessárias
- CONCISO — cada especialista fala 2-5 frases, NÃO parágrafos longos
- VISUAL — use tabelas markdown para comparar equipes SEMPRE que tiver dados numéricos
- DADOS PRIMEIRO — abra com o número, depois o insight
- NUNCA invente dados — use APENAS o que está no contexto. Se não tem, diga que não tem
- Jogo: Simulation Hospital v2.3 — 3 linhas de serviço (PA, Internação, Cirurgia/AC), 7 áreas de decisão, 8 objetivos estratégicos`;

export const hospitalConfig: GameConfig = {
  type: "hospital",
  periodLabel: "Trimestre",
  periodLabelShort: "T",
  maxPeriods: 8,
  nameFilter: "%ospit%",
  products: [],
  services: [
    {
      key: "emergency",
      label: "Pronto Atendimento",
      suffix: "prontoAtendimento",
      attended: "atendimentos_prontoAtendimento",
      demand: "demandaFinal_prontoAtendimento",
      limit: "limites_prontoAtendimento",
      lost: "atendimentosPerdidosprontoAtendimento",
      hasIdleness: true,
    },
    {
      key: "inpatient",
      label: "Internação sem Cirurgia",
      suffix: "internacao",
      attended: "atendimentos_internacao",
      demand: "demandaFinal_internacao",
      limit: null,
      lost: "atendimentosPerdidosinternacao",
      hasIdleness: false,
    },
    {
      key: "surgery",
      label: "Cirurgia / Alta Complexidade",
      suffix: "altaComplexidade",
      attended: "atendimentos_altaComplexidade",
      demand: "demandaFinal_altaComplexidade",
      limit: "limites_altaComplexidade",
      lost: "atendimentosPerdidosaltaComplexidade",
      hasIdleness: true,
    },
  ],
  modules: [
    { id: "efficiency", titleKey: "modEfficiency", descriptionKey: "modEfficiencyDesc", icon: "Activity", href: "efficiency" },
    { id: "profitability", titleKey: "modProfitability", descriptionKey: "modProfitabilityDesc", icon: "DollarSign", href: "profitability" },
    { id: "benchmarking", titleKey: "modBenchmarking", descriptionKey: "modBenchmarkingDesc", icon: "BarChart3", href: "benchmarking" },
    { id: "timeseries", titleKey: "modTimeseries", descriptionKey: "modTimeseriesDesc", icon: "TrendingUp", href: "timeseries" },
    { id: "governance", titleKey: "modGovernance", descriptionKey: "modGovernanceDesc", icon: "Shield", href: "governance" },
    { id: "financial-risk", titleKey: "modFinancialRisk", descriptionKey: "modFinancialRiskDesc", icon: "AlertTriangle", href: "financial-risk" },
    { id: "strategy", titleKey: "modStrategy", descriptionKey: "modStrategyDesc", icon: "Target", href: "strategy" },
    { id: "pricing", titleKey: "modPricing", descriptionKey: "modPricingDesc", icon: "Tag", href: "pricing" },
    { id: "quality", titleKey: "modQuality", descriptionKey: "modQualityDesc", icon: "HeartPulse", href: "quality" },
    { id: "lost-revenue", titleKey: "modLostRevenue", descriptionKey: "modLostRevenueDesc", icon: "CircleDollarSign", href: "lost-revenue" },
  ],
  codes: {
    efficiency: HOSPITAL_EFFICIENCY_CODES,
    profitability: HOSPITAL_PROFITABILITY_CODES,
    benchmarking: HOSPITAL_BENCHMARKING_CODES,
    timeseries: HOSPITAL_TIMESERIES_CODES,
    financialRisk: HOSPITAL_FINANCIAL_RISK_CODES,
    strategyResults: HOSPITAL_STRATEGY_RESULT_CODES,
    governance: HOSPITAL_GOVERNANCE_CODES,
    pricingDecisions: HOSPITAL_PRICING_DECISION_CODES,
    pricingResults: HOSPITAL_PRICING_RESULT_CODES,
    quality: HOSPITAL_QUALITY_CODES,
    lostRevenue: HOSPITAL_LOST_REVENUE_CODES,
  },
  strategyItems: HOSPITAL_STRATEGY_ITEMS,
  governanceComponents: [
    { key: "creditoRotativo", code: "governancaCorporativa_creditoRotativo", labelKey: "govCreditoRotativo" },
    { key: "totalDispensa", code: "governancaCorporativa_totalDispensa", labelKey: "govDispensas" },
    { key: "usoMaoObraExtra", code: "governancaCorporativa_usoMaoOBraExtra", labelKey: "govHorasExtras" },
    { key: "numeroCertificacoes", code: "governancaCorporativa_numeroCertificacoes", labelKey: "govCertificacoes" },
    { key: "transparencia", code: "governancaCorporativa_liberouRelatoriosFinanceirosHospitais", labelKey: "govTransparencia" },
    { key: "taxaInfeccao", code: "governancaCorporativa_atratividadeParcial_taxaInfeccao", labelKey: "govTaxaInfeccao" },
  ],
  convenios: HOSPITAL_CONVENIOS,
  servicesPricing: HOSPITAL_SERVICES_PRICING,
  squadPrompt: HOSPITAL_SQUAD_PROMPT,
};
