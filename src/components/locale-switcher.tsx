"use client";

import { useState, useEffect } from "react";
import { LOCALES, LOCALE_LABELS, LOCALE_FLAGS, type Locale } from "@/lib/i18n";

const STORAGE_KEY = "tutor-copilot-locale";

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && LOCALES.includes(stored as Locale)) return stored as Locale;
  return "en";
}

export function setStoredLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale);
}

export function LocaleSwitcher({
  onChange,
}: {
  onChange?: (locale: Locale) => void;
}) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(getStoredLocale());
  }, []);

  const handleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setStoredLocale(newLocale);
    onChange?.(newLocale);
    // Reload to apply translations everywhere
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            locale === loc
              ? "bg-white/20 text-white"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
          title={LOCALE_LABELS[loc]}
        >
          {LOCALE_FLAGS[loc]} {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
