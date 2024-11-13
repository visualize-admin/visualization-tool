import {
  ConfiguratorStateConfiguringChart,
  decodeChartConfig,
  LineConfig,
  MapConfig,
} from "@/config-types";

import {
  chartConfigMigrations,
  CHART_CONFIG_VERSION,
  configuratorStateMigrations,
  CONFIGURATOR_STATE_VERSION,
  migrateChartConfig,
  upOrDown,
} from "./versioning";

const CONFIGURATOR_STATE = {
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
  dataSet: "foo",
} as unknown as ConfiguratorStateConfiguringChart;

describe("config migrations", () => {
  const oldMapConfig = {
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
  const oldLineConfig = {
    version: "1.0.0",
    chartType: "line",
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
      x: {
        componentIri: "TimeDimensionIri",
      },
      y: {
        componentIri: "MeasureIri",
      },
    },
  };

  it("should migrate to newest config and back (but might lost some info for major version changes", async () => {
    const migratedConfig = migrateChartConfig(oldMapConfig, {
      migrationProps: CONFIGURATOR_STATE,
    });
    const decodedConfig = decodeChartConfig(migratedConfig);

    expect(decodedConfig).toBeDefined();

    const migratedOldConfig = (await migrateChartConfig(decodedConfig, {
      toVersion: "1.0.0",
    })) as MapConfig;
    expect(migratedOldConfig.version).toEqual("1.0.0");
    const symbolLayer = migratedOldConfig.fields.symbolLayer!;
    // @ts-ignore - show does not existing in the newer version of the types
    expect(symbolLayer.show).toEqual(false);
    // Should migrate "GeoCoordinatesDimensionIri" to iri defined in Area Layer.
    expect(symbolLayer.componentIri).toEqual(
      oldMapConfig.fields.areaLayer.componentIri
    );
    expect(symbolLayer.measureIri).toEqual(
      oldMapConfig.fields.areaLayer.measureIri
    );
    expect(symbolLayer.color).toEqual("#1f77b4");
  });

  it("should migrate to initial config from migrated config for minor version changes", () => {
    const migratedConfig = migrateChartConfig(oldMapConfig, {
      toVersion: "1.0.2",
    });
    const migratedOldConfig = migrateChartConfig(migratedConfig, {
      toVersion: "1.0.0",
    });

    expect(migratedOldConfig).toEqual(oldMapConfig);
  });

  it("should correctly migrate interactiveFiltersConfig", async () => {
    const migratedConfig = migrateChartConfig(oldLineConfig, {
      migrationProps: CONFIGURATOR_STATE,
    });
    const decodedConfig = decodeChartConfig(migratedConfig);

    expect(decodedConfig).toBeDefined();
    expect(
      (decodedConfig as LineConfig).interactiveFiltersConfig?.timeRange
        .componentIri === oldLineConfig.fields.x.componentIri
    ).toBeDefined();

    const migratedOldConfig = (await migrateChartConfig(decodedConfig, {
      toVersion: "1.4.0",
    })) as LineConfig;

    expect(
      migratedOldConfig.interactiveFiltersConfig?.timeRange.componentIri
    ).toEqual("");
  });
});

describe("last version", () => {
  it("should have a version superior to the last migration (configurator state)", () => {
    const direction = upOrDown(
      CONFIGURATOR_STATE_VERSION,
      configuratorStateMigrations[configuratorStateMigrations.length - 1].to
    );
    expect(direction).toBe("same");
  });

  it("should have a version superior to the last migration (chart config)", () => {
    const direction = upOrDown(
      CHART_CONFIG_VERSION,
      chartConfigMigrations[chartConfigMigrations.length - 1].to
    );
    expect(direction).toBe("same");
  });
});
