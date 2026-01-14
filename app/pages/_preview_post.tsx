import { Box } from "@mui/material";

const Page = () => {
  return (
    <Box sx={{ display: "flex", gap: 2, p: 6 }}>
      <form method="post" action="preview_post" target="_blank">
        <input
          type="hidden"
          name="chartState"
          value={JSON.stringify(photovoltaikanlagenState)}
        />
        <input type="submit" value="☀️ Preview a Photovoltaikanlagen chart" />
      </form>
      <form method="post" action="preview_post" target="_blank">
        <input
          type="hidden"
          name="chartState"
          value={JSON.stringify(nfiState)}
        />
        <input type="submit" value="🎄 Preview an NFI chart" />
      </form>
      <iframe
        id="chart"
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

const photovoltaikanlagenState = {
  state: "CONFIGURING_CHART",
  dataSet:
    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/7",
  dataSource: {
    type: "sparql",
    url: "https://lindas-cached.int.cz-aws.net/query",
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
    chartType: "column",
    filters: {
      "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton":
        {
          type: "single",
          value: "https://ld.admin.ch/canton/1",
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
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
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
    fields: {
      x: {
        componentIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
        sorting: {
          sortingType: "byAuto",
          sortingOrder: "asc",
        },
      },
      y: {
        componentIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/AnzahlAnlagen",
      },
    },
  },
};

const nfiState = {
  state: "CONFIGURING_CHART",
  dataSet: "https://environment.ld.admin.ch/foen/nfi/nfi_C-1266/cube/2023-1",
  dataSource: {
    type: "sparql",
    url: "https://lindas-cached.int.cz-aws.net/query",
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
