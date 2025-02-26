import { Box } from "@mui/material";
import { useEffect } from "react";

import { useLocale } from "@/locales/use-locale";
import CONFIGURATOR_STATE_MAP from "@/test/__fixtures/config/prod/map-1.json";

const loadIframe = (id: string, config: any) => {
  const iframe = document.getElementById(id) as HTMLIFrameElement;
  iframe.onload = async () => {
    const iframeWindow = iframe?.contentWindow as Window | undefined;

    if (iframeWindow) {
      iframeWindow.postMessage(config, "*");
    }
  };
};

const Page = () => {
  const locale = useLocale();

  useEffect(() => {
    loadIframe("chart-map", CONFIGURATOR_STATE_MAP);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 6,
        p: 6,
        "& > iframe": {
          width: 450,
          height: 750,
          border: "none",
        },
      }}
    >
      <iframe
        id="chart-column"
        src={`/${locale}/preview?state=${JSON.stringify(CONFIGURATOR_STATE_COLUMN)}`}
      />
      <iframe id="chart-map" src={`/${locale}/preview`} />
    </Box>
  );
};

export default Page;

const CONFIGURATOR_STATE_COLUMN = {
  state: "CONFIGURING_CHART",
  dataSet:
    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/2",
  dataSource: {
    type: "sparql",
    url: "https://lindas-cached.cluster.ldbar.ch/query",
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
};
