import { useRouter } from "next/router";
import { Locales } from "../locales/locales";

export const useLocale = () => {
  const { query } = useRouter();

  if (!query.locale) {
    throw Error("No locale at current route :(");
  }

  return query.locale as Locales;
};
