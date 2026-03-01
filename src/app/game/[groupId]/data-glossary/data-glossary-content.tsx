"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Database, Brain, Calculator, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/lib/use-locale";
import { getGlossaryData, type GlossaryEntry } from "@/lib/glossary-data";

interface Props {
  groupId: string;
  gameCode: string;
}

function sourceIcon(source: GlossaryEntry["source"]) {
  switch (source) {
    case "db":
      return <Database className="inline h-3.5 w-3.5 text-blue-600" />;
    case "decision":
      return <ClipboardList className="inline h-3.5 w-3.5 text-amber-600" />;
    case "computed":
      return <Calculator className="inline h-3.5 w-3.5 text-green-600" />;
    case "ai":
      return <Brain className="inline h-3.5 w-3.5 text-purple-600" />;
  }
}

function sourceLabel(source: GlossaryEntry["source"], labels: Record<string, string>) {
  switch (source) {
    case "db": return labels.db;
    case "decision": return labels.decision;
    case "computed": return labels.computed;
    case "ai": return labels.ai;
  }
}

export function DataGlossaryContent({ groupId, gameCode }: Props) {
  const { locale, t } = useLocale();
  const glossary = getGlossaryData(locale);

  const sourceLabels = {
    db: t.glossarySourceDB,
    decision: t.glossarySourceDecision,
    computed: t.glossarySourceComputed,
    ai: t.glossarySourceAI,
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/game/${groupId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A365D]">
        <ArrowLeft className="h-4 w-4" />{t.backToDashboard}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-[#1A365D]" />
          <h1 className="text-3xl font-bold tracking-tight text-[#1A365D]">{t.glossaryTitle}</h1>
        </div>
        <p className="mt-2 text-[#64748B]">{t.glossarySubtitle(gameCode)}</p>
      </div>

      {/* Source legend */}
      <div className="mb-8 flex flex-wrap gap-4 rounded-lg border border-[#C5A832]/30 bg-[#C5A832]/5 p-4">
        <span className="text-sm font-semibold text-[#8B7523]">{t.glossarySource}:</span>
        <span className="flex items-center gap-1.5 text-sm text-[#1E293B]">
          <Database className="h-4 w-4 text-blue-600" /> {sourceLabels.db}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-[#1E293B]">
          <ClipboardList className="h-4 w-4 text-amber-600" /> {sourceLabels.decision}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-[#1E293B]">
          <Calculator className="h-4 w-4 text-green-600" /> {sourceLabels.computed}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-[#1E293B]">
          <Brain className="h-4 w-4 text-purple-600" /> {sourceLabels.ai}
        </span>
      </div>

      <div className="space-y-8">
        {glossary.map((mod) => (
          <Card key={mod.id} className="overflow-hidden">
            <CardHeader className="bg-[#1A365D] py-3">
              <CardTitle className="text-base text-white">{mod.title}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="w-[160px] font-semibold">{t.glossaryIndicator}</TableHead>
                    <TableHead className="font-semibold">{t.glossaryDescription}</TableHead>
                    <TableHead className="font-semibold">{t.glossaryFormula}</TableHead>
                    <TableHead className="font-semibold">{t.glossaryUsage}</TableHead>
                    <TableHead className="w-[60px] text-center font-semibold">{t.glossarySource}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mod.entries.map((entry, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-[#1A365D]">{entry.indicator}</TableCell>
                      <TableCell className="text-xs text-[#1E293B]">{entry.description}</TableCell>
                      <TableCell className="text-xs text-[#64748B]">{entry.formula}</TableCell>
                      <TableCell className="text-xs text-[#8B7523]">{entry.usage}</TableCell>
                      <TableCell className="text-center">
                        <span title={sourceLabel(entry.source, sourceLabels)}>
                          {sourceIcon(entry.source)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
