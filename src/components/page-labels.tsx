"use client";

import { useLocale } from "@/lib/use-locale";
import type { Locale } from "@/lib/i18n";

// Exposes locale to server-rendered pages via a hidden input
// Server components read data; client components render labels
export function PageLocale({ children }: { children: (t: ReturnType<typeof useLocale>["t"], locale: Locale) => React.ReactNode }) {
  const { locale, t } = useLocale();
  return <>{children(t, locale)}</>;
}

// Simple translated text component
export function T({ k }: { k: string }) {
  const { t } = useLocale();
  const val = (t as Record<string, unknown>)[k];
  if (typeof val === "string") return <>{val}</>;
  return <>{k}</>;
}

// Service name translator
export function ServiceName({ serviceKey }: { serviceKey: string }) {
  const { t } = useLocale();
  const map: Record<string, string> = {
    emergency: t.svcEmergency,
    inpatient: t.svcInpatient,
    surgery: t.svcSurgery,
    "Pronto Atendimento": t.svcEmergency,
    "Internação sem Cirurgia": t.svcInpatient,
    "Cirurgia / Alta Complexidade": t.svcSurgery,
  };
  return <>{map[serviceKey] || serviceKey}</>;
}

// Status badge translator
export function StatusLabel({ status }: { status: "ok" | "overload" | "overcapacity" }) {
  const { t } = useLocale();
  const map = {
    ok: t.statusOk,
    overload: t.statusOverload,
    overcapacity: t.statusIdle,
  };
  return <>{map[status]}</>;
}
