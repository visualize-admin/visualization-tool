import { decodeChartConfig, MapConfig } from "@/configurator/config-types";

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
        show: false,
        componentIri: "GeoCoordinatesDimensionIri",
        measureIri: "MeasureIri",
        color: "blue",
      },
    },
    baseLayer: {
      show: true,
    },
  };

  it("should migrate to newest config and back (but might lost some info for major version changes", () => {
    const migratedConfig = migrateChartConfig(oldConfig);
    const decodedConfig = decodeChartConfig(migratedConfig);

    expect(decodedConfig).toBeDefined();

    const migratedOldConfig = migrateChartConfig(decodedConfig, {
      toVersion: "1.0.0",
    }) as MapConfig;
    expect(migratedOldConfig.version).toEqual("1.0.0");
    const symbolLayer = migratedOldConfig.fields.symbolLayer!;
    // @ts-ignore - show does not existing in the newer version of the types
    expect(symbolLayer.show).toEqual(false);
    // Should migrate "GeoCoordinatesDimensionIri" to iri defined in Area Layer.
    expect(symbolLayer.componentIri).toEqual(
      oldConfig.fields.areaLayer.componentIri
    );
    expect(symbolLayer.measureIri).toEqual(
      oldConfig.fields.areaLayer.measureIri
    );
    expect(symbolLayer.color).toEqual("#1f77b4");
  });

  it("should migrate to initial config from migrated config for minor version changes", () => {
    const migratedConfig = migrateChartConfig(oldConfig, {
      toVersion: "1.0.2",
    });
    const migratedOldConfig = migrateChartConfig(migratedConfig, {
      toVersion: "1.0.0",
    });

    expect(migratedOldConfig).toEqual(oldConfig);
  });
});
