import { Box } from "@mui/material";
import { useEffect } from "react";

import { useLocale } from "@/locales/use-locale";
import { migrateConfiguratorState } from "@/utils/chart-config/versioning";

const Page = () => {
  const locale = useLocale();
  useEffect(() => {
    const iframe = document.getElementById("chart") as HTMLIFrameElement;
    iframe.onload = async () => {
      const iframeWindow = iframe?.contentWindow as Window | undefined;

      if (iframeWindow) {
        iframeWindow.postMessage(
          await migrateConfiguratorState({
            state: "CONFIGURING_CHART",
            dataSet:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/2",
            dataSource: {
              type: "sparql",
              url: "https://lindas.admin.ch/query",
            },
            meta: {
              title: { de: "", fr: "", it: "", en: "" },
              description: { de: "", fr: "", it: "", en: "" },
            },
            chartConfig: {
              version: "1.4.2",
              chartType: "column",
              filters: {
                "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton":
                  { type: "single", value: "https://ld.admin.ch/canton/1" },
              },
              interactiveFiltersConfig: {
                legend: { active: false, componentIri: "" },
                timeRange: {
                  active: false,
                  componentIri:
                    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
                  presets: { type: "range", from: "", to: "" },
                },
                dataFilters: { active: false, componentIris: [] },
                calculation: { active: false, type: "identity" },
              },
              fields: {
                x: {
                  componentIri:
                    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
                  sorting: { sortingType: "byAuto", sortingOrder: "asc" },
                },
                y: {
                  componentIri:
                    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/AnzahlAnlagen",
                },
              },
            },
          }),
          "*"
        );
      }
    };
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6, p: 6 }}>
      <iframe
        id="chart"
        src={`/${locale}/preview`}
        style={{
          width: 450,
          height: 750,
          border: "none",
        }}
      />
    </Box>
  );
};

export default Page;
