import { useRouter } from "next/router";
import { Locales, defaultLocale } from "../locales/locales";

export const useLocale = () => {
  const { query, pathname } = useRouter();

  if (pathname === "/docs") {
    return defaultLocale;
  }

  if (!query.locale) {
    throw Error("No locale at current route :(");
  }

  return query.locale as Locales;
};
