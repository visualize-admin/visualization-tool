import { decodeChartConfig } from "@/configurator/config-types";

import { migrateChartConfig } from "./versioning";

describe("config migrations", () => {
  const oldConfig = {
    version: "1.0.0",
    chartType: "map",
    interactiveFiltersConfig: {
      legend: {
        active: false,
        componentIri: "",
      },
      time: {
        active: false,
        componentIri: "",
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
    },
    filters: {},
    fields: {
      areaLayer: {
        show: true,
        componentIri: "GeoShapesDimensionIri",
        measureIri: "MeasureIri",
        colorScaleType: "continuous",
        colorScaleInterpolationType: "linear",
        palette: "oranges",
        nbClass: 5,
      },
      symbolLayer: {
        show: true,
        componentIri: "GeoCoordinatesDimensionIri",
        measureIri: "MeasureIri",
        color: "blue",
      },
    },
    baseLayer: {
      show: true,
    },
  };

  it("should migrate to newest config", () => {
    const migratedConfig = migrateChartConfig(oldConfig);
    const decodedConfig = decodeChartConfig(migratedConfig);

    expect(decodedConfig).toMatchSnapshot();
  });

  it("should migrate to initial config from migrated config", () => {
    const migratedConfig = migrateChartConfig(oldConfig);
    const migratedOldConfig = migrateChartConfig(migratedConfig, {
      toVersion: "1.0.0",
    });

    expect(migratedOldConfig).toEqual(oldConfig);
  });
});
