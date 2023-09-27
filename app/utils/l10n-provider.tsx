import { LocalizationProvider } from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterDateFns";
import React from "react";

import { Locale } from "@/locales/locales";

type AsyncLocalizationProviderProps = {
  locale: Locale;
};

const AsyncLocalizationProvider = (
  props: React.PropsWithChildren<AsyncLocalizationProviderProps>
) => {
  const { locale, children } = props;
  const [dateFnsLocale, setDateFnsLocale] = React.useState<object>();

  React.useEffect(() => {
    const run = async () => {
      switch (locale) {
        case "en": {
          const importedLocale = await import("date-fns/locale/en-GB");
          setDateFnsLocale(importedLocale.default);
          break;
        }
        case "de":
        case "fr":
        case "it": {
          const importedLocale = await import(
            /* webpackMode: "lazy", webpackChunkName: "date-fns-[index]", webpackExclude: /_lib/ */
            `date-fns/locale/${locale}/index.js`
          );
          setDateFnsLocale(importedLocale.default);
          break;
        }
        default:
          const _exhaustiveCheck: never = locale;
          return _exhaustiveCheck;
      }
    };

    run();
  }, [locale]);

  if (!dateFnsLocale) {
    return null;
  }

  return (
    <LocalizationProvider dateAdapter={DateAdapter} locale={dateFnsLocale}>
      {children}
    </LocalizationProvider>
  );
};

export default AsyncLocalizationProvider;
