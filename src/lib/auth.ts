import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// ── Types ────────────────────────────────────────────────────

export interface Session {
  userId: number;
  nome: string;
  email: string;
  isAdmin: boolean;
}

// ── Constants ────────────────────────────────────────────────

const COOKIE_NAME = "tutor-session";
const JWT_EXPIRY = "7d";

const ADMIN_EMAIL = "admin@simulation.com.br";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? "";

// ── SHA-256 ──────────────────────────────────────────────────

export async function hashSHA256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── JWT ──────────────────────────────────────────────────────

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return new TextEncoder().encode(secret);
}

export async function signJWT(payload: Session): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret());
}

export async function verifyJWT(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

// ── Cookie helpers ───────────────────────────────────────────

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token);
}

// ── Admin check ──────────────────────────────────────────────

export function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL;
}

export async function validateAdminPassword(senha: string): Promise<boolean> {
  const hash = await hashSHA256(senha);
  return hash === ADMIN_PASSWORD_HASH;
}

export { COOKIE_NAME, ADMIN_EMAIL };
