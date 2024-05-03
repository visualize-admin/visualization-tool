import { Box } from "@mui/material";
import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    const iframe = document.getElementById("chart") as HTMLIFrameElement;
    iframe.onload = () => {
      const iframeWindow = iframe?.contentWindow as Window | undefined;

      if (iframeWindow) {
        iframeWindow.postMessage(chartState, "*");
      }
    };
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6, p: 6 }}>
      <iframe
        id="chart"
        src="/preview"
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

const chartState = {
  state: "CONFIGURING_CHART",
  dataSet: "https://environment.ld.admin.ch/foen/nfi/nfi_C-1266/cube/2023-1",
  dataSource: {
    type: "sparql",
    url: "https://int.lindas.admin.ch/query",
  },
  meta: {
    title: {
      de: "",
      fr: "",
      it: "",
      en: "",
    },
    description: {
      de: "",
      fr: "",
      it: "",
      en: "",
    },
  },
  chartConfig: {
    version: "1.4.2",
    chartType: "map",
    filters: {
      "https://environment.ld.admin.ch/foen/nfi/evaluationType": {
        type: "single",
        value: "https://environment.ld.admin.ch/foen/nfi/EvaluationType/1",
      },
      "https://environment.ld.admin.ch/foen/nfi/grid": {
        type: "single",
        value: "https://environment.ld.admin.ch/foen/nfi/Grid/410",
      },
      "https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation": {
        type: "single",
        value: "https://environment.ld.admin.ch/foen/nfi/UnitOfEvaluation/2382",
      },
      "https://environment.ld.admin.ch/foen/nfi/inventory": {
        type: "single",
        value: "https://environment.ld.admin.ch/foen/nfi/Inventory/250",
      },
      "https://environment.ld.admin.ch/foen/nfi/classificationUnit": {
        type: "single",
        value:
          "https://environment.ld.admin.ch/foen/nfi/ClassificationUnit/1266/1",
      },
    },
    interactiveFiltersConfig: {
      legend: {
        active: false,
        componentIri: "",
      },
      timeRange: {
        active: false,
        componentIri:
          "https://environment.ld.admin.ch/foen/nfi/classificationUnit",
        presets: {
          type: "range",
          from: "",
          to: "",
        },
      },
      dataFilters: {
        active: false,
        componentIris: [],
      },
      calculation: {
        active: false,
        type: "identity",
      },
    },
    baseLayer: {
      show: true,
      locked: false,
    },
    fields: {
      areaLayer: {
        componentIri:
          "https://environment.ld.admin.ch/foen/nfi/unitOfReference",
        color: {
          type: "numerical",
          componentIri: "https://environment.ld.admin.ch/foen/nfi/Topic/24r",
          scaleType: "continuous",
          interpolationType: "linear",
          palette: "oranges",
        },
      },
    },
  },
};
