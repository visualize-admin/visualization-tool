import { Locales, defaultLocale } from "./locales";
import { createContext, useContext } from "react";

const LocaleContext = createContext<Locales>(defaultLocale);

export const LocaleProvider = LocaleContext.Provider;

export const useLocale = () => {
  return useContext(LocaleContext);
};
