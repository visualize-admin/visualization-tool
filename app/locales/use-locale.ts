import { createContext, useContext } from "react";

import { defaultLocale, Locale } from "./locales";

const LocaleContext = createContext<Locale>(defaultLocale);

export const LocaleProvider = LocaleContext.Provider;

export const useLocale = () => {
  return useContext(LocaleContext);
};
