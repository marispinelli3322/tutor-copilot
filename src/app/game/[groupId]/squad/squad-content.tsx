"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, RotateCcw, Play, Users, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatWindow } from "@/components/squad/chat-window";
import { ChatInput } from "@/components/squad/chat-input";
import type { SquadMessage } from "@/lib/squad/types";
import {
  getMessagesForPeriod,
  saveMessages,
  getPeriodsWithConversations,
  clearPeriodConversation,
  clearAllConversations,
} from "@/lib/squad/storage";
import Link from "next/link";

const SQUAD_MEMBERS = [
  { icon: "🏛️", name: "Dr. Mendonça", role: "Árbitro-Geral", expertise: "Comparativo entre equipes, regras do jogo, histórico" },
  { icon: "💰", name: "Helena Bastos", role: "Diretora Financeira", expertise: "Caixa, EBITDA, margem, empréstimos, CCL" },
  { icon: "🏥", name: "Carlos Drummond", role: "Diretor de Operações", expertise: "Leitos, UTI, PA, utilização, demanda perdida" },
  { icon: "👥", name: "Patrícia Souza", role: "Diretora de RH", expertise: "Colaboradores, horas extras, salários, PLR" },
  { icon: "📊", name: "Rodrigo Martins", role: "Head de Pricing", expertise: "Ticket médio, operadoras, glosas, market share" },
  { icon: "⚕️", name: "Dra. Fernanda Castro", role: "Diretora de Qualidade", expertise: "Infecção, certificações, ANVISA, governança" },
  { icon: "🎯", name: "André Vasconcelos", role: "Estrategista-Chefe", expertise: "Ranking, valor da ação, pesos, alinhamento" },
  { icon: "📢", name: "Juliana Reis", role: "Diretora Comercial", expertise: "Imagem, médicos, operadoras, convênios" },
];

const ANALYSIS_PROMPT =
  "Abram a sessão de análise. Dr. Mendonça, comece com a visão geral comparativa: ranking, quem lidera, quem está caindo, alertas principais. André, complemente com o alinhamento estratégico. Depois o time analisa os pontos mais relevantes do trimestre.";

const SUGGESTED_PROMPTS = [
  "Como está o ranking e quem lidera?",
  "Alguma equipe em risco financeiro?",
  "Quem está perdendo mais receita e por quê?",
  "Compare a estratégia de preços das equipes",
];

interface Props {
  groupId: string;
  gameCode: string;
  lastPeriod: number;
  professor: string | null;
  teamCount: number;
}

