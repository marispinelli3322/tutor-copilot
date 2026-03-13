"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { SquadMessage } from "@/lib/squad/types";
import { ChatMessage } from "./chat-message";

interface ChatWindowProps {
  messages: SquadMessage[];
  streamingMessageId: string | null;
}

export function ChatWindow({ messages, streamingMessageId }: ChatWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setUserScrolledUp(distanceFromBottom > 150);
  }, []);

  useEffect(() => {
    if (!userScrolledUp) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, messages[messages.length - 1]?.content, userScrolledUp]);

  const msgCount = messages.length;
  useEffect(() => {
    setUserScrolledUp(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Envie uma mensagem para começar
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
    >
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          isStreaming={msg.id === streamingMessageId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
