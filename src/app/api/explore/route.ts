import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Acesso restrito a administradores" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const groupId = searchParams.get("groupId");
  const period = searchParams.get("period");
  const action = searchParams.get("action") || "tables";

  try {
    if (action === "tables") {
      const rows = await query<{ TABLE_NAME: string }>(
        `SELECT TABLE_NAME
         FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = 'simulationdb'
         ORDER BY TABLE_NAME`
      );
      return NextResponse.json({ tables: rows.map((r) => r.TABLE_NAME) });
    }

    if (action === "columns" && table) {
      const rows = await query<{
        COLUMN_NAME: string;
        DATA_TYPE: string;
        COLUMN_TYPE: string;
      }>(
        `SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = 'simulationdb'
           AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`,
        [table]
      );
      return NextResponse.json({ table, columns: rows });
    }

    if (action === "sample" && table) {
      const sanitized = table.replace(/[^a-zA-Z0-9_]/g, "");
      const rows = await query(
        `SELECT * FROM \`${sanitized}\` LIMIT 3`
      );
      return NextResponse.json({ table, sample: rows });
    }

    if (action === "hospital-data" && groupId && period) {
      const gid = parseInt(groupId, 10);
      const p = parseInt(period, 10);
      if (isNaN(gid) || isNaN(p) || gid <= 0 || p <= 0) {
        return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
      }
      const rows = await query(
        `SELECT h.*, e.nome as team_name, e.numero as team_number
         FROM hospital h
         JOIN empresa e ON h.empresa_id = e.id
         WHERE e.grupo_id = ?
           AND h.periodo = ?
         ORDER BY e.numero`,
        [gid, p]
      );
      return NextResponse.json({ rows });
    }

    if (action === "variables" && groupId && period) {
      const gid = parseInt(groupId, 10);
      const p = parseInt(period, 10);
      if (isNaN(gid) || isNaN(p) || gid <= 0 || p <= 0) {
        return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
      }
      const rows = await query(
        `SELECT ve.*, e.nome as team_name, e.numero as team_number
         FROM variavel_empresarial ve
         JOIN empresa e ON ve.empresa_id = e.id
         WHERE e.grupo_id = ?
           AND ve.periodo = ?
         ORDER BY e.numero`,
        [gid, p]
      );
      return NextResponse.json({ rows });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Erro na consulta" },
      { status: 500 }
    );
  }
}
