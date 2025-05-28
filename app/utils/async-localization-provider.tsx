import { LocalizationProvider } from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterDateFns";
import { PropsWithChildren, useEffect, useState } from "react";

import { Locale } from "@/locales/locales";

type AsyncLocalizationProviderProps = {
  locale: Locale;
};

export const AsyncLocalizationProvider = (
  props: PropsWithChildren<AsyncLocalizationProviderProps>
) => {
  const { locale, children } = props;
  const [dateFnsLocale, setDateFnsLocale] = useState<object>();

  useEffect(() => {
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
