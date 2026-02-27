import { query } from "./db";
import type { Game, Team } from "./types";

export async function getActiveGames(): Promise<Game[]> {
  return query<Game>(
    `SELECT gi.id, gi.codigo, gi.codigo as nome, gi.ultimo_periodo_processado,
            gi.num_empresas, gi.jogo_id
     FROM grupo_industrial gi
     WHERE gi.ultimo_periodo_processado > 0
     ORDER BY gi.id DESC`
  );
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

export async function getGameDetails(groupId: number) {
  const rows = await query<Game & { jogo_nome: string }>(
    `SELECT gi.id, gi.codigo, gi.codigo as nome, gi.ultimo_periodo_processado,
            gi.num_empresas, gi.jogo_id, j.nome as jogo_nome
     FROM grupo_industrial gi
     JOIN jogo j ON gi.jogo_id = j.id
     WHERE gi.id = ?`,
    [groupId]
  );
  return rows[0] || null;
}

export async function getTeamVariables(
  groupId: number,
  period: number
): Promise<Record<string, unknown>[]> {
  return query(
    `SELECT ve.*, e.nome as team_name, e.numero as team_number
     FROM variavel_empresarial ve
     JOIN empresa e ON ve.empresa_id = e.id
     WHERE e.grupo_id = ?
       AND ve.periodo = ?
     ORDER BY e.numero`,
    [groupId, period]
  );
}

export async function getTeamDecisions(
  groupId: number,
  period: number
): Promise<Record<string, unknown>[]> {
  return query(
    `SELECT d.id as decisao_id, d.empresa_id, d.periodo,
            e.nome as team_name, e.numero as team_number,
            id2.codigo, id2.valor, id2.tipo
     FROM decisao d
     JOIN empresa e ON d.empresa_id = e.id
     JOIN item_decisao id2 ON id2.decisao_id = d.id
     WHERE e.grupo_id = ?
       AND d.periodo = ?
     ORDER BY e.numero, id2.codigo`,
    [groupId, period]
  );
}

export async function getHospitalData(
  groupId: number,
  period: number
): Promise<Record<string, unknown>[]> {
  return query(
    `SELECT h.*, e.nome as team_name, e.numero as team_number
     FROM hospital h
     JOIN empresa e ON h.empresa_id = e.id
     WHERE e.grupo_id = ?
       AND h.periodo = ?
     ORDER BY e.numero`,
    [groupId, period]
  );
}

export async function getVariableColumns(): Promise<string[]> {
  const rows = await query<{ COLUMN_NAME: string }>(
    `SELECT COLUMN_NAME
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = 'simulationdb'
       AND TABLE_NAME = 'variavel_empresarial'
     ORDER BY ORDINAL_POSITION`
  );
  return rows.map((r) => r.COLUMN_NAME);
}

export async function getHospitalColumns(): Promise<string[]> {
  const rows = await query<{ COLUMN_NAME: string }>(
    `SELECT COLUMN_NAME
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = 'simulationdb'
       AND TABLE_NAME = 'hospital'
     ORDER BY ORDINAL_POSITION`
  );
  return rows.map((r) => r.COLUMN_NAME);
}
