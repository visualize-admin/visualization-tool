import React, { useEffect, useState } from "react";
import DateAdapter from "@mui/lab/AdapterDateFns";
import { LocalizationProvider } from "@mui/lab";

const AsyncLocalizationProvider = ({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) => {
  const [dateFnsModule, setDateFnsModule] = useState<{ default: object }>();
  useEffect(() => {
    const run = async () => {
      if (locale === "fr") {
        setDateFnsModule(await import("date-fns/locale/fr"));
      } else if (locale === "de") {
        setDateFnsModule(await import("date-fns/locale/de"));
      } else if (locale === "it") {
        setDateFnsModule(await import("date-fns/locale/it"));
      } else if (locale === "en") {
        setDateFnsModule(await import("date-fns/locale/en-GB"));
      }
    };
    run();
  }, [locale]);
  if (!dateFnsModule) {
    return null;
  }
  return (
    <LocalizationProvider
      dateAdapter={DateAdapter}
      locale={dateFnsModule.default}
    >
      {children}
    </LocalizationProvider>
  );
};

export default AsyncLocalizationProvider;
