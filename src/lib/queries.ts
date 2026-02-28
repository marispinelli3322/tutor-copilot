import { query } from "./db";
import type { Game, Team } from "./types";

// ── Games ───────────────────────────────────────────────────

export interface GameWithProfessors extends Game {
  jogo_nome: string;
  professors: string[];
}

export async function getHospitalGames(userId?: number): Promise<GameWithProfessors[]> {
  const params: unknown[] = [];
  let userFilter = "";

  if (userId !== undefined) {
    userFilter = `AND gi.id IN (
      SELECT a2.grupo_id FROM arbitro a2 WHERE a2.usuario_id = ?
    )`;
    params.push(userId);
  }

  const rows = await query<Game & { jogo_nome: string; professor: string | null }>(
    `SELECT gi.id, gi.codigo, gi.codigo as nome, gi.ultimo_periodo_processado,
            gi.num_empresas, gi.jogo_id, j.nome as jogo_nome,
            u.nome as professor
     FROM grupo_industrial gi
     JOIN jogo j ON gi.jogo_id = j.id
     LEFT JOIN arbitro a ON a.grupo_id = gi.id
     LEFT JOIN usuario u ON a.usuario_id = u.id
     WHERE gi.ultimo_periodo_processado > 0
       AND j.nome LIKE '%ospit%'
       ${userFilter}
     ORDER BY gi.id DESC`,
    params
  );

  // Deduplicate: group professors per game
  const map = new Map<number, GameWithProfessors>();
  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        codigo: row.codigo,
        nome: row.nome,
        ultimo_periodo_processado: row.ultimo_periodo_processado,
        num_empresas: row.num_empresas,
        jogo_id: row.jogo_id,
        jogo_nome: row.jogo_nome,
        professors: [],
      });
    }
    if (row.professor && !map.get(row.id)!.professors.includes(row.professor)) {
      map.get(row.id)!.professors.push(row.professor);
    }
  }
  return Array.from(map.values());
}

export async function getGameDetails(groupId: number) {
  const rows = await query<Game & { jogo_nome: string; professor: string | null }>(
    `SELECT gi.id, gi.codigo, gi.codigo as nome, gi.ultimo_periodo_processado,
            gi.num_empresas, gi.jogo_id, j.nome as jogo_nome,
            GROUP_CONCAT(DISTINCT u.nome SEPARATOR ', ') as professor
     FROM grupo_industrial gi
     JOIN jogo j ON gi.jogo_id = j.id
     LEFT JOIN arbitro a ON a.grupo_id = gi.id
     LEFT JOIN usuario u ON a.usuario_id = u.id
     WHERE gi.id = ?
     GROUP BY gi.id`,
    [groupId]
  );
  if (!rows[0]) return null;
  return {
    ...rows[0],
    professor: rows[0].professor || null,
  };
}

export async function getGameTeams(groupId: number): Promise<Team[]> {
  return query<Team>(
    `SELECT e.id, e.nome, e.numero, e.grupo_id
     FROM empresa e
     WHERE e.grupo_id = ?
     ORDER BY e.numero`,
    [groupId]
  );
}

// ── EAV Data Access ─────────────────────────────────────────
// variavel_empresarial is an EAV table: (empresa_id, periodo, codigo, valor)
// We pivot specific codes into a record per team

interface RawVariable {
  empresa_id: number;
  team_name: string;
  team_number: number;
  codigo: string;
  valor: number;
}

/**
 * Fetch specific variable codes for all teams in a group/period.
 * Returns a map: teamNumber -> { codigo: valor, ... }
 */
