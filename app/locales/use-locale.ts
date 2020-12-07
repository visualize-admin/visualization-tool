import { defaultLocale, Locale } from "./locales";
import { createContext, useContext } from "react";

const LocaleContext = createContext<Locale>(defaultLocale);

export const LocaleProvider = LocaleContext.Provider;

export const useLocale = () => {
  return useContext(LocaleContext);
};
