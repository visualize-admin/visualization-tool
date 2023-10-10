import produce from "immer";

import { createChartId } from "@/utils/create-chart-id";

type Migration = {
  description: string;
  from: string;
  to: string;
  up: (config: any, migrationProps?: any) => any;
  down: (config: any, migrationProps?: any) => any;
};

export const CHART_CONFIG_VERSION = "2.1.0";

const chartConfigMigrations: Migration[] = [
  {
    description: `MAP
    baseLayer {
      + locked
      + bbox
    }`,
    from: "1.0.0",
    to: "1.0.1",
    up: (config) => {
      let newConfig = { ...config, version: "1.0.1" };

      if (newConfig.chartType === "map") {
        const { baseLayer } = newConfig;
        newConfig = produce(newConfig, (draft: any) => {
          draft.baseLayer = {
            show: baseLayer.show,
            locked: false,
          };
        });
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.0.0" };

      if (newConfig.chartType === "map") {
        const { baseLayer } = newConfig;
        newConfig = produce(newConfig, (draft: any) => {
          draft.baseLayer = {
            show: baseLayer.show,
          };
        });
      }

      return newConfig;
    },
  },
  {
    description: `MAP
    symbolLayer {
      + colors {
        + type
        + value
        + opacity
      }
      - color
    }`,
    from: "1.0.1",
    to: "1.0.2",
    up: (config) => {
      let newConfig = { ...config, version: "1.0.2" };

      if (newConfig.chartType === "map") {
        const { fields } = newConfig;
        const { symbolLayer } = fields;
        const { show, componentIri, measureIri, color } = symbolLayer;
        newConfig = produce(newConfig, (draft: any) => {
          draft.fields.symbolLayer = {
            show,
            componentIri,
            measureIri,
            colors: {
              type: "fixed",
              value: color,
              opacity: 80,
            },
          };
        });
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.0.1" };

      if (newConfig.chartType === "map") {
        const { fields } = newConfig;
        const { symbolLayer } = fields;
        const { show, componentIri, measureIri, colors } = symbolLayer;
        newConfig = produce(newConfig, (draft: any) => {
          draft.fields.symbolLayer = {
            show,
            componentIri,
            measureIri,
            color: colors.value,
          };
        });
      }

      return newConfig;
    },
  },
  {
    description: `MAP
    areaLayer? {
      - show
    }
    
    symbolLayer? {
      - show
    }`,
    from: "1.0.2",
    to: "1.1.0",
    up: (config) => {
      let newConfig = { ...config, version: "1.1.0" };

      if (newConfig.chartType === "map") {
        const { fields } = newConfig;
        const { areaLayer, symbolLayer } = fields;
        const { show: showAreaLayer, ...newAreaLayer } = areaLayer;
        const { show: showSymbolLayer, ...newSymbolLayer } = symbolLayer;
        newConfig = produce(newConfig, (draft: any) => {
          if (showAreaLayer) {
            draft.fields.areaLayer = {
              ...newAreaLayer,
            };
          } else {
            delete draft.fields.areaLayer;
          }

          if (showSymbolLayer) {
            draft.fields.symbolLayer = {
              ...newSymbolLayer,
            };
          } else {
            delete draft.fields.symbolLayer;
          }
        });
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.0.2" };

      if (newConfig.chartType === "map") {
        const { fields } = newConfig;
        const { areaLayer, symbolLayer } = fields;
        newConfig = produce(newConfig, (draft: any) => {
          if (areaLayer) {
            draft.fields.areaLayer = {
              ...areaLayer,
              show: true,
            };
          } else {
            draft.fields.areaLayer = {
              show: false,
              componentIri: "",
              measureIri: symbolLayer?.measureIri || "",
              colorScaleType: "continuous",
              colorScaleInterpolationType: "linear",
              palette: "oranges",
              nbClass: 5,
            };
          }

          if (symbolLayer) {
            draft.fields.symbolLayer = {
              ...symbolLayer,
              show: true,
            };
          } else {
            draft.fields.symbolLayer = {
              show: false,
              // GeoShapes dimensions (Area Layer) can be used in Symbol Layer.
              componentIri: areaLayer?.componentIri || "",
              measureIri: areaLayer?.measureIri || "",
              colors: {
                type: "fixed",
                value: "#1f77b4",
                opacity: 80,
              },
            };
          }
        });
      }

      return newConfig;
    },
  },
  {
    description: `MAP
    areaLayer {
      - measureIri
      - palette
      - colorScaleType
      - colorScaleInterpolationType
      - nbClass
      + color {
        + type: "numerical"
        + componentIri
        + palette
        + scaleType: "continuous"
        + interpolationType: "linear"
      } | {
        + type: "numerical"
        + componentIri
        + palette
        + scaleType: "discrete"
        + nbClass
      }
    }
  
    symbolLayer {
      - colors {
        - type: "fixed"
        - value
        - opacity
      } | {
        - type: "categorical"
        - componentIri
        - palette
        - ?colorMapping
      } | {
        type: "continuous"
        - componentIri
        - palette
        - ?colorMapping
      }
      + color {
        + type: "fixed"
        + value
        + opacity
      } | {
        + type: "categorical"
        + componentIri
        + palette
        + colorMapping
      } | {
        + type: "numerical"
        + componentIri
        + palette
        + scaleType: "continuous"
        + interpolationType: "linear"
      } | {
        + type: "numerical"
        + componentIri
        + palette
        + scaleType: "discrete"
        + nbClass
      }
    }`,
    from: "1.1.0",
    to: "1.1.1",
    up: (config) => {
      let newConfig = { ...config, version: "1.1.1" };

      if (newConfig.chartType === "map") {
        const { fields } = newConfig;
        const { areaLayer, symbolLayer } = fields;

        if (areaLayer) {
          const {
            componentIri,
            measureIri,
            palette,
            colorScaleType,
            colorScaleInterpolationType,
            nbClass,
          } = areaLayer;

          newConfig = produce(newConfig, (draft: any) => {
            draft.fields.areaLayer = {
              componentIri,
              color: {
                type: "numerical",
                componentIri: measureIri,
                palette,
                ...(colorScaleType === "discrete"
                  ? {
                      scaleType: colorScaleType,
                      interpolationType: colorScaleInterpolationType,
                      nbClass,
                    }
                  : {
                      scaleType: colorScaleType,
                      interpolationType: colorScaleInterpolationType,
                    }),
              },
            };
          });
        }

        if (symbolLayer) {
          const { componentIri, measureIri, colors } = symbolLayer;

          newConfig = produce(newConfig, (draft: any) => {
            draft.fields.symbolLayer = {
              componentIri,
              measureIri,
              color:
                colors.type === "fixed" || colors.type === "categorical"
                  ? colors
                  : {
                      type: "numerical",
                      componentIri: colors.componentIri,
                      palette: colors.palette,
                      scaleType: "continuous",
                      interpolationType: "linear",
                    },
            };
          });
        }
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.1.0" };

      if (newConfig.chartType === "map") {
        const { fields } = newConfig;
        const { areaLayer, symbolLayer } = fields;

        if (areaLayer) {
          const { componentIri, color } = areaLayer;

          newConfig = produce(newConfig, (draft: any) => {
            draft.fields.areaLayer = {
              componentIri,
              measureIri: color.componentIri,
              palette: color.palette,
              colorScaleType: color.scaleType,
              colorInterpolationType: color.interpolationType,
              nbClass: color.nbClass ?? 3,
            };
          });
        }

        if (symbolLayer) {
          const { componentIri, measureIri, color } = symbolLayer;

          newConfig = produce(newConfig, (draft: any) => {
            draft.fields.symbolLayer = {
              componentIri,
              measureIri,
              ...(color.type === "fixed" || color.type === "categorical"
                ? color
                : {
                    type: "continuous",
                    componentIri: color.componentIri,
                    palette: color.palette,
                  }),
            };
          });
        }
      }

      return newConfig;
    },
  },
  {
    description: `MAP
    areaLayer - color can be categorical
    `,
    from: "1.1.1",
    to: "1.2.0",
    up: (config) => {
      let newConfig = { ...config, version: "1.2.0" };

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.1.1" };

      if (newConfig.chartType === "map") {
        const { fields } = newConfig;
        const { areaLayer } = fields;

        if (areaLayer && areaLayer.color.type === "categorical") {
          newConfig = produce(newConfig, (draft: any) => {
            delete draft.fields.areaLayer;
          });
        }
      }

      return newConfig;
    },
  },
  {
    description: `ALL
    interactiveFiltersConfig {
      time -> timeRange
    }`,
    from: "1.2.0",
    to: "1.2.1",
    up: (config) => {
      let newConfig = { ...config, version: "1.2.1" };

      const { interactiveFiltersConfig } = newConfig;

      if (interactiveFiltersConfig) {
        newConfig = produce(newConfig, (draft: any) => {
          draft.interactiveFiltersConfig = {
            legend: draft.interactiveFiltersConfig.legend,
            timeRange: draft.interactiveFiltersConfig.time,
            dataFilters: draft.interactiveFiltersConfig.dataFilters,
          };
        });
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.2.0" };

      const { interactiveFiltersConfig } = newConfig;

      if (interactiveFiltersConfig) {
        newConfig = produce(newConfig, (draft: any) => {
          draft.interactiveFiltersConfig = {
            legend: draft.interactiveFiltersConfig.legend,
            time: draft.interactiveFiltersConfig.timeRange,
            dataFilters: draft.interactiveFiltersConfig.dataFilters,
          };
        });
      }

      return newConfig;
    },
  },
  {
    description: `ALL
    interactiveFiltersConfig {
      + timeSlider
    }`,
    from: "1.2.1",
    to: "1.3.0",
    up: (config) => {
      let newConfig = { ...config, version: "1.3.0" };

      const { interactiveFiltersConfig } = newConfig;

      if (interactiveFiltersConfig) {
        newConfig = produce(newConfig, (draft: any) => {
          draft.interactiveFiltersConfig = {
            ...draft.interactiveFiltersConfig,
            timeSlider: {
              componentIri: "",
            },
          };
        });
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.2.1" };

      const { interactiveFiltersConfig } = newConfig;

      if (interactiveFiltersConfig) {
        newConfig = produce(newConfig, (draft: any) => {
          draft.interactiveFiltersConfig = {
            legend: draft.interactiveFiltersConfig.legend,
            time: draft.interactiveFiltersConfig.time,
            dataFilters: draft.interactiveFiltersConfig.dataFilters,
          };
        });
      }

      return newConfig;
    },
  },
  {
    description: `ALL
    fields {
      + animation {
        componentIri
      }
    }`,
    from: "1.3.0",
    to: "1.4.0",
    up: (config) => {
      let newConfig = { ...config, version: "1.4.0" };

      const { interactiveFiltersConfig } = newConfig;

      if (interactiveFiltersConfig) {
        const { legend, timeRange, timeSlider, dataFilters } =
          interactiveFiltersConfig;

        newConfig = produce(newConfig, (draft: any) => {
          draft.interactiveFiltersConfig = { legend, timeRange, dataFilters };

          if (
            ["column", "pie", "scatterplot"].includes(draft.chartType) &&
            timeSlider?.componentIri
          ) {
            draft.fields.animation = {
              ...timeSlider,
              showPlayButton: true,
              duration: 30,
              type: "continuous",
              dynamicScales: false,
            };
          }
        });
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.3.0" };

      const { fields } = config;
      const { animation } = fields;

      if (animation) {
        newConfig = produce(newConfig, (draft: any) => {
          delete draft.fields.animation;

          if (["column", "pie", "scatterplot"].includes(draft.chartType)) {
            draft.interactiveFiltersConfig.timeSlider = {
              componentIri: animation.componentIri,
            };
          } else {
            draft.interactiveFiltersConfig.timeSlider = { componentIri: "" };
          }
        });
      }

      return newConfig;
    },
  },
  {
    description: `ALL
    interactiveFiltersConfig {
      timeRange {
        componentIri is tied to x.componentIri
      }
    }`,
    from: "1.4.0",
    to: "1.4.1",
    up: (config) => {
      let newConfig = { ...config, version: "1.4.1" };

      const { fields, interactiveFiltersConfig } = newConfig;
      const { x } = fields;

      if (interactiveFiltersConfig) {
        const { timeRange } = interactiveFiltersConfig;

        newConfig = produce(newConfig, (draft: any) => {
          if (
            ["area", "column", "line"].includes(draft.chartType) &&
            timeRange.active
          ) {
            draft.interactiveFiltersConfig.timeRange = {
              ...timeRange,
              componentIri: x.componentIri,
            };
          }
        });
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.4.0" };

      const { interactiveFiltersConfig } = config;

      if (interactiveFiltersConfig) {
        newConfig = produce(newConfig, (draft: any) => {
          draft.interactiveFiltersConfig.timeRange = {
            ...draft.interactiveFiltersConfig.timeRange,
            componentIri: "",
          };
        });
      }

      return newConfig;
    },
  },
  {
    description: `ALL
    interactiveFiltersConfig {
      + calculation
    }`,
    from: "1.4.1",
    to: "1.4.2",
    up: (config) => {
      let newConfig = { ...config, version: "1.4.2" };

      const { interactiveFiltersConfig } = newConfig;

      if (interactiveFiltersConfig) {
        newConfig = produce(newConfig, (draft: any) => {
          draft.interactiveFiltersConfig = {
            ...draft.interactiveFiltersConfig,
            calculation: {
              active: false,
              type: "identity",
            },
          };
        });
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.4.1" };

      const { interactiveFiltersConfig } = config;

      if (interactiveFiltersConfig) {
        newConfig = produce(newConfig, (draft: any) => {
          const { calculation, ...rest } = interactiveFiltersConfig;
          draft.interactiveFiltersConfig = rest;
        });
      }

      return newConfig;
    },
  },
  {
    description: `ALL + key`,
    from: "1.4.2",
    to: "2.0.0",
    up: (config, configuratorState) => {
      const newConfig = { ...config, version: "2.0.0" };

      return produce(newConfig, (draft: any) => {
        draft.key = createChartId();
        draft.meta = configuratorState.meta;
        draft.activeField = configuratorState.activeField;
      });
    },
    down: (config) => {
      const newConfig = { ...config, version: "1.4.2" };

      return produce(newConfig, (draft: any) => {
        delete draft.key;
      });
    },
  },
  {
    description: `+ combo charts`,
    from: "2.0.0",
    to: "2.1.0",
    up: (config) => {
      const newConfig = { ...config, version: "2.1.0" };

      return newConfig;
    },
    down: (config) => {
      const newConfig = { ...config, version: "2.0.0" };

      return produce(newConfig, (draft: any) => {
        if (
          ["comboLineSingle", "comboLineDual", "comboLineColumn"].includes(
            draft.chartType
          )
        ) {
          draft.chartType = "line";
          draft.fields = {
            x: draft.fields.x,
            y: {
              componentIri:
                draft.chartType === "comboLineSingle"
                  ? draft.fields.y.componentIris[0]
                  : draft.chartType === "comboLineDual"
                  ? draft.fields.y.leftAxisComponentIri
                  : draft.fields.y.lineComponentIri,
            },
          };
        }
      });
    },
  },
];

export const migrateChartConfig = makeMigrate(chartConfigMigrations, {
  defaultToVersion: CHART_CONFIG_VERSION,
});

export const CONFIGURATOR_STATE_VERSION = "2.1.0";

const configuratorStateMigrations: Migration[] = [
  {
    description: `ALL`,
    from: "1.0.0",
    to: "2.0.0",
    up: (config: any) => {
      const newConfig = { ...config, version: "2.0.0" };

      return produce(newConfig, (draft: any) => {
        const migratedChartConfig = migrateChartConfig(draft.chartConfig, {
          migrationProps: draft,
          toVersion: "2.0.0",
        });
        draft.chartConfigs = [migratedChartConfig];
        delete draft.chartConfig;
        delete draft.activeField;
        draft.activeChartKey = migratedChartConfig.key;
      });
    },
    down: (config: any) => {
      const newConfig = { ...config, version: "1.0.0" };

      return produce(newConfig, (draft: any) => {
        const chartConfig = draft.chartConfigs[0];
        delete draft.chartConfigs;
        delete draft.activeChartKey;
        draft.meta = chartConfig.meta;
        draft.activeField = chartConfig.activeField;
        const migratedChartConfig = migrateChartConfig(chartConfig, {
          toVersion: "1.4.2",
        });
        draft.chartConfig = migratedChartConfig;
      });
    },
  },
  {
    description: "ALL + key",
    from: "2.0.0",
    to: "2.1.0",
    up: (config: any, props: { key: string }) => {
      const newConfig = { ...config, key: props.key, version: "2.1.0" };

      return newConfig;
    },
    down: (config: any) => {
      const newConfig = { ...config, version: "2.0.0" };

      return produce(newConfig, (draft: any) => {
        delete draft.key;
      });
    },
  },
];

export const migrateConfiguratorState = makeMigrate(
  configuratorStateMigrations,
  {
    defaultToVersion: CONFIGURATOR_STATE_VERSION,
  }
);

function makeMigrate(
  migrations: Migration[],
  options: { defaultToVersion: string }
) {
  const { defaultToVersion } = options;

  return (
    data: any,
    options: {
      fromVersion?: string;
      toVersion?: string;
      migrationProps?: any;
    } = {}
  ) => {
    const {
      fromVersion,
      toVersion = defaultToVersion,
      migrationProps,
    } = options;
    const migrate = (
      data: any,
      {
        fromVersion,
      }: {
        fromVersion?: string;
      } = {}
    ): any => {
      const fromVersionFinal = fromVersion ?? data.version ?? "1.0.0";
      const direction = upOrDown(fromVersionFinal, toVersion);

      if (direction === "same") {
        return data;
      }

      const migration = migrations.find(
        (d) => d[direction === "up" ? "from" : "to"] === fromVersionFinal
      );

      if (migration) {
        const newData = migration[direction](data, migrationProps);
        return migrate(newData, { fromVersion });
      }
    };

    return migrate(data, { fromVersion });
  };
}

const upOrDown = (
  fromVersion: string,
  toVersion: string
): "up" | "down" | "same" => {
  const fromNumbers = fromVersion.split(".").map((d) => +d);
  const toNumbers = toVersion.split(".").map((d) => +d);

  for (let i = 0; i < fromNumbers.length; i++) {
    if (fromNumbers[i] < toNumbers[i]) {
      return "up";
    }

    if (fromNumbers[i] > toNumbers[i]) {
      return "down";
    }
  }

  return "same";
};