export async function getTeamVariablesPivot(
  groupId: number,
  period: number,
  codes: string[]
): Promise<Record<number, Record<string, number> & { team_name: string; team_number: number }>> {
  if (codes.length === 0) return {};

  const placeholders = codes.map(() => "?").join(",");
  const rows = await query<RawVariable>(
    `SELECT ve.empresa_id, e.nome as team_name, e.numero as team_number,
            ve.codigo, ve.valor
     FROM variavel_empresarial ve
     JOIN empresa e ON ve.empresa_id = e.id
     WHERE e.grupo_id = ?
       AND ve.periodo = ?
       AND ve.codigo IN (${placeholders})
     ORDER BY e.numero, ve.codigo`,
    [groupId, period, ...codes]
  );

  const result: Record<number, Record<string, number> & { team_name: string; team_number: number }> = {};
  for (const row of rows) {
    if (!result[row.team_number]) {
      result[row.team_number] = {
        team_name: row.team_name,
        team_number: row.team_number,
      } as Record<string, number> & { team_name: string; team_number: number };
    }
    (result[row.team_number] as Record<string, unknown>)[row.codigo] = Number(row.valor);
  }
  return result;
}

// ── Variable code groups ────────────────────────────────────

export const EFFICIENCY_CODES = [
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

export const PROFITABILITY_CODES = [
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

export const BENCHMARKING_CODES = [
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

export const TIMESERIES_CODES = [
  "valor_acao",
  "receitaLiquidaTotal",
  "resultadoOperacionalLiquido",
  "governancaCorporativa",
] as const;

export const FINANCIAL_RISK_CODES = [
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

export const STRATEGY_RESULT_CODES = [
  "valor_acao",
  "medicosCadastrados",
  "receitaLiquidaTotal",
  "resultadoOperacionalLiquidoAcumulado",
  "capitalCirculanteLiq",
  "vidasAtendidas",
  "governancaCorporativa",
] as const;

export const GOVERNANCE_CODES = [
  "governancaCorporativa",
  "governancaCorporativa_creditoRotativo",
  "governancaCorporativa_totalDispensa",
  "governancaCorporativa_usoMaoOBraExtra",
  "governancaCorporativa_numeroCertificacoes",
  "governancaCorporativa_liberouRelatoriosFinanceirosHospitais",
  "governancaCorporativa_atratividadeParcial_taxaInfeccao",
] as const;

// ── M8: Pricing codes ────────────────────────────────────────

export const PRICING_DECISION_CODES = [
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

export const PRICING_RESULT_CODES = [
  "marketShareAtendimentosprontoAtendimento",
  "marketShareAtendimentosinternacao",
  "marketShareAtendimentosaltaComplexidade",
  "medias_prontoAtendimento",
  "medias_internacao",
  "medias_altaComplexidade",
  // Revenue by service×plan
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
  // Attractiveness by service×plan
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

// ── M10: Quality codes ──────────────────────────────────────

export const QUALITY_CODES = [
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

// ── M11: Lost Revenue codes ─────────────────────────────────

export const LOST_REVENUE_CODES = [
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

// ── Team Decisions (item_decisao) ───────────────────────────

interface RawDecision {
  team_number: number;
  team_name: string;
  codigo: string;
  valor: number;
}

/**
 * Fetch decision codes from item_decisao for all teams in a group/period.
 * Returns a map: teamNumber -> { codigo: valor, ... }
 */
export async function getTeamDecisions(
  groupId: number,
  period: number,
  codes: string[]
): Promise<Record<number, Record<string, number> & { team_name: string; team_number: number }>> {
  if (codes.length === 0) return {};

  const placeholders = codes.map(() => "?").join(",");
  const rows = await query<RawDecision>(
    `SELECT e.numero as team_number, e.nome as team_name, id.codigo, id.valor
     FROM item_decisao id
     JOIN decisao d ON id.decisao_id = d.id
     JOIN empresa e ON d.empresa_id = e.id
     WHERE e.grupo_id = ?
       AND id.periodo = ?
       AND id.codigo IN (${placeholders})
     ORDER BY e.numero, id.codigo`,
    [groupId, period, ...codes]
  );

  const result: Record<number, Record<string, number> & { team_name: string; team_number: number }> = {};
  for (const row of rows) {
    if (!result[row.team_number]) {
      result[row.team_number] = {
        team_name: row.team_name,
        team_number: row.team_number,
      } as Record<string, number> & { team_name: string; team_number: number };
    }
    (result[row.team_number] as Record<string, unknown>)[row.codigo] = Number(row.valor);
  }
  return result;
}

// ── Strategy Weights ────────────────────────────────────────

interface RawStrategyWeight {
  empresa_id: number;
  team_name: string;
  team_number: number;
  item_estrategia_id: number;
  item_name: string;
  variable_code: string | null;
  peso: number;
}

/**
 * Fetch strategy weights for all teams in a group.
 * Joins peso_item_estrategia → item_estrategia → empresa.
 */
export async function getStrategyWeights(
  groupId: number
): Promise<Record<number, { team_name: string; team_number: number; weights: Record<number, { item_name: string; variable_code: string | null; peso: number }> }>> {
  const rows = await query<RawStrategyWeight>(
    `SELECT es.empresa_id, e.nome as team_name, e.numero as team_number,
            pe.item_estrategia_id, ie.nome as item_name, ie.codigo as variable_code,
            pe.peso
     FROM peso_item_estrategia pe
     JOIN estrategia es ON pe.estrategia_id = es.id
     JOIN empresa e ON es.empresa_id = e.id
     JOIN item_estrategia ie ON pe.item_estrategia_id = ie.id
     WHERE e.grupo_id = ?
     ORDER BY e.numero, pe.item_estrategia_id`,
    [groupId]
  );

  const result: Record<number, { team_name: string; team_number: number; weights: Record<number, { item_name: string; variable_code: string | null; peso: number }> }> = {};
  for (const row of rows) {
    if (!result[row.team_number]) {
      result[row.team_number] = {
        team_name: row.team_name,
        team_number: row.team_number,
        weights: {},
      };
    }
    result[row.team_number].weights[row.item_estrategia_id] = {
      item_name: row.item_name,
      variable_code: row.variable_code,
      peso: Number(row.peso),
    };
  }
  return result;
}

/**
 * Fetch timeseries data: specific codes for ALL periods (1..maxPeriod).
 * Returns a map: period -> teamNumber -> { codigo: valor, ... }
 */
export async function getTimeseriesAllPeriods(
  groupId: number,
  maxPeriod: number,
  codes: string[]
): Promise<Record<number, Record<number, Record<string, number> & { team_name: string; team_number: number }>>> {
  if (codes.length === 0 || maxPeriod < 1) return {};

  const placeholders = codes.map(() => "?").join(",");
  const periodPlaceholders = Array.from({ length: maxPeriod }, () => "?").join(",");
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  const rows = await query<RawVariable & { periodo: number }>(
    `SELECT ve.empresa_id, e.nome as team_name, e.numero as team_number,
            ve.codigo, ve.valor, ve.periodo
     FROM variavel_empresarial ve
     JOIN empresa e ON ve.empresa_id = e.id
     WHERE e.grupo_id = ?
       AND ve.periodo IN (${periodPlaceholders})
       AND ve.codigo IN (${placeholders})
     ORDER BY ve.periodo, e.numero, ve.codigo`,
    [groupId, ...periods, ...codes]
  );

  const result: Record<number, Record<number, Record<string, number> & { team_name: string; team_number: number }>> = {};
  for (const row of rows) {
    if (!result[row.periodo]) result[row.periodo] = {};
    if (!result[row.periodo][row.team_number]) {
      result[row.periodo][row.team_number] = {
        team_name: row.team_name,
        team_number: row.team_number,
      } as Record<string, number> & { team_name: string; team_number: number };
    }
    (result[row.periodo][row.team_number] as Record<string, unknown>)[row.codigo] = Number(row.valor);
  }
  return result;
}
