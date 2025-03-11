import { schemeCategory10 } from "d3-scale-chromatic";
import stringSimilarity from "string-similarity-js";

import { DEFAULT_OTHER_COLOR_FIELD_OPACITY } from "@/charts/map/constants";
import { ChartConfig, ConfiguratorState } from "@/config-types";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import {
  LEGACY_PROD_DATA_SOURCE_URL,
  PROD_DATA_SOURCE_URL,
} from "@/domain/datasource/constants";
import { client } from "@/graphql/client";
import { isJoinById } from "@/graphql/join";
import {
  ComponentId,
  parseComponentId,
  stringifyComponentId,
} from "@/graphql/make-component-id";
import { DEFAULT_CATEGORICAL_PALETTE_ID } from "@/palettes";
import {
  CHART_CONFIG_VERSION,
  CONFIGURATOR_STATE_VERSION,
} from "@/utils/chart-config/constants";
import {
  getUnversionedCubeIri,
  getUnversionedCubeIriServerSide,
} from "@/utils/chart-config/upgrade-cube";
import { createId } from "@/utils/create-id";

type Migration = {
  description: string;
  from: string;
  to: string;
  up: (config: any, migrationProps?: any) => Promise<any>;
  down: (config: any, migrationProps?: any) => Promise<any>;
};

