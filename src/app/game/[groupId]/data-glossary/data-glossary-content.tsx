"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Database, Brain, Calculator, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/lib/use-locale";
import type { Locale } from "@/lib/i18n";

interface Props {
  groupId: string;
  gameCode: string;
}

interface GlossaryEntry {
  indicator: string;
  description: string;
  formula: string;
  usage: string;
  source: "db" | "decision" | "computed" | "ai";
}

interface ModuleGlossary {
  id: string;
  title: string;
  entries: GlossaryEntry[];
}

function sourceIcon(source: GlossaryEntry["source"]) {
  switch (source) {
    case "db":
      return <Database className="inline h-3.5 w-3.5 text-blue-600" />;
    case "decision":
      return <ClipboardList className="inline h-3.5 w-3.5 text-amber-600" />;
    case "computed":
      return <Calculator className="inline h-3.5 w-3.5 text-green-600" />;
    case "ai":
      return <Brain className="inline h-3.5 w-3.5 text-purple-600" />;
  }
}

function sourceLabel(source: GlossaryEntry["source"], labels: Record<string, string>) {
  switch (source) {
    case "db": return labels.db;
    case "decision": return labels.decision;
    case "computed": return labels.computed;
    case "ai": return labels.ai;
  }
}

function getGlossaryData(locale: Locale): ModuleGlossary[] {
  if (locale === "en") return glossaryEN;
  return glossaryPT;
}