export function SquadContent({ groupId, gameCode, lastPeriod, professor, teamCount }: Props) {
  const [activePeriod, setActivePeriod] = useState<number | null>(null);
  const [messages, setMessages] = useState<SquadMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [showSquadInfo, setShowSquadInfo] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Available periods: 1 to lastPeriod
  const periods = Array.from({ length: lastPeriod }, (_, i) => i + 1);

  // Periods that have saved conversations
  const [savedPeriods, setSavedPeriods] = useState<number[]>([]);

  useEffect(() => {
    setSavedPeriods(getPeriodsWithConversations(groupId));
    setInitialized(true);
  }, [groupId]);

  // Save messages when they change
  useEffect(() => {
    if (!initialized || activePeriod === null) return;
    const validMessages = messages.filter((m) => m.content.length > 0);
    if (validMessages.length > 0) {
      saveMessages(groupId, activePeriod, validMessages);
      setSavedPeriods(getPeriodsWithConversations(groupId));
    }
  }, [messages, activePeriod, initialized, groupId]);

  function selectPeriod(p: number) {
    const saved = getMessagesForPeriod(groupId, p);
    setActivePeriod(p);
    setMessages(saved.filter((m) => m.content.length > 0));
  }

  function backToSelector() {
    setActivePeriod(null);
    setMessages([]);
    setSavedPeriods(getPeriodsWithConversations(groupId));
  }

  async function streamFromApi(
    content: string,
    currentMessages: SquadMessage[],
    hideUserMessage: boolean
  ) {
    if (activePeriod === null) return;

    const assistantMessageId = `msg-${Date.now() + 1}`;
    const assistantMessage: SquadMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    let newMessages: SquadMessage[];
    if (hideUserMessage) {
      newMessages = [...currentMessages, assistantMessage];
    } else {
      const userMessage: SquadMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: Date.now(),
      };
      newMessages = [...currentMessages, userMessage, assistantMessage];
    }

    setMessages(newMessages);
    setIsStreaming(true);
    setStreamingMessageId(assistantMessageId);

    try {
      const apiMessages = [
        ...currentMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content },
      ];

      const response = await fetch("/api/squad/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          groupId: parseInt(groupId, 10),
          period: activePeriod,
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        const errMsg = errBody?.error || errBody?.message || `Erro ${response.status}`;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, content: `Erro: ${errMsg}` } : m
          )
        );
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, content: "Erro: sem resposta do servidor." } : m
          )
        );
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: m.content + parsed.text }
                    : m
                )
              );
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch (err) {
      console.error("Squad chat error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: "Erro de conexão. Tente novamente." }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      setStreamingMessageId(null);
    }
  }

  function runAnalysis() {
    setMessages([]);
    streamFromApi(ANALYSIS_PROMPT, [], true);
  }

  const handleSendMessage = useCallback(
    (content: string) => {
      if (isStreaming || activePeriod === null) return;
      streamFromApi(content, messages, false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages, isStreaming, activePeriod]
  );

  // ── Period selector view ──────────────────────────────────
  if (activePeriod === null) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href={`/game/${groupId}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao dashboard
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏥</span>
            <div>
              <h1 className="text-xl font-bold text-[#1A365D]">Simulation Squad</h1>
              <p className="text-sm text-gray-500">
                {gameCode} — {teamCount} equipes{professor ? ` — Prof. ${professor}` : ""}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6 mt-4">
            Selecione o trimestre para iniciar ou continuar a análise com o Squad.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {periods.map((p) => {
              const hasSaved = savedPeriods.includes(p);
              const isLatest = p === lastPeriod;
              return (
                <button
                  key={p}
                  onClick={() => selectPeriod(p)}
                  className={`relative text-left rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                    isLatest
                      ? "border-[#C5A832] bg-[#C5A832]/5 hover:bg-[#C5A832]/10"
                      : "border-gray-200 hover:border-[#1A365D]/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${isLatest ? "text-[#1A365D]" : "text-gray-700"}`}>
                      Trimestre {p}
                    </span>
                    {isLatest && (
                      <span className="text-[10px] font-medium uppercase tracking-wide bg-[#C5A832] text-white px-2 py-0.5 rounded-full">
                        Atual
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {hasSaved ? "Conversa salva" : "Sem análise ainda"}
                  </p>
                  {hasSaved && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Limpar conversa do Trimestre ${p}?`)) {
                          clearPeriodConversation(groupId, p);
                          setSavedPeriods(getPeriodsWithConversations(groupId));
                        }
                      }}
                      className="absolute top-3 right-3 p-1 text-gray-300 hover:text-red-400 transition-colors"
                      title="Limpar conversa deste trimestre"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </button>
              );
            })}
          </div>

          {savedPeriods.length > 1 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  if (confirm("Limpar TODAS as conversas deste jogo?")) {
                    clearAllConversations(groupId);
                    setSavedPeriods([]);
                  }
                }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Limpar todas as conversas
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ── Chat view (period selected) ───────────────────────────
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <button
        onClick={backToSelector}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar aos trimestres
      </button>

      <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
          <span className="text-xl">🏥</span>
          <div>
            <div className="font-semibold text-sm text-[#1A365D]">Simulation Squad</div>
            <div className="text-xs text-gray-500">
              {gameCode} — Trimestre {activePeriod} — {teamCount} equipes{professor ? ` — Prof. ${professor}` : ""}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {!isStreaming && messages.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={runAnalysis}
                  className="text-xs text-gray-400 hover:text-[#C5A832] gap-1 h-8"
                  title="Refazer análise"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Refazer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Limpar conversa do Trimestre ${activePeriod}?`)) {
                      clearPeriodConversation(groupId, activePeriod);
                      setMessages([]);
                      setSavedPeriods(getPeriodsWithConversations(groupId));
                    }
                  }}
                  className="text-xs text-gray-400 hover:text-red-500 gap-1 h-8"
                  title="Limpar conversa"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Limpar
                </Button>
              </>
            )}
            <button
              onClick={() => setShowSquadInfo(!showSquadInfo)}
              className={`p-2 rounded-lg transition-colors ${
                showSquadInfo ? "bg-gray-100 text-[#C5A832]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
              title="Conheça o Squad"
            >
              <Users className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isStreaming ? "bg-yellow-400" : "bg-green-400"} animate-pulse`} />
              <span className="text-xs text-gray-400">{isStreaming ? "Analisando..." : "Online"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Squad info sidebar */}
          {showSquadInfo && (
            <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-gray-400 uppercase">O Squad</div>
                <button onClick={() => setShowSquadInfo(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {SQUAD_MEMBERS.map((m) => (
                <div key={m.name} className="bg-white rounded-lg p-2.5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{m.icon}</span>
                    <div>
                      <div className="text-xs font-semibold text-[#1A365D]">{m.name}</div>
                      <div className="text-[10px] text-[#8B7523]">{m.role}</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">{m.expertise}</p>
                </div>
              ))}
            </div>
          )}

          {/* Main chat area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Empty state */}
            {messages.length === 0 && !isStreaming && (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <p className="text-sm text-gray-500 mb-8 max-w-sm">
                  O Squad está pronto para analisar o Trimestre {activePeriod}.
                </p>
                <Button
                  onClick={runAnalysis}
                  size="lg"
                  className="bg-[#1A365D] hover:bg-[#234681] text-white gap-2 px-8 py-3 text-base rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <Play className="h-5 w-5" />
                  Iniciar Análise — T{activePeriod}
                </Button>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => streamFromApi(prompt, [], false)}
                      className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-[#C5A832] hover:text-[#8B7523] transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {(messages.length > 0 || isStreaming) && (
              <ChatWindow messages={messages} streamingMessageId={streamingMessageId} />
            )}

            {/* Input */}
            {(messages.length > 0 || isStreaming) && (
              <ChatInput
                onSend={handleSendMessage}
                isStreaming={isStreaming}
                suggestedPrompts={SUGGESTED_PROMPTS}
                showSuggestions={!isStreaming && messages.length > 0 && messages.length <= 2}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