export const chartConfigMigrations: Migration[] = [
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
        newConfig.baseLayer = {
          show: newConfig.baseLayer.show,
          locked: false,
        };
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.0.0" };

      if (newConfig.chartType === "map") {
        newConfig.baseLayer = {
          show: newConfig.baseLayer.show,
        };
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
        newConfig.fields.symbolLayer = {
          show,
          componentIri,
          measureIri,
          colors: {
            type: "fixed",
            value: color,
            opacity: 80,
          },
        };
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.0.1" };

      if (newConfig.chartType === "map") {
        const { fields } = newConfig;
        const { symbolLayer } = fields;
        const { show, componentIri, measureIri, colors } = symbolLayer;
        newConfig.fields.symbolLayer = {
          show,
          componentIri,
          measureIri,
          color: colors.value,
        };
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

        if (showAreaLayer) {
          newConfig.fields.areaLayer = {
            ...newAreaLayer,
          };
        } else {
          delete newConfig.fields.areaLayer;
        }

        if (showSymbolLayer) {
          newConfig.fields.symbolLayer = {
            ...newSymbolLayer,
          };
        } else {
          delete newConfig.fields.symbolLayer;
        }
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.0.2" };

      if (newConfig.chartType === "map") {
        const { fields } = newConfig;
        const { areaLayer, symbolLayer } = fields;

        if (areaLayer) {
          newConfig.fields.areaLayer = {
            ...areaLayer,
            show: true,
          };
        } else {
          newConfig.fields.areaLayer = {
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
          newConfig.fields.symbolLayer = {
            ...symbolLayer,
            show: true,
          };
        } else {
          newConfig.fields.symbolLayer = {
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

          newConfig.fields.areaLayer = {
            componentIri,
            color: {
              type: "numerical",
              componentIri: measureIri,
              palette,
              ...(colorScaleType === "discrete"
                ? {
                    scaleType: colorScaleType,
                    interpolationType:
                      colorScaleInterpolationType === "linear"
                        ? "quantize"
                        : colorScaleInterpolationType,
                    nbClass,
                  }
                : {
                    scaleType: colorScaleType,
                    interpolationType: "linear",
                  }),
            },
          };
        }

        if (symbolLayer) {
          const { componentIri, measureIri, colors } = symbolLayer;

          newConfig.fields.symbolLayer = {
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

          newConfig.fields.areaLayer = {
            componentIri,
            measureIri: color.componentIri,
            palette: color.palette,
            colorScaleType: color.scaleType,
            colorInterpolationType: color.interpolationType,
            nbClass: color.nbClass ?? 3,
          };
        }

        if (symbolLayer) {
          const { componentIri, measureIri, color } = symbolLayer;

          newConfig.fields.symbolLayer = {
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
          delete newConfig.fields.areaLayer;
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
        newConfig.interactiveFiltersConfig = {
          legend: newConfig.interactiveFiltersConfig.legend,
          timeRange: newConfig.interactiveFiltersConfig.time,
          dataFilters: newConfig.interactiveFiltersConfig.dataFilters,
        };
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.2.0" };

      const { interactiveFiltersConfig } = newConfig;

      if (interactiveFiltersConfig) {
        newConfig.interactiveFiltersConfig = {
          legend: newConfig.interactiveFiltersConfig.legend,
          time: newConfig.interactiveFiltersConfig.timeRange,
          dataFilters: newConfig.interactiveFiltersConfig.dataFilters,
        };
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
        newConfig.interactiveFiltersConfig = {
          ...newConfig.interactiveFiltersConfig,
          timeSlider: {
            componentIri: "",
          },
        };
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.2.1" };

      const { interactiveFiltersConfig } = newConfig;

      if (interactiveFiltersConfig) {
        newConfig.interactiveFiltersConfig = {
          legend: newConfig.interactiveFiltersConfig.legend,
          time: newConfig.interactiveFiltersConfig.time,
          dataFilters: newConfig.interactiveFiltersConfig.dataFilters,
        };
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

        newConfig.interactiveFiltersConfig = { legend, timeRange, dataFilters };

        if (
          ["column", "pie", "scatterplot"].includes(newConfig.chartType) &&
          timeSlider?.componentIri
        ) {
          newConfig.fields.animation = {
            ...timeSlider,
            showPlayButton: true,
            duration: 30,
            type: "continuous",
            dynamicScales: false,
          };
        }
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.3.0" };

      const { fields } = config;
      const { animation } = fields;

      if (animation) {
        delete newConfig.fields.animation;

        if (["column", "pie", "scatterplot"].includes(newConfig.chartType)) {
          newConfig.interactiveFiltersConfig.timeSlider = {
            componentIri: animation.componentIri,
          };
        } else {
          newConfig.interactiveFiltersConfig.timeSlider = { componentIri: "" };
        }
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

      if (
        interactiveFiltersConfig &&
        ["area", "column", "line"].includes(newConfig.chartType) &&
        newConfig.interactiveFiltersConfig.timeRange.active
      ) {
        newConfig.interactiveFiltersConfig.timeRange = {
          ...newConfig.interactiveFiltersConfig.timeRange,
          componentIri: x.componentIri,
        };
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.4.0" };

      const { interactiveFiltersConfig } = config;

      if (interactiveFiltersConfig) {
        newConfig.interactiveFiltersConfig.timeRange = {
          ...newConfig.interactiveFiltersConfig.timeRange,
          componentIri: "",
        };
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
        newConfig.interactiveFiltersConfig = {
          ...newConfig.interactiveFiltersConfig,
          calculation: {
            active: false,
            type: "identity",
          },
        };
      }

      return newConfig;
    },
    down: (config) => {
      let newConfig = { ...config, version: "1.4.1" };

      const { interactiveFiltersConfig } = config;

      if (interactiveFiltersConfig) {
        const { calculation, ...rest } = interactiveFiltersConfig;
        newConfig.interactiveFiltersConfig = rest;
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
      newConfig.key = createId();
      newConfig.meta = configuratorState.meta;
      newConfig.activeField = configuratorState.activeField;

      return newConfig;
    },
    down: (config) => {
      const newConfig = { ...config, version: "1.4.2" };
      delete newConfig.key;

      return newConfig;
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

      if (
        ["comboLineSingle", "comboLineDual", "comboLineColumn"].includes(
          newConfig.chartType
        )
      ) {
        newConfig.chartType = "line";
        newConfig.fields = {
          x: newConfig.fields.x,
          y: {
            componentIri:
              newConfig.chartType === "comboLineSingle"
                ? newConfig.fields.y.componentIris[0]
                : newConfig.chartType === "comboLineDual"
                  ? newConfig.fields.y.leftAxisComponentIri
                  : newConfig.fields.y.lineComponentIri,
          },
        };
      }

      return newConfig;
    },
  },
  {
    description: `combo charts {
      y {
        + palette
        + colorMapping
      }
    }`,
    from: "2.1.0",
    to: "2.2.0",
    up: (config) => {
      const newConfig = { ...config, version: "2.2.0" };

      if (newConfig.chartType === "comboLineSingle") {
        newConfig.fields.y.palette = DEFAULT_CATEGORICAL_PALETTE_ID;
        newConfig.fields.y.colorMapping = mapValueIrisToColor({
          paletteId: DEFAULT_CATEGORICAL_PALETTE_ID,
          dimensionValues: newConfig.fields.y.componentIris.map(
            (iri: string) => ({ value: iri, label: iri })
          ),
        });
      } else if (newConfig.chartType === "comboLineDual") {
        newConfig.fields.y.palette = DEFAULT_CATEGORICAL_PALETTE_ID;
        newConfig.fields.y.colorMapping = mapValueIrisToColor({
          paletteId: DEFAULT_CATEGORICAL_PALETTE_ID,
          dimensionValues: [
            newConfig.fields.y.leftAxisComponentIri,
            newConfig.fields.y.rightAxisComponentIri,
          ].map((iri) => ({
            value: iri,
            label: iri,
          })),
        });
      } else if (newConfig.chartType === "comboLineColumn") {
        newConfig.fields.y.palette = DEFAULT_CATEGORICAL_PALETTE_ID;
        newConfig.fields.y.colorMapping = mapValueIrisToColor({
          paletteId: DEFAULT_CATEGORICAL_PALETTE_ID,
          dimensionValues: [
            newConfig.fields.y.lineComponentIri,
            newConfig.fields.y.columnComponentIri,
          ].map((iri) => ({
            value: iri,
            label: iri,
          })),
        });
      }

      return newConfig;
    },
    down: (config) => {
      const newConfig = { ...config, version: "2.1.0" };

      if (
        ["comboLineSingle", "comboLineDual", "comboLineColumn"].includes(
          newConfig.chartType
        )
      ) {
        delete newConfig.fields.y.palette;
        delete newConfig.fields.y.colorMapping;
      }

      return newConfig;
    },
  },
  {
    description: `ALL {
      + dataSet
    }`,
    from: "2.2.0",
    to: "2.3.0",
    up: (config, configuratorState) => {
      const newConfig = { ...config, version: "2.3.0" };
      const { dataSet } = configuratorState;
      newConfig.dataSet = dataSet;

      return newConfig;
    },
    down: (config) => {
      const newConfig = { ...config, version: "2.2.0" };
      delete newConfig.dataSet;

      return newConfig;
    },
  },
  {
    description: `ALL {
      + cubes {
        + iri
        + filters
        + joinBy?
      }
      - dataSet
      - filters
    }`,
    from: "2.3.0",
    to: "3.0.0",
    up: (config) => {
      const newConfig = { ...config, version: "3.0.0" };
      newConfig.cubes = [
        {
          iri: newConfig.dataSet,
          filters: newConfig.filters,
        },
      ];
      delete newConfig.dataSet;
      delete newConfig.filters;

      return newConfig;
    },
    down: (config) => {
      const newConfig = { ...config, version: "2.3.0" };
      newConfig.dataSet = newConfig.cubes[0].iri;
      newConfig.filters = newConfig.cubes[0].filters;
      delete newConfig.cubes;

      return newConfig;
    },
  },
  {
    from: "3.0.0",
    to: "3.1.0",
    description: `map {
      color {
        + opacity
      }
    }`,
    up: (config) => {
      const newConfig = { ...config, version: "3.1.0" };

      if (newConfig.chartType === "map") {
        if (newConfig.fields.areaLayer) {
          newConfig.fields.areaLayer.color.opacity =
            DEFAULT_OTHER_COLOR_FIELD_OPACITY;
        }

        if (newConfig.fields.symbolLayer) {
          if (newConfig.fields.symbolLayer.color.type !== "fixed") {
            newConfig.fields.symbolLayer.color.opacity =
              DEFAULT_OTHER_COLOR_FIELD_OPACITY;
          }
        }
      }

      return newConfig;
    },
    down: (config) => {
      const newConfig = { ...config, version: "3.0.0" };

      if (newConfig.chartType === "map") {
        if (newConfig.fields.areaLayer) {
          delete newConfig.fields.areaLayer.color.opacity;
        }

        if (newConfig.fields.symbolLayer) {
          if (newConfig.fields.symbolLayer.color.type !== "fixed") {
            delete newConfig.fields.symbolLayer.color.opacity;
          }
        }
      }

      return newConfig;
    },
  },
  {
    description: `ALL {
      + cubes {
        + publishIri
      }
    }`,
    from: "3.1.0",
    to: "3.2.0",
    up: (config) => {
      const newConfig = { ...config, version: "3.2.0" };
      newConfig.cubes = newConfig.cubes.map((cube: any) => ({
        ...cube,
        publishIri: cube.iri,
      }));

      return newConfig;
    },
    down: (config) => {
      const newConfig = { ...config, version: "3.1.0" };
      newConfig.cubes = newConfig.cubes.map((cube: any) => {
        const { publishIri, ...rest } = cube;
        return rest;
      });

      return newConfig;
    },
  },
  {
    description: `ALL {
      + cubes {
        +- joinBy (string) -> joinBy (string[])
      }
    }`,
    from: "3.2.0",
    to: "3.3.0",
    up: (config) => {
      const newConfig = { ...config, version: "3.3.0" };
      newConfig.cubes = newConfig.cubes.map((cube: any) => {
        if (typeof cube.joinBy === "string") {
          cube.joinBy = [cube.joinBy];
        }

        return cube;
      });

      return newConfig;
    },
    down: (config) => {
      const newConfig = { ...config, version: "3.2.0" };
      newConfig.cubes = newConfig.cubes.map((cube: any) => {
        if (cube.joinBy) {
          cube.joinBy = cube.joinBy[0];
        }

        return cube;
      });

      return newConfig;
    },
  },
  {
    description: `ALL {
      meta {
        + label
      }
    }`,
    from: "3.3.0",
    to: "3.4.0",
    up: (config) => {
      const newConfig = { ...config, version: "3.4.0" };
      newConfig.meta.label = {
        de: "",
        fr: "",
        it: "",
        en: "",
      };

      return newConfig;
    },
    down: (config) => {
      const newConfig = { ...config, version: "3.3.0" };
      delete newConfig.meta.label;

      return newConfig;
    },
  },
  {
    description: `ALL {
      cubes {
         + unversionedIri
         - publishIri
      }
    }`,
    from: "3.4.0",
    to: "4.0.0",
    up: async (config, configuratorState) => {
      const unversionedCubeIris: string[] = [];
      const getClosestUnversionedCubeIri = (id: string) => {
        let score = 0;
        let unversionedIri = "";

        for (const iri of unversionedCubeIris) {
          const s = stringSimilarity(id, iri);

          if (s > score) {
            score = s;
            unversionedIri = iri;
          }
        }

        return unversionedIri;
      };

      const newConfig = { ...config, version: "4.0.0" };
      newConfig.cubes = await Promise.all(
        newConfig.cubes.map(async (cube: any) => {
          const { publishIri, ...rest } = cube;
          const isServerSide = typeof window === "undefined";
          const fn = isServerSide
            ? async () => {
                return await getUnversionedCubeIriServerSide(rest.iri, {
                  dataSource: configuratorState.dataSource,
                });
              }
            : async () => {
                return await getUnversionedCubeIri(rest.iri, {
                  client,
                  dataSource: configuratorState.dataSource,
                });
              };
          const unversionedIri = await fn();

          unversionedCubeIris.push(unversionedIri);

          return {
            ...rest,
            joinBy: rest.joinBy?.map((joinBy: string) =>
              stringifyComponentId({
                unversionedCubeIri: unversionedIri,
                unversionedComponentIri: joinBy,
              })
            ),
            filters: Object.fromEntries(
              Object.entries(cube.filters).map(([k, v]) => [
                stringifyComponentId({
                  unversionedCubeIri: unversionedIri,
                  unversionedComponentIri: k,
                }),
                v,
              ])
            ),
          };
        })
      );

      for (const [k, v] of Object.entries<any>(newConfig.fields)) {
        if (typeof v !== "object") {
          continue;
        }

        if ("componentIris" in v) {
          v.componentIds = v.componentIris.map((iri: string) =>
            isJoinById(iri)
              ? iri
              : stringifyComponentId({
                  unversionedCubeIri: getClosestUnversionedCubeIri(iri),
                  unversionedComponentIri: iri,
                })
          );
          delete v.componentIris;
        } else if ("componentIri" in v) {
          v.componentId = isJoinById(v.componentIri)
            ? v.componentIri
            : v.componentIri
              ? stringifyComponentId({
                  unversionedCubeIri: getClosestUnversionedCubeIri(
                    v.componentIri
                  ),
                  unversionedComponentIri: v.componentIri,
                })
              : "";
          delete v.componentIri;
        }

        if ("measureIri" in v && v.measureIri !== FIELD_VALUE_NONE) {
          v.measureId = isJoinById(v.measureIri)
            ? v.measureIri
            : v.measureIri
              ? stringifyComponentId({
                  unversionedCubeIri: getClosestUnversionedCubeIri(
                    v.measureIri
                  ),
                  unversionedComponentIri: v.measureIri,
                })
              : "";
          delete v.measureIri;
        }

        if (
          (newConfig.chartType === "comboLineColumn" ||
            newConfig.chartType === "comboLineDual" ||
            newConfig.chartType === "comboLineSingle") &&
          k === "y"
        ) {
          v.colorMapping = Object.fromEntries(
            Object.entries(v.colorMapping).map(([k, v]) => [
              stringifyComponentId({
                unversionedCubeIri: getClosestUnversionedCubeIri(k),
                unversionedComponentIri: k,
              }),
              v,
            ])
          );
        }

        // Maps
        if (v.color && "componentIri" in v.color) {
          v.color.componentId = isJoinById(v.color.componentIri)
            ? v.color.componentIri
            : stringifyComponentId({
                unversionedCubeIri: getClosestUnversionedCubeIri(
                  v.color.componentIri
                ),
                unversionedComponentIri: v.color.componentIri,
              });
          delete v.color.componentIri;
        }

        if ("leftAxisComponentIri" in v) {
          v.leftAxisComponentId = isJoinById(v.leftAxisComponentIri)
            ? v.leftAxisComponentIri
            : stringifyComponentId({
                unversionedCubeIri: getClosestUnversionedCubeIri(
                  v.leftAxisComponentIri
                ),
                unversionedComponentIri: v.leftAxisComponentIri,
              });
          delete v.leftAxisComponentIri;
        }

        if ("rightAxisComponentIri" in v) {
          v.rightAxisComponentId = isJoinById(v.rightAxisComponentIri)
            ? v.rightAxisComponentIri
            : stringifyComponentId({
                unversionedCubeIri: getClosestUnversionedCubeIri(
                  v.rightAxisComponentIri
                ),
                unversionedComponentIri: v.rightAxisComponentIri,
              });
          delete v.rightAxisComponentIri;
        }

        if ("columnComponentIri" in v) {
          v.columnComponentId = isJoinById(v.columnComponentIri)
            ? v.columnComponentIri
            : stringifyComponentId({
                unversionedCubeIri: getClosestUnversionedCubeIri(
                  v.columnComponentIri
                ),
                unversionedComponentIri: v.columnComponentIri,
              });
          delete v.columnComponentIri;
        }

        if ("lineComponentIri" in v) {
          v.lineComponentId = isJoinById(v.lineComponentIri)
            ? v.lineComponentIri
            : stringifyComponentId({
                unversionedCubeIri: getClosestUnversionedCubeIri(
                  v.lineComponentIri
                ),
                unversionedComponentIri: v.lineComponentIri,
              });
          delete v.lineComponentIri;
        }

        if (newConfig.chartType === "table") {
          const componentId = isJoinById(k)
            ? k
            : stringifyComponentId({
                unversionedCubeIri: getClosestUnversionedCubeIri(k),
                unversionedComponentIri: k,
              });
          v.componentId = componentId;
          delete v.componentIri;
          newConfig.fields[componentId] = v;
          delete newConfig.fields[k];
        }
      }

      if (newConfig.chartType === "table") {
        newConfig.sorting = newConfig.sorting.map((sorting: any) => {
          const { componentIri, ...rest } = sorting;
          return {
            ...rest,
            componentId: isJoinById(componentIri)
              ? componentIri
              : stringifyComponentId({
                  unversionedCubeIri:
                    getClosestUnversionedCubeIri(componentIri),
                  unversionedComponentIri: componentIri,
                }),
          };
        });
      }

      for (const v of Object.values<any>(
        newConfig.interactiveFiltersConfig ?? {}
      )) {
        if ("componentIris" in v) {
          v.componentIds = v.componentIris.map((iri: string) =>
            isJoinById(iri)
              ? iri
              : stringifyComponentId({
                  unversionedCubeIri: getClosestUnversionedCubeIri(iri),
                  unversionedComponentIri: iri,
                })
          );
          delete v.componentIris;
        } else if ("componentIri" in v) {
          v.componentId = isJoinById(v.componentIri)
            ? v.componentIri
            : v.componentIri
              ? stringifyComponentId({
                  unversionedCubeIri: getClosestUnversionedCubeIri(
                    v.componentIri
                  ),
                  unversionedComponentIri: v.componentIri,
                })
              : "";
          delete v.componentIri;
        }
      }

      return newConfig;
    },
    down: async (config) => {
      const newConfig = { ...config, version: "3.4.0" };

      newConfig.cubes = newConfig.cubes.map(async (cube: any) => {
        return {
          ...cube,
          joinBy: cube.joinBy?.map(
            (joinBy: ComponentId) =>
              parseComponentId(joinBy).unversionedComponentIri
          ),
          publishIri: cube.iri,
          filters: Object.fromEntries(
            Object.entries(cube.filters).map(([k, v]) => [
              parseComponentId(k as ComponentId).unversionedComponentIri,
              v,
            ])
          ),
        };
      });

      for (const [_k, v] of Object.entries<any>(newConfig.fields)) {
        if (typeof v !== "object") {
          continue;
        }

        const k = _k as ComponentId;

        if ("componentIds" in v) {
          v.componentIris = v.componentIds.map(
            (id: ComponentId) => parseComponentId(id).unversionedComponentIri
          );
          delete v.componentIds;
        } else if ("componentId" in v) {
          v.componentIri = v.componentId
            ? parseComponentId(v.componentId).unversionedComponentIri
            : "";
          delete v.componentId;
        }

        if ("measureId" in v && v.measureId !== FIELD_VALUE_NONE) {
          v.measureIri = v.measureId
            ? parseComponentId(v.measureId).unversionedComponentIri
            : "";
          delete v.measureId;
        }

        if (
          (newConfig.chartType === "comboLineColumn" ||
            newConfig.chartType === "comboLineDual" ||
            newConfig.chartType === "comboLineSingle") &&
          k === "y"
        ) {
          v.colorMapping = Object.fromEntries(
            Object.entries(v.colorMapping).map(([k, v]) => [
              parseComponentId(k as ComponentId).unversionedComponentIri,
              v,
            ])
          );
        }

        // Maps
        if (v.color && "componentId" in v.color) {
          v.color.componentIri = parseComponentId(
            v.color.componentId
          ).unversionedComponentIri;
          delete v.color.componentId;
        }

        if ("leftAxisComponentId" in v) {
          v.leftAxisComponentIri = parseComponentId(
            v.leftAxisComponentId
          ).unversionedComponentIri;
          delete v.leftAxisComponentId;
        }

        if ("rightAxisComponentId" in v) {
          v.rightAxisComponentIri = parseComponentId(
            v.rightAxisComponentId
          ).unversionedComponentIri;
          delete v.rightAxisComponentId;
        }

        if ("columnComponentId" in v) {
          v.columnComponentIri = parseComponentId(
            v.columnComponentId
          ).unversionedComponentIri;
          delete v.columnComponentId;
        }

        if ("lineComponentId" in v) {
          v.lineComponentIri = parseComponentId(
            v.lineComponentId
          ).unversionedComponentIri;
          delete v.lineComponentId;
        }

        if (newConfig.chartType === "table") {
          const componentIri = parseComponentId(k)
            .unversionedComponentIri as string;
          v.componentIri = componentIri;
          delete v.componentId;
          newConfig.fields[componentIri] = v;
          delete newConfig.fields[k];
        }
      }

      for (const v of Object.values<any>(
        newConfig.interactiveFiltersConfig ?? {}
      )) {
        if ("componentIds" in v) {
          v.componentIris = v.componentIds.map(
            (id: ComponentId) => parseComponentId(id).unversionedComponentIri
          );
          delete v.componentIds;
        } else if ("componentId" in v) {
          v.componentIri = v.componentId
            ? parseComponentId(v.componentId).unversionedComponentIri
            : "";
          delete v.componentId;
        }
      }

      return newConfig;
    },
  },
  {
    description: `ALL {
      cubes {
        - joinBy: null
      }
      fields {
        segment {
          - colorMapping
        }
        y {
          - colorMapping
        }
        + color {
          + type
          + paletteId
          + colorMapping / color
        }
      }
    }`,
    from: "4.0.0",
    to: "4.1.0",
    up: (config) => {
      const newConfig = {
        ...config,
        version: "4.1.0",
      };

      // Fixes some rare cases of joinBy being null, when a cube was joined and
      // un-joined. Previously we kept the undefined field there, which was
      // converted to null via the database saving / fetching process, now we
      // remove the property entirely when removing a dataset.
      newConfig.cubes.forEach((cube: any) => {
        if (cube.joinBy === null) {
          delete cube.joinBy;
        }
      });

      if (newConfig.chartType === "table") {
        return newConfig;
      }

      if (newConfig.chartType === "map") {
        if (
          newConfig.fields.areaLayer?.color &&
          "palette" in newConfig.fields.areaLayer.color
        ) {
          newConfig.fields.areaLayer.color.paletteId =
            newConfig.fields.areaLayer.color.palette;
          delete newConfig.fields.areaLayer.color.palette;
        }

        if (
          newConfig.fields.symbolLayer?.color &&
          "palette" in newConfig.fields.symbolLayer.color
        ) {
          newConfig.fields.symbolLayer.color.paletteId =
            newConfig.fields.symbolLayer.color.palette;
          delete newConfig.fields.symbolLayer.color.palette;
        }

        return newConfig;
      }

      if (!newConfig.fields?.color) {
        const hasColorMapping = !!(
          newConfig.fields?.y?.colorMapping ||
          newConfig.fields?.segment?.colorMapping
        );

        if (!hasColorMapping) {
          newConfig.fields = {
            ...newConfig.fields,
            color: {
              type: "single",
              paletteId: "category10",
              color: schemeCategory10[0],
            },
          };
        }
      }

      if (newConfig.fields?.segment?.colorMapping) {
        newConfig.fields = {
          ...newConfig.fields,
          color: {
            type: "segment",
            paletteId: newConfig.fields.segment.palette || "category10",
            colorMapping: newConfig.fields.segment.colorMapping,
          },
        };
        delete newConfig.fields.segment.colorMapping;
        delete newConfig.fields.segment.palette;
      }

      if (newConfig.fields?.y?.colorMapping) {
        newConfig.fields = {
          ...newConfig.fields,
          color: {
            type: "measures",
            paletteId: newConfig.fields.y.palette || "category10",
            colorMapping: newConfig.fields.y.colorMapping,
          },
        };
        delete newConfig.fields.y.colorMapping;
        delete newConfig.fields.y.palette;
      }

      return newConfig;
    },
    down: (config) => {
      const newConfig = {
        ...config,
        version: "4.0.0",
      };

      if (newConfig.chartType === "table") {
        return newConfig;
      }

      if (newConfig.chartType === "map") {
        if (
          newConfig.fields.areaLayer?.color &&
          "paletteId" in newConfig.fields.areaLayer.color
        ) {
          newConfig.fields.areaLayer.color.palette =
            newConfig.fields.areaLayer.color.paletteId;
          delete newConfig.fields.areaLayer.color.paletteId;
        }

        if (
          newConfig.fields.symbolLayer?.color &&
          "paletteId" in newConfig.fields.symbolLayer.color
        ) {
          newConfig.fields.symbolLayer.color.palette =
            newConfig.fields.symbolLayer.color.paletteId;
          delete newConfig.fields.symbolLayer.color.paletteId;
        }

        return newConfig;
      }

      if (newConfig.fields?.color) {
        if (newConfig.fields.color.type === "segment") {
          newConfig.fields = {
            ...newConfig.fields,
            segment: {
              ...newConfig.fields.segment,
              colorMapping: newConfig.fields.color.colorMapping,
              palette: newConfig.fields.color.paletteId,
            },
          };
        }

        if (newConfig.fields.color.type === "measures") {
          newConfig.fields = {
            ...newConfig.fields,
            y: {
              ...newConfig.fields.y,
              colorMapping: newConfig.fields.color.colorMapping,
              palette: newConfig.fields.color.paletteId,
            },
          };
        }

        delete newConfig.fields.color;
      }

      return newConfig;
    },
  },
  {
    from: "4.1.0",
    to: "4.2.0",
    description: `all {
      + limits
    }`,
    up: (config) => {
      const newConfig = { ...config, version: "4.2.0" };

      newConfig.limits = {};

      return newConfig;
    },
    down: (config) => {
      const newConfig = { ...config, version: "4.1.0" };

      delete newConfig.limits;

      return newConfig;
    },
  },
  {
    from: "4.2.0",
    to: "4.3.0",
    description: `maps {
      baseLayer {
        + customLayers
      }
    }`,
    up: (config) => {
      const newConfig = { ...config, version: "4.3.0" };

      if (newConfig.chartType === "map") {
        newConfig.baseLayer.customLayers = [];
      }

      return newConfig;
    },
    down: (config) => {
      const newConfig = { ...config, version: "4.2.0" };

      if (newConfig.chartType === "map") {
        delete newConfig.baseLayer.customLayers;
      }

      return newConfig;
    },
  },
];

export const migrateChartConfig = makeMigrate<ChartConfig>(
  chartConfigMigrations,
  {
    defaultToVersion: CHART_CONFIG_VERSION,
  }
);

const makeBumpChartConfigVersionMigration = ({
  fromVersion,
  toVersion,
  fromChartConfigVersion,
  toChartConfigVersion,
}: {
  fromVersion: string;
  toVersion: string;
  fromChartConfigVersion: string;
  toChartConfigVersion: string;
}): Migration => {
  return {
    description: "ALL (bump ChartConfig version)",
    from: fromVersion,
    to: toVersion,
    up: async (config) => {
      const newConfig = { ...config, version: toVersion };
      const chartConfigs = [];

      for (const chartConfig of newConfig.chartConfigs) {
        const migratedChartConfig = await migrateChartConfig(chartConfig, {
          migrationProps: newConfig,
          toVersion: toChartConfigVersion,
        });
        chartConfigs.push(migratedChartConfig);
      }

      newConfig.chartConfigs = chartConfigs;

      return newConfig;
    },
    down: async (config) => {
      const newConfig = { ...config, version: fromVersion };
      const chartConfigs = [];

      for (const chartConfig of newConfig.chartConfigs) {
        const migratedChartConfig = await migrateChartConfig(chartConfig, {
          migrationProps: newConfig,
          toVersion: fromChartConfigVersion,
        });
        chartConfigs.push(migratedChartConfig);
      }

      newConfig.chartConfigs = chartConfigs;

      return newConfig;
    },
  };
};

export const configuratorStateMigrations: Migration[] = [
  {
    description: "ALL",
    from: "1.0.0",
    to: "2.0.0",
    up: async (config) => {
      const newConfig = { ...config, version: "2.0.0" };

      const migratedChartConfig = await migrateChartConfig(
        newConfig.chartConfig,
        {
          migrationProps: newConfig,
          toVersion: "2.0.0",
        }
      );
      newConfig.chartConfigs = [migratedChartConfig];
      delete newConfig.chartConfig;
      delete newConfig.activeField;
      newConfig.meta = {
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
      };
      newConfig.activeChartKey = migratedChartConfig.key;

      return newConfig;
    },
    down: async (config: any) => {
      const newConfig = { ...config, version: "1.0.0" };
      const chartConfig = newConfig.chartConfigs[0];
      delete newConfig.chartConfigs;
      delete newConfig.activeChartKey;
      newConfig.meta = chartConfig.meta;
      newConfig.activeField = chartConfig.activeField;
      const migratedChartConfig = await migrateChartConfig(chartConfig, {
        toVersion: "1.4.2",
      });
      newConfig.chartConfig = migratedChartConfig;

      return newConfig;
    },
  },
  {
    description: "ALL",
    from: "2.0.0",
    to: "3.0.0",
    up: async (config) => {
      const newConfig = { ...config, version: "3.0.0" };
      const chartConfigs = [];

      for (const chartConfig of newConfig.chartConfigs) {
        const migratedChartConfig = await migrateChartConfig(chartConfig, {
          migrationProps: newConfig,
          toVersion: "2.3.0",
        });
        chartConfigs.push(migratedChartConfig);
      }

      delete newConfig.dataSet;
      newConfig.chartConfigs = chartConfigs;

      return newConfig;
    },
    down: async (config) => {
      const newConfig = { ...config, version: "2.0.0" };
      let dataSet: string | undefined;
      const chartConfigs = [];

      for (const chartConfig of newConfig.chartConfigs) {
        if (!dataSet) {
          dataSet = chartConfig.dataSet;
        }

        // Only migrate chartConfigs with the same dataSet as configuratorState.
        if (chartConfig.dataSet === dataSet) {
          const migratedChartConfig = await migrateChartConfig(chartConfig, {
            migrationProps: newConfig,
            toVersion: "2.2.0",
          });
          chartConfigs.push(migratedChartConfig);
        } else {
          console.warn(
            "Cannot migrate chartConfig dataSet to configuratorState dataSet because they are not the same."
          );
        }
      }

      newConfig.dataSet = dataSet;

      return newConfig;
    },
  },
  makeBumpChartConfigVersionMigration({
    fromVersion: "3.0.0",
    toVersion: "3.0.1",
    fromChartConfigVersion: "2.3.0",
    toChartConfigVersion: "3.0.0",
  }),
  {
    description: "ALL + layout",
    from: "3.0.1",
    to: "3.1.0",
    up: (config) => {
      const newConfig = { ...config, version: "3.1.0" };
      newConfig.layout = {
        type: "tab",
        meta: newConfig.meta,
        activeField: undefined,
      };
      delete newConfig.meta;

      return newConfig;
    },
    down: (config) => {
      const newConfig = { ...config, version: "3.0.1" };
      newConfig.meta = newConfig.layout.meta ?? {
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
      };
      delete newConfig.layout;

      return newConfig;
    },
  },
  makeBumpChartConfigVersionMigration({
    fromVersion: "3.1.0",
          toVersion: "3.2.0",
    fromChartConfigVersion: "3.1.0",
    toChartConfigVersion: "3.2.0",
  }),
  {
    description: "ALL (add dataSource in case it's missing)",
    from: "3.2.0",
    to: "3.2.1",
    up: (config) => {
      const newConfig = { ...config, version: "3.2.1" };

      if (!newConfig.dataSource) {
        newConfig.dataSource = {
          type: "sparql",
          url: PROD_DATA_SOURCE_URL,
        };
      } else if (newConfig.dataSource.url === LEGACY_PROD_DATA_SOURCE_URL) {
        newConfig.dataSource.url = PROD_DATA_SOURCE_URL;
      }

      return newConfig;
    },
    down: (config) => {
      const newConfig = { ...config, version: "3.2.0" };

      return newConfig;
    },
  },
  {
    description: "ALL (add dashboardFilters)",
    from: "3.2.1",
    to: "3.3.0",
    up: (config) => {
      const newConfig = {
        ...config,
        version: "3.3.0",
        dashboardFilters: {
          filters: [],
        },
      };

      return newConfig;
    },
    down: (config) => {
      const newConfig = { ...config, version: "3.2.1" };
      delete newConfig.dashboardFilters;

      return newConfig;
    },
  },
  makeBumpChartConfigVersionMigration({
    fromVersion: "3.3.0",
    toVersion: "3.4.0",
    fromChartConfigVersion: "3.2.0",
    toChartConfigVersion: "3.3.0",
  }),
  {
    description: "ALL (modify dashboardFilters)",
    from: "3.4.0",
    to: "3.5.0",
    up: (config) => {
      const oldTimeRangeFilter = config.dashboardFilters.filters[0];
      const newConfig = {
        ...config,
        version: "3.5.0",
        dashboardFilters: {
          timeRange: oldTimeRangeFilter
            ? {
                active: oldTimeRangeFilter.active,
                timeUnit: "",
                presets: {
                  from: oldTimeRangeFilter.from ?? "",
                  to: oldTimeRangeFilter.to ?? "",
                },
              }
            : {
                active: false,
                timeUnit: "",
                presets: {
                  from: "",
                  to: "",
                },
              },
        },
      };

      return newConfig;
    },
    down: (config) => {
      const oldTimeRangeFilter = config.dashboardFilters.timeRange;
      const newConfig = {
        ...config,
        version: "3.4.0",
        dashboardFilters: {
          filters: [
            {
              type: "timeRange",
              active: oldTimeRangeFilter.active,
              componentIri: "",
              presets: {
                type: "range",
                from: oldTimeRangeFilter.presets.from,
                to: oldTimeRangeFilter.presets.to,
              },
            },
          ],
        },
      };

      return newConfig;
    },
  },
  {
    description: "ALL (modify dashboardFilters)",
    from: "3.5.0",
    to: "3.6.0",
    up: (config) => {
      const newConfig = {
        ...config,
        version: "3.6.0",
        dashboardFilters: {
          ...config.dashboardFilters,
          dataFilters: {
            componentIris: [],
            filters: {},
          },
        },
      };

      return newConfig;
    },
    down: (config) => {
      const newConfig = {
        ...config,
        version: "3.5.0",
        dashboardFilters: {
          timeRange: config.dashboardFilters.timeRange,
        },
      };

      return newConfig;
    },
  },
  {
    description: `ALL {
      meta {
        + label
      }
    } & bump ChartConfig version`,
    from: "3.6.0",
    to: "3.7.0",
    up: async (config) => {
      const { layout, ...rest } = config;
      const { meta, ...restLayout } = layout;
      const newConfig = {
        ...rest,
        version: "3.7.0",
        layout: {
          ...restLayout,
          meta: {
            ...meta,
            label: {
              de: "",
              fr: "",
              it: "",
              en: "",
            },
          },
        },
      };

      const chartConfigs = [];

      for (const chartConfig of newConfig.chartConfigs) {
        const migratedChartConfig = await migrateChartConfig(chartConfig, {
          migrationProps: newConfig,
          toVersion: "3.4.0",
        });
        chartConfigs.push(migratedChartConfig);
      }

      newConfig.chartConfigs = chartConfigs;

      return newConfig;
    },
    down: async (config) => {
      const { layout, ...rest } = config;
      const { meta, ...restLayout } = layout.meta;
      const { label, ...restMeta } = meta;
      const newConfig = {
        ...rest,
        version: "3.6.0",
        layout: {
          ...restLayout,
          meta: restMeta,
        },
      };

      const chartConfigs = [];

      for (const chartConfig of newConfig.chartConfigs) {
        const migratedChartConfig = await migrateChartConfig(chartConfig, {
          migrationProps: newConfig,
          toVersion: "3.3.0",
        });
        chartConfigs.push(migratedChartConfig);
      }

      newConfig.chartConfigs = chartConfigs;

      return newConfig;
    },
  },
  {
    description: "ALL (add layoutsMetadata to free canvas layout)",
    from: "3.7.0",
    to: "3.8.0",
    up: (config) => {
      const newConfig = {
        ...config,
        version: "3.8.0",
      };

      if (
        newConfig.layout.type === "dashboard" &&
        newConfig.layout.layout === "canvas"
      ) {
        newConfig.layout.layoutsMetadata = newConfig.chartConfigs.reduce(
          (acc: any, chartConfig: any) => {
            acc[chartConfig.key] = {
              initialized: true,
            };
            return acc;
          },
          {}
        );
      }

      return newConfig;
    },
    down: (config) => {
      const newConfig = {
        ...config,
        version: "3.7.0",
      };

      if (
        newConfig.layout.type === "dashboard" &&
        newConfig.layout.layout === "canvas"
      ) {
        delete newConfig.layout.layoutsMetadata;
      }

      return newConfig;
    },
  },
  {
    description: "ALL (bump ChartConfig version) + migrate dataFilters",
    from: "3.8.0",
    to: "4.0.0",
    up: async (config) => {
      const newConfig = { ...config, version: "4.0.0" };
      const chartConfigs = [];

      for (const chartConfig of newConfig.chartConfigs) {
        const migratedChartConfig = await migrateChartConfig(chartConfig, {
          migrationProps: newConfig,
          toVersion: "4.0.0",
        });
        chartConfigs.push(migratedChartConfig);
      }

      newConfig.chartConfigs = chartConfigs;

      const dataFilters = newConfig.dashboardFilters.dataFilters;

      for (const cIri of dataFilters.componentIris) {
        cubeLoop: for (const cube of newConfig.chartConfigs.flatMap(
          (c: any) => c.cubes
        )) {
          for (const fId of Object.keys(cube.filters)) {
            if (fId.includes(cIri)) {
              dataFilters.componentIris = [
                ...dataFilters.componentIris.filter((c: string) => c !== cIri),
                fId,
              ];
              dataFilters.filters[fId] = dataFilters.filters[cIri];
              delete dataFilters.filters[cIri];
              break cubeLoop;
            }
          }
        }
      }

      dataFilters.componentIds = dataFilters.componentIris;
      delete dataFilters.componentIris;
      newConfig.dashboardFilters.dataFilters = dataFilters;

      return newConfig;
    },
    down: async (config) => {
      const newConfig = { ...config, version: "3.8.0" };
      const chartConfigs = [];

      for (const chartConfig of newConfig.chartConfigs) {
        const migratedChartConfig = await migrateChartConfig(chartConfig, {
          migrationProps: newConfig,
          toVersion: "3.4.0",
        });
        chartConfigs.push(migratedChartConfig);
      }

      newConfig.chartConfigs = chartConfigs;

      const dataFilters = newConfig.dashboardFilters.dataFilters;

      for (const cId of dataFilters.componentIds) {
        dataFilters.componentIds = [
          ...dataFilters.componentIds.filter((c: string) => c !== cId),
          parseComponentId(cId).unversionedComponentIri,
        ];
      }

      for (const fId of Object.keys(dataFilters.filters)) {
        dataFilters.filters[
          parseComponentId(fId as ComponentId).unversionedComponentIri as string
        ] = dataFilters.filters[fId];
        delete dataFilters.filters[fId];
      }

      dataFilters.componentIris = dataFilters.componentIds;
      delete dataFilters.componentIds;
      newConfig.dashboardFilters.dataFilters = dataFilters;

      return newConfig;
    },
  },
  makeBumpChartConfigVersionMigration({
    fromVersion: "4.0.0",
          toVersion: "4.1.0",
    fromChartConfigVersion: "4.0.0",
    toChartConfigVersion: "4.1.0",
  }),
  {
    description: `ALL {
      layout {
        + blocks
        - layoutsMetadata
      }
    }`,
    from: "4.1.0",
    to: "4.2.0",
    up: async (config) => {
      const newConfig = { ...config, version: "4.2.0" };

      if (newConfig.layout.layoutsMetadata) {
        delete newConfig.layout.layoutsMetadata;
      }

      newConfig.layout.blocks = newConfig.chartConfigs.map(
        (chartConfig: any) => {
          return {
            type: "chart",
            key: chartConfig.key,
            initialized: false,
          };
        }
      );

      return newConfig;
    },
    down: async (config) => {
      const newConfig = { ...config, version: "4.1.0" };

      if (
        newConfig.layout.type === "dashboard" &&
        newConfig.layout.layout === "canvas"
      ) {
        newConfig.layout.layoutsMetadata = Object.fromEntries(
          newConfig.layout.blocks.map((block: any) => {
            const { key, initialized } = block;
            return [key, { initialized }];
          })
        );
      }

      delete newConfig.layout.blocks;

      return newConfig;
    },
  },
  makeBumpChartConfigVersionMigration({
    fromVersion: "4.2.0",
          toVersion: "4.3.0",
    fromChartConfigVersion: "4.1.0",
    toChartConfigVersion: "4.2.0",
  }),
  makeBumpChartConfigVersionMigration({
    fromVersion: "4.3.0",
    toVersion: "4.4.0",
    fromChartConfigVersion: "4.2.0",
    toChartConfigVersion: "4.3.0",
  }),
];

export const migrateConfiguratorState = makeMigrate<ConfiguratorState>(
  configuratorStateMigrations,
  {
    defaultToVersion: CONFIGURATOR_STATE_VERSION,
  }
);

function makeMigrate<V>(
  migrations: Migration[],
  options: { defaultToVersion: string }
) {
  const { defaultToVersion } = options;

  return async (
    data: any,
    options: {
      fromVersion?: string;
      toVersion?: string;
      migrationProps?: any;
    } = {}
  ): Promise<V> => {
    const {
      fromVersion,
      toVersion = defaultToVersion,
      migrationProps,
    } = options;
    const migrate = async (
      data: any,
      {
        fromVersion,
      }: {
        fromVersion?: string;
      } = {}
    ): Promise<any> => {
      const fromVersionFinal = fromVersion ?? data.version ?? "1.0.0";
      const direction = upOrDown(fromVersionFinal, toVersion);

      if (direction === "same") {
        return data;
      }

      const migration = migrations.find(
        (d) => d[direction === "up" ? "from" : "to"] === fromVersionFinal
      );

      if (migration) {
        const newData = await migration[direction](data, migrationProps);
        return await migrate(newData, { fromVersion });
      }
    };

    return await migrate(data, { fromVersion });
  };
}

export const upOrDown = (
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