const glossaryPT: ModuleGlossary[] = [
  {
    id: "efficiency",
    title: "M1 — Eficiência Operacional",
    entries: [
      { indicator: "Capacidade", description: "Número máximo de atendimentos que o hospital pode realizar no trimestre, por serviço. Determinada pelos leitos ativos, unidades de PA e colaboradores.", formula: "Variável limites_prontoAtendimento / limites_altaComplexidade do simulador. Para internação, usa a demanda como proxy.", usage: "Tutor: identificar equipes subdimensionadas ou superdimensionadas.", source: "db" },
      { indicator: "Atendimentos Realizados", description: "Volume efetivo de pacientes atendidos no trimestre, por serviço (PA, Internação, Cirurgia/AC).", formula: "Variável atendimentos_{serviço} direto do simulador.", usage: "Tutor: comparar volume entre equipes e identificar quem está atendendo mais/menos.", source: "db" },
      { indicator: "Taxa de Utilização (%)", description: "Percentual da capacidade que foi efetivamente utilizada.", formula: "(Atendimentos Realizados / Capacidade) × 100", usage: "Tutor: < 70% indica ociosidade, > 100% indica sobrecarga.", source: "computed" },
      { indicator: "Demanda Perdida", description: "Pacientes que procuraram o hospital mas não foram atendidos por falta de capacidade.", formula: "Variável atendimentosPerdidos{serviço} direto do simulador.", usage: "Tutor: perguntar à equipe por que está perdendo pacientes e qual o impacto financeiro.", source: "db" },
      { indicator: "Status", description: "Classificação automática: OK (utilização 70-100%), Sobrecarga (demanda perdida > 0), Ociosidade (utilização < 70%).", formula: "Se demanda perdida > 0 → Sobrecarga; se utilização < 70% → Ociosidade; senão → OK.", usage: "Tutor: semáforo rápido para identificar problemas.", source: "computed" },
    ],
  },
  {
    id: "profitability",
    title: "M2 — Diagnóstico de Lucratividade",
    entries: [
      { indicator: "Receita Bruta", description: "Receita total gerada por serviço antes de deduções (Ticket Médio × Atendimentos).", formula: "Variável receita_total_{serviço} do simulador.", usage: "Tutor: entender o potencial de faturamento de cada linha.", source: "db" },
      { indicator: "Glosas", description: "Valores recusados pelas operadoras de planos de saúde. Percentual típico 3-4%.", formula: "Variável glosa_{serviço} do simulador.", usage: "Tutor: glosas altas indicam problemas de documentação ou relacionamento com operadoras.", source: "db" },
      { indicator: "Inadimplência", description: "Valores não pagos pelo grupo Particulares. Percentual varia de 8% a 21% conforme serviço.", formula: "Variável inadimplenciaParticulares{serviço} do simulador.", usage: "Tutor: discutir a decisão de manter/remover Particulares como operadora.", source: "db" },
      { indicator: "Receita Líquida", description: "Receita após descontar glosas e inadimplência.", formula: "Variável receita_liquida_{serviço} do simulador.", usage: "Tutor: base real para calcular margens.", source: "db" },
      { indicator: "Custos de Insumos", description: "Medicamentos, materiais, DMI, gases medicinais e outros insumos hospitalares por serviço.", formula: "Variável custo_insumos_{serviço} do simulador.", usage: "Tutor: correlacionar com volume — custos variáveis acompanham atendimentos.", source: "db" },
      { indicator: "Custos de Pessoal", description: "Salários, encargos, benefícios e horas extras dos colaboradores alocados ao serviço.", formula: "Variável custo_pessoal_{serviço} do simulador.", usage: "Tutor: maior componente de custo. Discutir política salarial e horas extras.", source: "db" },
      { indicator: "Margem de Contribuição", description: "Receita Líquida menos Custos Diretos (Insumos + Pessoal). Indica quanto cada serviço contribui para cobrir custos fixos.", formula: "Variável margem_contribuicao_{serviço} do simulador.", usage: "Tutor: PA tipicamente tem margem negativa no início (-15%). Discutir se é estratégico manter.", source: "db" },
      { indicator: "Margem %", description: "Margem de contribuição como percentual da receita líquida.", formula: "Variável percentual_total_margem_contribuicao_{serviço} do simulador.", usage: "Tutor: comparar margens entre equipes e serviços.", source: "db" },
    ],
  },
  {
    id: "benchmarking",
    title: "M3 — Benchmarking Inter-Equipes",
    entries: [
      { indicator: "Valor da Ação (R$)", description: "Preço da ação do hospital no mercado. Reflete o desempenho geral da gestão.", formula: "Variável valor_acao do simulador.", usage: "Tutor: indicador sintético mais importante — resume a percepção do mercado.", source: "db" },
      { indicator: "Receita Líquida Total", description: "Soma das receitas líquidas dos 3 serviços.", formula: "Variável receitaLiquidaTotal do simulador.", usage: "Tutor: escala de operação.", source: "db" },
      { indicator: "Resultado Operacional Líquido", description: "Lucro operacional do trimestre após todas as despesas e impostos.", formula: "Variável resultadoOperacionalLiquido do simulador.", usage: "Tutor: rentabilidade real no período.", source: "db" },
      { indicator: "Margem Operacional (%)", description: "ROL como percentual da receita líquida.", formula: "(Resultado Op. Líquido / Receita Líquida Total) × 100", usage: "Tutor: eficiência na conversão de receita em lucro. Meta do Conselho: > 10%.", source: "computed" },
      { indicator: "Vidas Atendidas", description: "Total de pacientes internados (Internação + Cirurgia/AC). PA não conta neste objetivo.", formula: "Variável vidasAtendidas do simulador.", usage: "Tutor: objetivo estratégico — volume nos serviços de maior valor.", source: "db" },
      { indicator: "Médicos Cadastrados", description: "Quantidade de médicos com relacionamento profissional (sem vínculo CLT). Atraem pacientes para Cirurgia/AC.", formula: "Variável medicosCadastrados do simulador.", usage: "Tutor: decisão de investimento em Imagem Corporativa e Inovação.", source: "db" },
      { indicator: "Capital Circulante Líquido (CCL)", description: "Ativo Circulante menos Passivo Circulante. Indica capacidade de pagar obrigações de curto prazo.", formula: "Variável capitalCirculanteLiq do simulador (= Caixa + Aplicações - Empréstimos - Crédito Rotativo).", usage: "Tutor: CCL negativo é sinal de alerta financeiro grave.", source: "db" },
      { indicator: "Ranking Geral", description: "Posição no ranking do trimestre baseada nos pesos estratégicos × número de ordem.", formula: "Variável colocacaoRankingPeriodo do simulador.", usage: "Tutor: quem está ganhando e por quê.", source: "db" },
    ],
  },
  {
    id: "timeseries",
    title: "M5 — Evolução Estratégica",
    entries: [
      { indicator: "Valor da Ação (série)", description: "Evolução do preço da ação ao longo de todos os trimestres.", formula: "Variável valor_acao por período, do simulador.", usage: "Tutor: identificar tendências — equipe em ascensão ou declínio.", source: "db" },
      { indicator: "Receita Líquida (série)", description: "Evolução da receita líquida total ao longo dos trimestres.", formula: "Variável receitaLiquidaTotal por período.", usage: "Tutor: crescimento vs. estagnação.", source: "db" },
      { indicator: "Margem Operacional (série)", description: "Evolução da margem operacional (%) ao longo dos trimestres.", formula: "(resultadoOperacionalLiquido / receitaLiquidaTotal) × 100 por período.", usage: "Tutor: melhoria de eficiência ao longo do tempo.", source: "computed" },
      { indicator: "Governança (série)", description: "Evolução do score de governança corporativa.", formula: "Variável governancaCorporativa por período.", usage: "Tutor: compromisso sustentável com boas práticas.", source: "db" },
    ],
  },
  {
    id: "governance",
    title: "M9 — Governança Corporativa",
    entries: [
      { indicator: "Score de Governança", description: "Nota global atribuída por auditoria independente. Média de 6 componentes (Manual p.42-44).", formula: "Variável governancaCorporativa do simulador.", usage: "Tutor: peso compulsório 5 no ranking — sempre relevante.", source: "db" },
      { indicator: "Crédito Rotativo (nota)", description: "Nota pelo uso de crédito rotativo. Menos rotativo = melhor nota.", formula: "Variável governancaCorporativa_creditoRotativo. Fórmula: Ne - ((Ne-1) × Cr / 100M).", usage: "Tutor: gestão de caixa — quem está com dificuldade financeira.", source: "db" },
      { indicator: "Demissões (nota)", description: "Nota por volume de demissões. Menos demissões = melhor nota.", formula: "Variável governancaCorporativa_totalDispensa.", usage: "Tutor: impacto social e na mídia.", source: "db" },
      { indicator: "Horas Extras (nota)", description: "Nota pelo uso de horas extras. Menos horas extras = melhor nota.", formula: "Variável governancaCorporativa_usoMaoOBraExtra.", usage: "Tutor: qualidade de vida dos colaboradores.", source: "db" },
      { indicator: "Certificações (nota)", description: "Nota pelo número de certificações internacionais ESG obtidas.", formula: "Variável governancaCorporativa_numeroCertificacoes.", usage: "Tutor: relacionamento com mercado financeiro e investidores.", source: "db" },
      { indicator: "Transparência (nota)", description: "Nota pela liberação dos relatórios financeiros ao mercado.", formula: "Variável governancaCorporativa_liberouRelatoriosFinanceirosHospitais.", usage: "Tutor: decisão estratégica — transparência vs. sigilo competitivo.", source: "db" },
      { indicator: "Taxa de Infecção (nota)", description: "Nota pela taxa de infecção UTI. Menor taxa = melhor nota.", formula: "Variável governancaCorporativa_atratividadeParcial_taxaInfeccao.", usage: "Tutor: impacto em segurança do paciente e certificações.", source: "db" },
    ],
  },
  {
    id: "financial-risk",
    title: "M6 — Risco Financeiro",
    entries: [
      { indicator: "Saldo Final (Caixa)", description: "Dinheiro em caixa ao final do trimestre.", formula: "Variável saldoFinal do simulador.", usage: "Tutor: liquidez imediata.", source: "db" },
      { indicator: "CCL", description: "Capital Circulante Líquido — capacidade de honrar compromissos de curto prazo.", formula: "Variável capitalCirculanteLiq do simulador.", usage: "Tutor: negativo = insolvência técnica.", source: "db" },
      { indicator: "Alavancagem", description: "Relação entre passivo total e patrimônio líquido.", formula: "Total Passivo / Patrimônio Líquido", usage: "Tutor: > 0.5 indica endividamento elevado (Manual: empréstimo limitado a 50% do PL).", source: "computed" },
      { indicator: "Crédito Rotativo", description: "Crédito emergencial concedido automaticamente quando o caixa é insuficiente.", formula: "Variável creditoRotativo do simulador.", usage: "Tutor: sinal de má gestão financeira — juros mais altos que empréstimo.", source: "db" },
      { indicator: "Cobertura de Caixa (%)", description: "Saldo final como percentual da receita líquida.", formula: "(Saldo Final / Receita Líquida Total) × 100", usage: "Tutor: colchão de segurança financeira.", source: "computed" },
      { indicator: "Variação de Caixa", description: "Diferença entre saldo final e saldo inicial do trimestre.", formula: "Saldo Final - Saldo Inicial Trimestre", usage: "Tutor: caixa crescendo ou encolhendo?", source: "computed" },
      { indicator: "Plano Emergencial", description: "Ativado pelo simulador quando o hospital está em situação financeira crítica.", formula: "Variável planoEmergencial do simulador (0 ou 1).", usage: "Tutor: situação gravíssima — equipe precisa de intervenção imediata.", source: "db" },
      { indicator: "Status de Risco", description: "Classificação: Saudável, Atenção ou Crítico.", formula: "Crítico = CCL negativo ou plano emergencial. Atenção = usa crédito rotativo. Saudável = demais.", usage: "Tutor: semáforo rápido de saúde financeira.", source: "computed" },
    ],
  },
  {
    id: "strategy",
    title: "M7 — Alinhamento Estratégico",
    entries: [
      { indicator: "Peso Estratégico", description: "Peso (1-5) atribuído pela equipe a cada um dos 7 objetivos. Soma = 20 (+ 5 de Governança).", formula: "Tabela peso_item_estrategia do banco de dados.", usage: "Tutor: o que a equipe declarou como prioridade.", source: "db" },
      { indicator: "Valor do Resultado", description: "Resultado efetivo obtido em cada objetivo estratégico.", formula: "Variável correspondente (valor_acao, medicosCadastrados, etc.) do simulador.", usage: "Tutor: o que a equipe realmente entregou.", source: "db" },
      { indicator: "Ranking no Objetivo", description: "Posição da equipe em cada objetivo, comparada com as demais.", formula: "Ordenação decrescente do valor entre todas as equipes (1 = melhor).", usage: "Tutor: onde a equipe está se destacando ou ficando para trás.", source: "computed" },
      { indicator: "Alinhado/Desalinhado", description: "Se a equipe deu peso alto (≥ 2) a um objetivo, ela precisa estar na metade superior do ranking.", formula: "Peso ≥ 2 e ranking na metade superior → Alinhado. Peso ≥ 2 e ranking na metade inferior → Desalinhado.", usage: "Tutor: provocar reflexão — 'Vocês priorizaram X mas estão em último nele.'", source: "computed" },
      { indicator: "Score de Alinhamento (%)", description: "Percentual de objetivos priorizados que estão efetivamente alinhados.", formula: "(Objetivos alinhados / Total com peso > 0) × 100", usage: "Tutor: visão geral da coerência estratégica.", source: "computed" },
    ],
  },
  {
    id: "pricing",
    title: "M8 — Precificação Inteligente",
    entries: [
      { indicator: "Preço PA / INT / AC", description: "Ticket Médio (Receita Operacional Média) decidido pela equipe para cada serviço.", formula: "Variáveis fdreceitapa, fdreceitaint, fdreceitaaltacomplexidade da tabela item_decisao.", usage: "Tutor: decisão mais impactante — preço afeta demanda, receita e atratividade.", source: "decision" },
      { indicator: "Média de Mercado", description: "Preço médio praticado por todas as equipes do grupo competitivo.", formula: "Variáveis medias_{serviço} do simulador.", usage: "Tutor: posicionar a equipe vs. concorrência — acima da média perde demanda.", source: "db" },
      { indicator: "Market Share (%)", description: "Percentual dos atendimentos totais do grupo que coube a esta equipe, por serviço.", formula: "Variáveis marketShareAtendimentos{serviço} do simulador.", usage: "Tutor: resultado direto das decisões de preço e atratividade.", source: "db" },
      { indicator: "Receita por Convênio", description: "Receita gerada por cada operadora de saúde, somada nos 3 serviços.", formula: "Variáveis receita_servico_plano_{serviço}_{convênio} do simulador. Soma dos 3 serviços.", usage: "Tutor: identificar quais convênios são mais rentáveis.", source: "db" },
      { indicator: "Atratividade por Convênio", description: "Score de atratividade do hospital para cada operadora (média dos 3 serviços).", formula: "Variáveis atratividadeFinal_{serviço}_{convênio} do simulador. Média dos 3 serviços.", usage: "Tutor: por que uma equipe atrai mais pacientes de certo convênio.", source: "db" },
      { indicator: "Convênios Aceitos", description: "Quais das 7 operadoras a equipe habilitou (Sim/Não). Unique requer 3+ certificações.", formula: "Variáveis boaSaude, goodShape, healthy, outras, particulares, tipTop, unique da tabela item_decisao.", usage: "Tutor: decisão estratégica — mais convênios = mais demanda mas mix diferente.", source: "decision" },
    ],
  },
  {
    id: "quality",
    title: "M10 — Qualidade Assistencial",
    entries: [
      { indicator: "Taxa de Infecção", description: "Score de atratividade parcial baseado na taxa de infecção UTI. Meta do Conselho: 6. Aceitável até 9.", formula: "Variável atratividadeParcial_taxaInfeccao do simulador.", usage: "Tutor: > 9 gera advertência ANVISA, > 10 pode gerar multa.", source: "db" },
      { indicator: "Certificações", description: "Número de certificações internacionais ESG obtidas até o trimestre.", formula: "Variável numeroCertificacoes do simulador.", usage: "Tutor: habilita Unique (3+ certs) e melhora governança.", source: "db" },
      { indicator: "Alertas ANVISA", description: "Quantidade de advertências recebidas da ANVISA por taxa de infecção elevada.", formula: "Variável alertaAnvisa do simulador.", usage: "Tutor: sinal de risco regulatório.", source: "db" },
      { indicator: "Multas ANVISA", description: "Valor financeiro das multas aplicadas pela ANVISA.", formula: "Variável multaAnvisa do simulador.", usage: "Tutor: impacto direto no fluxo de caixa e reputação.", source: "db" },
      { indicator: "Fiscalização ANVISA", description: "Se o hospital foi fiscalizado no trimestre (0/1).", formula: "Variável fiscalizacaoAnvisa do simulador.", usage: "Tutor: fiscalização com taxa > 10 resulta em multa.", source: "db" },
      { indicator: "Investimentos (Período)", description: "Valores investidos no trimestre em controle de infecção, certificação e descarte.", formula: "Variáveis fdinvestimentocontroleinfeccao, fdinvestimentocertificaointernacional, gastosEmTerceirizacaoDelixo.", usage: "Tutor: correlacionar investimento com resultado (taxa de infecção, certificações).", source: "db" },
      { indicator: "Investimentos (Acumulado)", description: "Soma histórica dos investimentos em qualidade desde o início do jogo.", formula: "Variáveis investimentosAcumuladosCertificacao, investimentosACumuladosControleInfeccao, investimentosAcumuladosLixo.", usage: "Tutor: esforço sustentado vs. investimento pontual.", source: "db" },
      { indicator: "Status de Qualidade", description: "Classificação: Excelente, Adequado ou Crítico.", formula: "Crítico = multas > 0 ou alertas > 2. Excelente = certificações > 0 e sem multas. Adequado = demais.", usage: "Tutor: semáforo de qualidade assistencial.", source: "computed" },
    ],
  },
  {
    id: "lost-revenue",
    title: "M11 — Receita Perdida",
    entries: [
      { indicator: "Receita Perdida por Sobrecarga", description: "Receita estimada que a equipe deixou de capturar por não conseguir atender toda a demanda.", formula: "Atendimentos Perdidos × (Receita Líquida / Atendimentos Realizados), por serviço.", usage: "Tutor: 'Vocês estão perdendo dinheiro por falta de capacidade.'", source: "computed" },
      { indicator: "Receita Perdida por Ociosidade", description: "Receita estimada perdida por ter capacidade ociosa (PA e AC apenas).", formula: "Ociosidade (unidades) × (Margem de Contribuição / Atendimentos Realizados), por serviço.", usage: "Tutor: 'Vocês estão pagando por capacidade que não usam.'", source: "computed" },
      { indicator: "Total Perdido", description: "Soma da receita perdida por sobrecarga e por ociosidade, nos 3 serviços.", formula: "Soma de todos os serviços: (perdido sobrecarga + perdido ociosidade).", usage: "Tutor: impacto total da ineficiência operacional.", source: "computed" },
      { indicator: "% Receita Não Capturada", description: "Total perdido como percentual da receita líquida total.", formula: "(Total Perdido / Receita Líquida Total) × 100", usage: "Tutor: 'X% da receita potencial está sendo desperdiçada.'", source: "computed" },
      { indicator: "Tipo Dominante", description: "Se a perda é principalmente por Sobrecarga, Ociosidade ou Equilibrado.", formula: "Sobrecarga se perdas por sobrecarga > 1.5× perdas por ociosidade, e vice-versa.", usage: "Tutor: direciona a recomendação — aumentar capacidade ou otimizar recursos.", source: "computed" },
    ],
  },
  {
    id: "facilitation",
    title: "M4 — Guia de Facilitação",
    entries: [
      { indicator: "Perguntas para o Tutor", description: "Perguntas provocativas geradas por IA para o tutor usar na facilitação.", formula: "Claude AI analisa dados de eficiência, lucratividade e benchmarking do trimestre selecionado.", usage: "Tutor: guia pronto para conduzir a discussão pós-rodada.", source: "ai" },
      { indicator: "Insights por Equipe", description: "Observações personalizadas sobre o desempenho de cada equipe.", formula: "IA identifica padrões, anomalias e oportunidades nos dados.", usage: "Tutor: abordar cada equipe com provocações específicas.", source: "ai" },
    ],
  },
];

