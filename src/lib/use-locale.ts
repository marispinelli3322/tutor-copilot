"use client";

import { useState, useEffect } from "react";
import { type Locale, type Translations, getTranslations } from "./i18n";

const STORAGE_KEY = "tutor-copilot-locale";

export function useLocale(): { locale: Locale; t: Translations } {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "pt" || stored === "en") {
      setLocale(stored);
    }
  }, []);

  return { locale, t: getTranslations(locale) };
}
