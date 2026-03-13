"use client";

import { useState, useEffect } from "react";
import type { SquadMessage } from "@/lib/squad/types";

interface ChatMessageProps {
  message: SquadMessage;
  isStreaming?: boolean;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^-{3,}$/gm, '<hr class="my-3 border-gray-200">')
    .replace(/^\*{3,}$/gm, '<hr class="my-3 border-gray-200">')
    .replace(/^### (.+)$/gm, '<div class="font-semibold text-sm text-gray-800 mt-3 mb-1">$1</div>')
    .replace(/^## (.+)$/gm, '<div class="font-bold text-base text-gray-900 mt-4 mb-2">$1</div>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g, (_match, header, body) => {
      const headers = header.split("|").filter(Boolean).map((h: string) => `<th class="px-2 py-1 text-left text-xs font-medium text-gray-600 border-b">${h.trim()}</th>`).join("");
      const rows = body.trim().split("\n").map((row: string) => {
        const cells = row.split("|").filter(Boolean).map((c: string) => `<td class="px-2 py-1 text-xs text-gray-800 border-b border-gray-100">${c.trim()}</td>`).join("");
        return `<tr>${cells}</tr>`;
      }).join("");
      return `<table class="w-full border-collapse my-2 text-sm"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    })
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-sm list-decimal">$1</li>')
    .replace(/^[•\-] (.+)$/gm, '<li class="ml-4 text-sm">$1</li>')
    .replace(/((?:<li class="ml-4 text-sm list-decimal">.*?<\/li>\n?)+)/g, '<ol class="list-decimal my-1 pl-2">$1</ol>')
    .replace(/((?:<li class="ml-4 text-sm">.*?<\/li>\n?)+)/g, '<ul class="list-disc my-1">$1</ul>')
    .replace(/\n/g, "<br>")
    .replace(/(<\/div>)<br>/g, "$1")
    .replace(/(<hr[^>]*>)<br>/g, "$1")
    .replace(/(<\/table>)<br>/g, "$1")
    .replace(/(<\/ul>)<br>/g, "$1")
    .replace(/(<\/ol>)<br>/g, "$1");
}

const THINKING_PHASES = [
  "Reunindo o Simulation Squad...",
  "Dr. Mendonça consultando dados...",
  "Helena analisando o caixa...",
  "Carlos verificando capacidade...",
  "André cruzando o ranking...",
  "Montando a análise comparativa...",
];

function TypingIndicator() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % THINKING_PHASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[#C5A832] animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-1.5 h-1.5 rounded-full bg-[#C5A832] animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-1.5 h-1.5 rounded-full bg-[#C5A832] animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-xs text-gray-400 italic animate-pulse">
        {THINKING_PHASES[phase]}
      </span>
    </div>
  );
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isEmpty = !message.content || message.content.trim().length === 0;
  const showTyping = isStreaming && isEmpty;

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`${isUser ? "max-w-[80%] order-first" : "w-full"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-[#1A365D] text-white rounded-br-md"
              : "bg-white text-gray-800 rounded-bl-md"
          }`}
        >
          {showTyping ? (
            <TypingIndicator />
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: isUser ? message.content : renderMarkdown(message.content),
              }}
            />
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1A365D] flex items-center justify-center text-white text-xs font-bold">
          P
        </div>
      )}
    </div>
  );
}