const glossaryEN: ModuleGlossary[] = [
  {
    id: "efficiency",
    title: "M1 — Operational Efficiency",
    entries: [
      { indicator: "Capacity", description: "Maximum number of visits the hospital can handle per quarter, by service. Determined by active beds, ER units, and staff.", formula: "Variable limites_prontoAtendimento / limites_altaComplexidade from the simulator. For inpatient, demand is used as proxy.", usage: "Tutor: identify undersized or oversized teams.", source: "db" },
      { indicator: "Visits Completed", description: "Actual patient volume served in the quarter, by service (ER, Inpatient, Surgery/HC).", formula: "Variable atendimentos_{service} directly from the simulator.", usage: "Tutor: compare volume across teams and spot who is serving more/less.", source: "db" },
      { indicator: "Utilization Rate (%)", description: "Percentage of capacity that was actually used.", formula: "(Visits Completed / Capacity) × 100", usage: "Tutor: < 70% signals idleness, > 100% signals overload.", source: "computed" },
      { indicator: "Lost Demand", description: "Patients who sought the hospital but could not be served due to insufficient capacity.", formula: "Variable atendimentosPerdidos{service} directly from the simulator.", usage: "Tutor: ask the team why they are losing patients and what is the financial impact.", source: "db" },
      { indicator: "Status", description: "Automatic classification: OK (utilization 70-100%), Overload (lost demand > 0), Idle (utilization < 70%).", formula: "If lost demand > 0 → Overload; if utilization < 70% → Idle; else → OK.", usage: "Tutor: quick traffic light to spot issues.", source: "computed" },
    ],
  },
  {
    id: "profitability",
    title: "M2 — Profitability Diagnosis",
    entries: [
      { indicator: "Gross Revenue", description: "Total revenue generated per service before deductions (Average Ticket × Visits).", formula: "Variable receita_total_{service} from the simulator.", usage: "Tutor: understand the billing potential of each line.", source: "db" },
      { indicator: "Disallowances", description: "Amounts refused by health plan operators. Typical rate 3-4%.", formula: "Variable glosa_{service} from the simulator.", usage: "Tutor: high disallowances indicate documentation or relationship issues with operators.", source: "db" },
      { indicator: "Defaults", description: "Unpaid amounts from the Private group. Rate ranges from 8% to 21% depending on service.", formula: "Variable inadimplenciaParticulares{service} from the simulator.", usage: "Tutor: discuss the decision to keep/remove Privates as an operator.", source: "db" },
      { indicator: "Net Revenue", description: "Revenue after deducting disallowances and defaults.", formula: "Variable receita_liquida_{service} from the simulator.", usage: "Tutor: the real base for calculating margins.", source: "db" },
      { indicator: "Input Costs", description: "Medications, materials, DMI, medical gases and other hospital supplies per service.", formula: "Variable custo_insumos_{service} from the simulator.", usage: "Tutor: correlate with volume — variable costs follow visits.", source: "db" },
      { indicator: "Labor Costs", description: "Salaries, taxes, benefits and overtime of staff allocated to the service.", formula: "Variable custo_pessoal_{service} from the simulator.", usage: "Tutor: largest cost component. Discuss salary policy and overtime.", source: "db" },
      { indicator: "Contribution Margin", description: "Net Revenue minus Direct Costs (Inputs + Labor). Indicates how much each service contributes to covering fixed costs.", formula: "Variable margem_contribuicao_{service} from the simulator.", usage: "Tutor: ER typically has a negative margin at the start (-15%). Discuss whether it's strategic to keep.", source: "db" },
      { indicator: "Margin %", description: "Contribution margin as a percentage of net revenue.", formula: "Variable percentual_total_margem_contribuicao_{service} from the simulator.", usage: "Tutor: compare margins across teams and services.", source: "db" },
    ],
  },
  {
    id: "benchmarking",
    title: "M3 — Inter-Team Benchmarking",
    entries: [
      { indicator: "Share Price (R$)", description: "Hospital share price in the market. Reflects overall management performance.", formula: "Variable valor_acao from the simulator.", usage: "Tutor: most important synthetic indicator — summarizes market perception.", source: "db" },
      { indicator: "Total Net Revenue", description: "Sum of net revenues from all 3 services.", formula: "Variable receitaLiquidaTotal from the simulator.", usage: "Tutor: scale of operations.", source: "db" },
      { indicator: "Net Operating Result", description: "Operating profit for the quarter after all expenses and taxes.", formula: "Variable resultadoOperacionalLiquido from the simulator.", usage: "Tutor: actual profitability in the period.", source: "db" },
      { indicator: "Operating Margin (%)", description: "NOR as a percentage of net revenue.", formula: "(Net Operating Result / Total Net Revenue) × 100", usage: "Tutor: efficiency in converting revenue to profit. Board target: > 10%.", source: "computed" },
      { indicator: "Patients Attended", description: "Total inpatients (Inpatient + Surgery/HC). ER does not count for this objective.", formula: "Variable vidasAtendidas from the simulator.", usage: "Tutor: strategic objective — volume in higher-value services.", source: "db" },
      { indicator: "Registered Physicians", description: "Number of physicians with a professional relationship (not employees). They attract patients for Surgery/HC.", formula: "Variable medicosCadastrados from the simulator.", usage: "Tutor: investment decision in Corporate Image and Innovation.", source: "db" },
      { indicator: "Net Working Capital (NWC)", description: "Current Assets minus Current Liabilities. Indicates ability to pay short-term obligations.", formula: "Variable capitalCirculanteLiq from the simulator (= Cash + Investments - Loans - Revolving Credit).", usage: "Tutor: negative NWC is a severe financial warning.", source: "db" },
      { indicator: "Overall Ranking", description: "Quarterly ranking position based on strategic weights × order number.", formula: "Variable colocacaoRankingPeriodo from the simulator.", usage: "Tutor: who is winning and why.", source: "db" },
    ],
  },
  {
    id: "timeseries",
    title: "M5 — Strategic Evolution",
    entries: [
      { indicator: "Share Price (series)", description: "Evolution of share price across all quarters.", formula: "Variable valor_acao per period, from the simulator.", usage: "Tutor: identify trends — team on the rise or in decline.", source: "db" },
      { indicator: "Net Revenue (series)", description: "Evolution of total net revenue across quarters.", formula: "Variable receitaLiquidaTotal per period.", usage: "Tutor: growth vs. stagnation.", source: "db" },
      { indicator: "Operating Margin (series)", description: "Evolution of operating margin (%) across quarters.", formula: "(resultadoOperacionalLiquido / receitaLiquidaTotal) × 100 per period.", usage: "Tutor: efficiency improvement over time.", source: "computed" },
      { indicator: "Governance (series)", description: "Evolution of corporate governance score.", formula: "Variable governancaCorporativa per period.", usage: "Tutor: sustained commitment to best practices.", source: "db" },
    ],
  },
  {
    id: "governance",
    title: "M9 — Corporate Governance",
    entries: [
      { indicator: "Governance Score", description: "Overall grade assigned by independent audit. Average of 6 components (Manual p.42-44).", formula: "Variable governancaCorporativa from the simulator.", usage: "Tutor: mandatory weight 5 in the ranking — always relevant.", source: "db" },
      { indicator: "Revolving Credit (grade)", description: "Grade for revolving credit usage. Less revolving = better grade.", formula: "Variable governancaCorporativa_creditoRotativo. Formula: Ne - ((Ne-1) × Cr / 100M).", usage: "Tutor: cash management — who is struggling financially.", source: "db" },
      { indicator: "Layoffs (grade)", description: "Grade for layoff volume. Fewer layoffs = better grade.", formula: "Variable governancaCorporativa_totalDispensa.", usage: "Tutor: social impact and media coverage.", source: "db" },
      { indicator: "Overtime (grade)", description: "Grade for overtime usage. Less overtime = better grade.", formula: "Variable governancaCorporativa_usoMaoOBraExtra.", usage: "Tutor: employee quality of life.", source: "db" },
      { indicator: "Certifications (grade)", description: "Grade for number of international ESG certifications obtained.", formula: "Variable governancaCorporativa_numeroCertificacoes.", usage: "Tutor: relationship with financial market and investors.", source: "db" },
      { indicator: "Transparency (grade)", description: "Grade for releasing financial reports to the market.", formula: "Variable governancaCorporativa_liberouRelatoriosFinanceirosHospitais.", usage: "Tutor: strategic decision — transparency vs. competitive secrecy.", source: "db" },
      { indicator: "Infection Rate (grade)", description: "Grade for ICU infection rate. Lower rate = better grade.", formula: "Variable governancaCorporativa_atratividadeParcial_taxaInfeccao.", usage: "Tutor: impact on patient safety and certifications.", source: "db" },
    ],
  },
  {
    id: "financial-risk",
    title: "M6 — Financial Risk",
    entries: [
      { indicator: "Ending Cash Balance", description: "Cash on hand at the end of the quarter.", formula: "Variable saldoFinal from the simulator.", usage: "Tutor: immediate liquidity.", source: "db" },
      { indicator: "NWC", description: "Net Working Capital — ability to meet short-term obligations.", formula: "Variable capitalCirculanteLiq from the simulator.", usage: "Tutor: negative = technical insolvency.", source: "db" },
      { indicator: "Leverage", description: "Ratio of total liabilities to equity.", formula: "Total Liabilities / Equity", usage: "Tutor: > 0.5 indicates high indebtedness (Manual: loans limited to 50% of equity).", source: "computed" },
      { indicator: "Revolving Credit", description: "Emergency credit automatically granted when cash is insufficient.", formula: "Variable creditoRotativo from the simulator.", usage: "Tutor: sign of poor financial management — higher interest than regular loans.", source: "db" },
      { indicator: "Cash Coverage (%)", description: "Ending balance as a percentage of net revenue.", formula: "(Ending Balance / Total Net Revenue) × 100", usage: "Tutor: financial safety cushion.", source: "computed" },
      { indicator: "Cash Variation", description: "Difference between ending and beginning balance for the quarter.", formula: "Ending Balance - Beginning Balance for the Quarter", usage: "Tutor: is cash growing or shrinking?", source: "computed" },
      { indicator: "Emergency Plan", description: "Activated by the simulator when the hospital is in critical financial condition.", formula: "Variable planoEmergencial from the simulator (0 or 1).", usage: "Tutor: extremely serious situation — team needs immediate intervention.", source: "db" },
      { indicator: "Risk Status", description: "Classification: Healthy, Attention, or Critical.", formula: "Critical = negative NWC or emergency plan. Attention = uses revolving credit. Healthy = otherwise.", usage: "Tutor: quick traffic light for financial health.", source: "computed" },
    ],
  },
  {
    id: "strategy",
    title: "M7 — Strategic Alignment",
    entries: [
      { indicator: "Strategic Weight", description: "Weight (1-5) assigned by the team to each of the 7 objectives. Sum = 20 (+ 5 for Governance).", formula: "Table peso_item_estrategia from the database.", usage: "Tutor: what the team declared as priority.", source: "db" },
      { indicator: "Result Value", description: "Actual result achieved on each strategic objective.", formula: "Corresponding variable (valor_acao, medicosCadastrados, etc.) from the simulator.", usage: "Tutor: what the team actually delivered.", source: "db" },
      { indicator: "Objective Ranking", description: "Team position on each objective, compared to others.", formula: "Descending sort of value across all teams (1 = best).", usage: "Tutor: where the team is excelling or falling behind.", source: "computed" },
      { indicator: "Aligned/Misaligned", description: "If the team gave high weight (≥ 2) to an objective, they need to be in the top half of the ranking.", formula: "Weight ≥ 2 and ranking in top half → Aligned. Weight ≥ 2 and ranking in bottom half → Misaligned.", usage: "Tutor: spark reflection — 'You prioritized X but rank last on it.'", source: "computed" },
      { indicator: "Alignment Score (%)", description: "Percentage of prioritized objectives that are effectively aligned.", formula: "(Aligned objectives / Total with weight > 0) × 100", usage: "Tutor: overall view of strategic coherence.", source: "computed" },
    ],
  },
  {
    id: "pricing",
    title: "M8 — Smart Pricing",
    entries: [
      { indicator: "Price ER / INP / HC", description: "Average Ticket (Average Operating Revenue) decided by the team for each service.", formula: "Variables fdreceitapa, fdreceitaint, fdreceitaaltacomplexidade from item_decisao table.", usage: "Tutor: most impactful decision — price affects demand, revenue and attractiveness.", source: "decision" },
      { indicator: "Market Average", description: "Average price charged by all teams in the competitive group.", formula: "Variables medias_{service} from the simulator.", usage: "Tutor: position the team vs. competition — above average loses demand.", source: "db" },
      { indicator: "Market Share (%)", description: "Percentage of total group visits that went to this team, by service.", formula: "Variables marketShareAtendimentos{service} from the simulator.", usage: "Tutor: direct result of pricing and attractiveness decisions.", source: "db" },
      { indicator: "Revenue by Health Plan", description: "Revenue generated by each health plan operator, summed across all 3 services.", formula: "Variables receita_servico_plano_{service}_{plan} from the simulator. Sum of 3 services.", usage: "Tutor: identify which plans are most profitable.", source: "db" },
      { indicator: "Attractiveness by Plan", description: "Hospital attractiveness score for each operator (average of 3 services).", formula: "Variables atratividadeFinal_{service}_{plan} from the simulator. Average of 3 services.", usage: "Tutor: why a team attracts more patients from a certain plan.", source: "db" },
      { indicator: "Accepted Plans", description: "Which of the 7 operators the team enabled (Yes/No). Unique requires 3+ certifications.", formula: "Variables boaSaude, goodShape, healthy, outras, particulares, tipTop, unique from item_decisao table.", usage: "Tutor: strategic decision — more plans = more demand but different mix.", source: "decision" },
    ],
  },
  {
    id: "quality",
    title: "M10 — Healthcare Quality",
    entries: [
      { indicator: "Infection Rate", description: "Partial attractiveness score based on ICU infection rate. Board target: 6. Acceptable up to 9.", formula: "Variable atratividadeParcial_taxaInfeccao from the simulator.", usage: "Tutor: > 9 triggers ANVISA warning, > 10 may trigger a fine.", source: "db" },
      { indicator: "Certifications", description: "Number of international ESG certifications obtained up to the quarter.", formula: "Variable numeroCertificacoes from the simulator.", usage: "Tutor: enables Unique (3+ certs) and improves governance.", source: "db" },
      { indicator: "ANVISA Alerts", description: "Number of warnings received from ANVISA for high infection rate.", formula: "Variable alertaAnvisa from the simulator.", usage: "Tutor: regulatory risk signal.", source: "db" },
      { indicator: "ANVISA Fines", description: "Financial value of fines imposed by ANVISA.", formula: "Variable multaAnvisa from the simulator.", usage: "Tutor: direct impact on cash flow and reputation.", source: "db" },
      { indicator: "ANVISA Inspection", description: "Whether the hospital was inspected in the quarter (0/1).", formula: "Variable fiscalizacaoAnvisa from the simulator.", usage: "Tutor: inspection with rate > 10 results in a fine.", source: "db" },
      { indicator: "Investments (Period)", description: "Amounts invested in the quarter for infection control, certification and waste disposal.", formula: "Variables fdinvestimentocontroleinfeccao, fdinvestimentocertificaointernacional, gastosEmTerceirizacaoDelixo.", usage: "Tutor: correlate investment with outcome (infection rate, certifications).", source: "db" },
      { indicator: "Investments (Accumulated)", description: "Cumulative sum of quality investments since the beginning of the game.", formula: "Variables investimentosAcumuladosCertificacao, investimentosACumuladosControleInfeccao, investimentosAcumuladosLixo.", usage: "Tutor: sustained effort vs. one-time investment.", source: "db" },
      { indicator: "Quality Status", description: "Classification: Excellent, Adequate, or Critical.", formula: "Critical = fines > 0 or alerts > 2. Excellent = certifications > 0 and no fines. Adequate = otherwise.", usage: "Tutor: healthcare quality traffic light.", source: "computed" },
    ],
  },
  {
    id: "lost-revenue",
    title: "M11 — Lost Revenue",
    entries: [
      { indicator: "Revenue Lost to Overload", description: "Estimated revenue the team failed to capture due to insufficient capacity to meet demand.", formula: "Lost Visits × (Net Revenue / Visits Completed), per service.", usage: "Tutor: 'You're losing money because you lack capacity.'", source: "computed" },
      { indicator: "Revenue Lost to Idleness", description: "Estimated revenue lost due to idle capacity (ER and HC only).", formula: "Idleness (units) × (Contribution Margin / Visits Completed), per service.", usage: "Tutor: 'You're paying for capacity you don't use.'", source: "computed" },
      { indicator: "Total Lost", description: "Sum of revenue lost from overload and idleness across all 3 services.", formula: "Sum across all services: (lost to overload + lost to idleness).", usage: "Tutor: total impact of operational inefficiency.", source: "computed" },
      { indicator: "% Revenue Not Captured", description: "Total lost as a percentage of total net revenue.", formula: "(Total Lost / Total Net Revenue) × 100", usage: "Tutor: 'X% of potential revenue is being wasted.'", source: "computed" },
      { indicator: "Dominant Type", description: "Whether the loss is primarily from Overload, Idleness, or Balanced.", formula: "Overload if overload losses > 1.5× idleness losses, and vice versa.", usage: "Tutor: directs the recommendation — increase capacity or optimize resources.", source: "computed" },
    ],
  },
  {
    id: "facilitation",
    title: "M4 — Facilitation Guide",
    entries: [
      { indicator: "Questions for the Tutor", description: "Thought-provoking questions generated by AI for the tutor to use in facilitation.", formula: "Claude AI analyzes efficiency, profitability and benchmarking data for the selected quarter.", usage: "Tutor: ready-made guide to lead the post-round discussion.", source: "ai" },
      { indicator: "Insights per Team", description: "Personalized observations about each team's performance.", formula: "AI identifies patterns, anomalies and opportunities in the data.", usage: "Tutor: approach each team with specific provocations.", source: "ai" },
    ],
  },
];

