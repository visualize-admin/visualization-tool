import { useEffect, useRef } from "react";
import { formatLocale, parse, Spec, timeFormatLocale, View, Warn } from "vega";
import {
  d3FormatLocales,
  d3TimeFormatLocales,
  Locales
} from "../locales/locales";
import { useLocale } from "./use-locale";

/**
 * Creates a Vega view with the correct locale.
 */
export const useVegaView = ({ spec }: { spec: Spec }) => {
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale() as Locales; // FIXME: no type casting

  useEffect(() => {
    // Unfortunately there's no other way than to globally mutate Vega's locales
    formatLocale(d3FormatLocales[locale]);
    timeFormatLocale(d3TimeFormatLocales[locale]);

    const createView = async () => {
      try {
        const view = new View(parse(spec), {
          logLevel: Warn,
          renderer: "svg",
          container: ref.current,
          hover: true
        });

        await view.runAsync();
        console.log("vegadata", view.data("table"));
      } catch (error) {
        console.log(error);
      }
    };
    createView();
    // return clean-up function
  }, [spec, locale]);

  return [ref] as const;
};
