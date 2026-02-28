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

export const GOVERNANCE_CODES = [
  "governancaCorporativa",
  "governancaCorporativa_creditoRotativo",
  "governancaCorporativa_totalDispensa",
  "governancaCorporativa_usoMaoOBraExtra",
  "governancaCorporativa_numeroCertificacoes",
  "governancaCorporativa_liberouRelatoriosFinanceirosHospitais",
  "governancaCorporativa_atratividadeParcial_taxaInfeccao",
] as const;

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
