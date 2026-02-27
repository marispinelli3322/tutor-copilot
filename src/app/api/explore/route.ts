import { NextResponse } from "next/server";
import { query, getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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
      const rows = await query(
        `SELECT * FROM \`${table.replace(/[^a-zA-Z0-9_]/g, "")}\` LIMIT 3`
      );
      return NextResponse.json({ table, sample: rows });
    }

    if (action === "hospital-data" && groupId && period) {
      const rows = await query(
        `SELECT h.*, e.nome as team_name, e.numero as team_number
         FROM hospital h
         JOIN empresa e ON h.empresa_id = e.id
         WHERE e.grupo_id = ?
           AND h.periodo = ?
         ORDER BY e.numero`,
        [groupId, period]
      );
      return NextResponse.json({ rows });
    }

    if (action === "variables" && groupId && period) {
      const rows = await query(
        `SELECT ve.*, e.nome as team_name, e.numero as team_number
         FROM variavel_empresarial ve
         JOIN empresa e ON ve.empresa_id = e.id
         WHERE e.grupo_id = ?
           AND ve.periodo = ?
         ORDER BY e.numero`,
        [groupId, period]
      );
      return NextResponse.json({ rows });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro na consulta",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
