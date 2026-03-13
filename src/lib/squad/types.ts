export interface SquadMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}
