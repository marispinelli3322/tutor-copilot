"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  suggestedPrompts?: string[];
  showSuggestions?: boolean;
}

export function ChatInput({ onSend, isStreaming, suggestedPrompts = [], showSuggestions = false }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {showSuggestions && suggestedPrompts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSend(prompt)}
              disabled={isStreaming}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-[#C5A832] hover:text-[#8B7523] transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Pergunte algo ao Simulation Squad..."
          disabled={isStreaming}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A832]/30 focus:border-[#C5A832] disabled:opacity-50 disabled:bg-gray-50"
        />
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isStreaming}
          size="sm"
          className="bg-[#1A365D] hover:bg-[#234681] text-white rounded-xl h-10 w-10 p-0 flex items-center justify-center"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
