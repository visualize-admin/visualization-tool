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
    url: "https://lindas-cached.cluster.ldbar.ch/query",
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
  version: "3.4.0",
  state: "CONFIGURING_CHART",
  dataSource: {
    type: "sparql",
    url: "https://lindas-cached.cluster.ldbar.ch/query",
  },
  layout: {
    type: "tab",
    meta: {
      title: {
        de: "",
        en: "",
        fr: "",
        it: "",
      },
      description: {
        de: "",
        en: "",
        fr: "",
        it: "",
      },
    },
  },
  chartConfigs: [
    {
      key: "jEASF-9qEqaC",
      version: "3.3.0",
      meta: {
        title: {
          en: "",
          de: "",
          fr: "",
          it: "",
        },
        description: {
          en: "",
          de: "",
          fr: "",
          it: "",
        },
      },
      cubes: [
        {
          iri: "https://environment.ld.admin.ch/foen/nfi/nfi_C-2637/cube/2024-1",
          publishIri:
            "https://environment.ld.admin.ch/foen/nfi/nfi_C-2637/cube/2024-1",
          filters: {
            "https://environment.ld.admin.ch/foen/nfi/unitOfReference": {
              type: "multi",
              values: {
                "https://ld.admin.ch/canton/19": true,
                "https://ld.admin.ch/canton/15": true,
                "https://ld.admin.ch/canton/16": true,
                "https://ld.admin.ch/canton/2": true,
                "https://ld.admin.ch/canton/10": true,
                "https://ld.admin.ch/canton/25": true,
                "https://ld.admin.ch/canton/8": true,
                "https://ld.admin.ch/canton/18": true,
                "https://ld.admin.ch/canton/26": true,
                "https://ld.admin.ch/canton/3": true,
                "https://ld.admin.ch/canton/24": true,
                "https://ld.admin.ch/canton/7": true,
                "https://ld.admin.ch/canton/6": true,
                "https://ld.admin.ch/canton/14": true,
                "https://ld.admin.ch/canton/5": true,
                "https://ld.admin.ch/canton/11": true,
                "https://ld.admin.ch/canton/17": true,
                "https://ld.admin.ch/canton/21": true,
                "https://ld.admin.ch/canton/20": true,
                "https://ld.admin.ch/canton/4": true,
                "https://ld.admin.ch/canton/22": true,
                "https://ld.admin.ch/canton/23": true,
                "https://ld.admin.ch/canton/9": true,
                "https://ld.admin.ch/canton/1": true,
                "https://ld.admin.ch/dimension/bgdi/biota/cantonregions/13":
                  true,
              },
            },
            "https://environment.ld.admin.ch/foen/nfi/classificationUnit": {
              type: "single",
              value:
                "https://environment.ld.admin.ch/foen/nfi/ClassificationUnit/Total",
            },
            "https://environment.ld.admin.ch/foen/nfi/evaluationType": {
              type: "single",
              value:
                "https://environment.ld.admin.ch/foen/nfi/EvaluationType/1",
            },
            "https://environment.ld.admin.ch/foen/nfi/grid": {
              type: "single",
              value: "https://environment.ld.admin.ch/foen/nfi/Grid/410",
            },
            "https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation": {
              type: "single",
              value:
                "https://environment.ld.admin.ch/foen/nfi/UnitOfEvaluation/434",
            },
          },
        },
      ],
      activeField: "animation",
      chartType: "map",
      interactiveFiltersConfig: {
        legend: {
          active: false,
          componentIri: "",
        },
        timeRange: {
          active: false,
          componentIri: "https://environment.ld.admin.ch/foen/nfi/inventory",
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
            componentIri: "https://environment.ld.admin.ch/foen/nfi/Topic/144",
            palette: "oranges",
            scaleType: "continuous",
            interpolationType: "linear",
            opacity: 100,
          },
        },
        animation: {
          componentIri: "https://environment.ld.admin.ch/foen/nfi/inventory",
          showPlayButton: true,
          duration: 10,
          type: "stepped",
          dynamicScales: false,
        },
      },
    },
  ],
  activeChartKey: "jEASF-9qEqaC",
  dashboardFilters: {
    filters: [],
  },
};
