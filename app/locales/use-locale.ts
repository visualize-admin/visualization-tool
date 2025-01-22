import { createContext, useContext } from "react";

import { defaultLocale, Locale, locales } from "./locales";

const LocaleContext = createContext<Locale>(defaultLocale);

export const LocaleProvider = LocaleContext.Provider;

export const useLocale = () => {
  return useContext(LocaleContext);
};

/** Returns ordered locales, with the current locale being first. */
export const useOrderedLocales = () => {
  const locale = useLocale();
  return [locale, ...locales.filter((l) => l !== locale)];
};
