import type { SquadMessage } from "./types";

const STORAGE_KEY = "squad_conversations_v2";

interface SquadPeriod {
  period: number;
  messages: SquadMessage[];
  updatedAt: number;
}

function storageKey(groupId: string, period: number): string {
  return `${groupId}_T${period}`;
}

function getStorageData(): Record<string, SquadPeriod> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStorageData(data: Record<string, SquadPeriod>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

export function getMessagesForPeriod(groupId: string, period: number): SquadMessage[] {
  const data = getStorageData();
  return data[storageKey(groupId, period)]?.messages || [];
}

export function saveMessages(groupId: string, period: number, messages: SquadMessage[]) {
  const data = getStorageData();
  const key = storageKey(groupId, period);
  data[key] = { period, messages, updatedAt: Date.now() };
  saveStorageData(data);
}

export function getPeriodsWithConversations(groupId: string): number[] {
  const data = getStorageData();
  const prefix = `${groupId}_T`;
  return Object.keys(data)
    .filter((k) => k.startsWith(prefix) && data[k].messages.length > 0)
    .map((k) => parseInt(k.slice(prefix.length), 10))
    .sort((a, b) => b - a); // newest first
}

export function clearPeriodConversation(groupId: string, period: number) {
  const data = getStorageData();
  delete data[storageKey(groupId, period)];
  saveStorageData(data);
}

export function clearAllConversations(groupId: string) {
  const data = getStorageData();
  const prefix = `${groupId}_T`;
  for (const key of Object.keys(data)) {
    if (key.startsWith(prefix)) delete data[key];
  }
  saveStorageData(data);
}
