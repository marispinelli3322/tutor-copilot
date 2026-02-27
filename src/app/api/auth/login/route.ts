import { NextRequest, NextResponse } from "next/server";
import {
  hashSHA256,
  signJWT,
  isAdminEmail,
  validateAdminPassword,
  COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
  const { email, senha } = await req.json();

  if (!email || !senha) {
    return NextResponse.json(
      { error: "Email e senha são obrigatórios" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  // ── Admin login (local, not in database) ─────────────────
  if (isAdminEmail(normalizedEmail)) {
    const valid = await validateAdminPassword(senha);
    if (!valid) {
      return NextResponse.json(
        { error: "Email ou senha inválidos" },
        { status: 401 }
      );
    }

    const token = await signJWT({
      userId: 0,
      nome: "Administrador",
      email: normalizedEmail,
      isAdmin: true,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  }

  // ── Professor login (database) ───────────────────────────
  const { query } = await import("@/lib/db");

  const rows = await query<{
    id: number;
    nome: string;
    email: string;
    senha_hash: string;
  }>(
    `SELECT u.id, u.nome, u.email, u.senha_hash
     FROM usuario u
     JOIN arbitro a ON a.usuario_id = u.id
     JOIN grupo_industrial gi ON a.grupo_id = gi.id
     JOIN jogo j ON gi.jogo_id = j.id
     WHERE LOWER(u.email) = ?
       AND j.nome LIKE '%ospit%'
     LIMIT 1`,
    [normalizedEmail]
  );

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Email ou senha inválidos" },
      { status: 401 }
    );
  }

  const user = rows[0];
  const inputHash = await hashSHA256(senha);

  if (inputHash !== user.senha_hash) {
    return NextResponse.json(
      { error: "Email ou senha inválidos" },
      { status: 401 }
    );
  }

  const token = await signJWT({
    userId: user.id,
    nome: user.nome,
    email: user.email,
    isAdmin: false,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
