import type { SquadMessage } from "./types";

const STORAGE_KEY = "squad_conversations";

interface SquadDay {
  date: string;
  messages: SquadMessage[];
  updatedAt: number;
}

function getStorageData(): Record<string, SquadDay> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStorageData(data: Record<string, SquadDay>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

export function getTodayKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export function getTodayMessages(groupId: string): SquadMessage[] {
  const data = getStorageData();
  const key = `${groupId}_${getTodayKey()}`;
  return data[key]?.messages || [];
}

export function saveMessages(groupId: string, date: string, messages: SquadMessage[]) {
  const data = getStorageData();
  const key = `${groupId}_${date}`;
  data[key] = { date, messages, updatedAt: Date.now() };
  saveStorageData(data);
}

export function getConversationDates(groupId: string): string[] {
  const data = getStorageData();
  const prefix = `${groupId}_`;
  return Object.keys(data)
    .filter((k) => k.startsWith(prefix) && data[k].messages.length > 0)
    .map((k) => k.slice(prefix.length))
    .sort((a, b) => b.localeCompare(a));
}

export function getMessagesForDate(groupId: string, date: string): SquadMessage[] {
  const data = getStorageData();
  return data[`${groupId}_${date}`]?.messages || [];
}

export function formatDateLabel(dateStr: string): string {
  const today = getTodayKey();
  if (dateStr === today) return "Hoje";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  if (dateStr === yesterdayStr) return "Ontem";

  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
  });
}
