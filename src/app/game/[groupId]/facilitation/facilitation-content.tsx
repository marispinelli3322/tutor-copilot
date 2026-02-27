"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Copy, Check, Loader2 } from "lucide-react";

interface FacilitationContentProps {
  groupId: number;
  period: number;
}

function renderMarkdown(text: string) {
  // Simple markdown renderer for the facilitation content
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headers
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={key++}
          className="mb-3 mt-8 border-b border-[#C5A832]/30 pb-2 text-xl font-bold text-[#1A365D] first:mt-0"
        >
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="mb-2 mt-6 text-lg font-semibold text-[#1A365D]">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={key++}
          className="mb-4 mt-6 text-2xl font-bold text-[#1A365D] first:mt-0"
        >
          {line.slice(2)}
        </h1>
      );
    }
    // Numbered items
    else if (/^\d+\.\s\*\*/.test(line)) {
      const content = line
        .replace(/^\d+\.\s/, "")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      elements.push(
        <div
          key={key++}
          className="mb-3 rounded-lg border-l-4 border-[#C5A832] bg-[#C5A832]/5 p-3"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    // Bullet points
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      const content = line
        .slice(2)
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      elements.push(
        <div key={key++} className="mb-2 flex gap-2 pl-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C5A832]" />
          <span
            className="text-[#1E293B]"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      );
    }
    // Bold lines (standalone)
    else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={key++} className="mb-2 mt-4 font-semibold text-[#1A365D]">
          {line.slice(2, -2)}
        </p>
      );
    }
    // Regular paragraph
    else if (line.trim()) {
      const content = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      elements.push(
        <p
          key={key++}
          className="mb-2 text-[#1E293B]"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    // Empty line = spacer
    else {
      elements.push(<div key={key++} className="h-2" />);
    }
  }

  return elements;
}

export function FacilitationContent({
  groupId,
  period,
}: FacilitationContentProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setContent(null);

    try {
      const res = await fetch(
        `/api/facilitation?groupId=${groupId}&period=${period}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao gerar guia");
        return;
      }

      setContent(data.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, [groupId, period]);

  // Auto-generate on mount
  useEffect(() => {
    generate();
  }, [generate]);

  const copyToClipboard = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Loading state */}
      {loading && (
        <Card className="border-[#C5A832]/30 bg-[#C5A832]/5">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1A365D]/10">
              <Loader2 className="h-8 w-8 animate-spin text-[#C5A832]" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[#1A365D]">
              Gerando Guia de Facilitação
            </h2>
            <p className="max-w-md text-sm text-[#64748B]">
              O Claude está analisando os dados de eficiência, lucratividade e
              benchmarking para gerar perguntas e insights personalizados...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="mb-4 text-sm text-red-700">
              <strong>Erro:</strong> {error}
            </p>
            <Button
              onClick={generate}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {content && !loading && (
        <div>
          {/* Actions bar */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Sparkles className="h-3.5 w-3.5 text-[#C5A832]" />
              Gerado por Claude AI
            </div>
            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copiar texto
                  </>
                )}
              </Button>
              <Button
                onClick={generate}
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerar
              </Button>
            </div>
          </div>

          {/* Rendered markdown */}
          <Card className="overflow-hidden">
            <CardContent className="prose-sm p-6 sm:p-8">
              {renderMarkdown(content)}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
