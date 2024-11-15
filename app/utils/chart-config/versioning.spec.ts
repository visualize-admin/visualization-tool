import {
  ConfiguratorStateConfiguringChart,
  decodeChartConfig,
  LineConfig,
} from "@/config-types";
import dualLine1Fixture from "@/test/__fixtures/config/dev/chartConfig-photovoltaik-und-gebaudeprogramm.json";
import {
  CHART_CONFIG_VERSION,
  CONFIGURATOR_STATE_VERSION,
} from "@/utils/chart-config/constants";

import {
  chartConfigMigrations,
  configuratorStateMigrations,
  migrateChartConfig,
  upOrDown,
} from "./versioning";

const CONFIGURATOR_STATE = {
  dataSource: {
    type: "sparql",
    url: "",
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
    const migratedConfig = await migrateChartConfig(oldMapConfig, {
      migrationProps: CONFIGURATOR_STATE,
    });
    const decodedConfig = decodeChartConfig(migratedConfig);

    expect(decodedConfig).toBeDefined();

    const migratedOldConfig = (await migrateChartConfig(decodedConfig, {
      toVersion: "1.0.0",
    })) as any;
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

  it("should migrate to initial config from migrated config for minor version changes", async () => {
    const migratedConfig = await migrateChartConfig(oldMapConfig, {
      toVersion: "1.0.2",
    });
    const migratedOldConfig = await migrateChartConfig(migratedConfig, {
      toVersion: "1.0.0",
    });

    expect(migratedOldConfig).toEqual(oldMapConfig);
  });

  it("should correctly migrate interactiveFiltersConfig", async () => {
    const migratedConfig = await migrateChartConfig(oldLineConfig, {
      migrationProps: CONFIGURATOR_STATE,
    });
    const decodedConfig = decodeChartConfig(migratedConfig);

    expect(decodedConfig).toBeDefined();
    expect(
      (decodedConfig as LineConfig).interactiveFiltersConfig?.timeRange
        .componentId === oldLineConfig.fields.x.componentIri
    ).toBeDefined();

    const migratedOldConfig = (await migrateChartConfig(decodedConfig, {
      toVersion: "1.4.0",
    })) as any;

    expect(
      migratedOldConfig.interactiveFiltersConfig?.timeRange.componentIri
    ).toEqual("");
  });

  it("should correctly migrate colorMapping in v4.0.0 for combo charts", async () => {
    const migratedConfig = await migrateChartConfig(dualLine1Fixture, {
      toVersion: "4.0.0",
      migrationProps: CONFIGURATOR_STATE,
    });
    const decodedConfig = decodeChartConfig(migratedConfig);
    expect(decodedConfig).toBeDefined();
    expect((decodedConfig as any).fields.y.colorMapping).toMatchObject({
      "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/4___http://schema.org/amount":
        "#ff7f0e",
      "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9___https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/AnzahlAnlagen":
        "#1f77b4",
    });
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