export function DataGlossaryContent({ groupId, gameCode }: Props) {
  const { locale, t } = useLocale();
  const glossary = getGlossaryData(locale);

  const sourceLabels = {
    db: t.glossarySourceDB,
    decision: t.glossarySourceDecision,
    computed: t.glossarySourceComputed,
    ai: t.glossarySourceAI,
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/game/${groupId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToDashboard}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-[#1A365D]" />
          <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.glossaryTitle}</h1>
        </div>
        <p className="mt-2 text-[#64748B]">{t.glossarySubtitle(gameCode)}</p>
      </div>

      {/* Source legend */}
      <div className="mb-8 flex flex-wrap gap-4 rounded-lg border border-[#C5A832]/30 bg-[#C5A832]/5 p-4">
        <span className="text-sm font-semibold text-[#8B7523]">{t.glossarySource}:</span>
        <span className="flex items-center gap-1.5 text-sm text-[#1E293B]">
          <Database className="h-4 w-4 text-blue-600" /> {sourceLabels.db}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-[#1E293B]">
          <ClipboardList className="h-4 w-4 text-amber-600" /> {sourceLabels.decision}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-[#1E293B]">
          <Calculator className="h-4 w-4 text-green-600" /> {sourceLabels.computed}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-[#1E293B]">
          <Brain className="h-4 w-4 text-purple-600" /> {sourceLabels.ai}
        </span>
      </div>

      <div className="space-y-8">
        {glossary.map((mod) => (
          <Card key={mod.id} className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{mod.title}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="w-[160px] font-semibold">{t.glossaryIndicator}</TableHead>
                    <TableHead className="font-semibold">{t.glossaryDescription}</TableHead>
                    <TableHead className="font-semibold">{t.glossaryFormula}</TableHead>
                    <TableHead className="font-semibold">{t.glossaryUsage}</TableHead>
                    <TableHead className="w-[60px] text-center font-semibold">{t.glossarySource}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mod.entries.map((entry, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-[#1A365D]">{entry.indicator}</TableCell>
                      <TableCell className="text-xs text-[#1E293B]">{entry.description}</TableCell>
                      <TableCell className="text-xs text-[#64748B]">{entry.formula}</TableCell>
                      <TableCell className="text-xs text-[#8B7523]">{entry.usage}</TableCell>
                      <TableCell className="text-center">
                        <span title={sourceLabel(entry.source, sourceLabels)}>
                          {sourceIcon(entry.source)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
