"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Locale } from "./story";

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);
  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale: () => setLocale((current) => current === "en" ? "zh" : "en") }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLocale(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
}

export function tr(locale: Locale, en: string, zh: string): string {
  return locale === "en" ? en : zh;
}
