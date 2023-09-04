import { t } from "@lingui/macro";
import { group } from "d3";
import get from "lodash/get";
import setWith from "lodash/setWith";
import unset from "lodash/unset";

import { DEFAULT_SORTING, initializeMapLayerField } from "@/charts";
import { DEFAULT_FIXED_COLOR_FIELD } from "@/charts/map/constants";
import {
  checkForMissingValuesInSegments,
  getSegment,
} from "@/charts/shared/chart-helpers";
import {
  AreaConfig,
  ChartConfig,
  ChartSubType,
  ChartType,
  ColorField,
  ColorScaleType,
  ColumnConfig,
  ColumnSegmentField,
  ComponentType,
  ConfiguratorStateConfiguringChart,
  GenericField,
  LineConfig,
  MapConfig,
  PaletteType,
  PieConfig,
  ScatterPlotConfig,
  SortingOrder,
  SortingType,
  TableConfig,
  getAnimationField,
  isSortingInConfig,
  makeMultiFilter,
} from "@/config-types";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import {
  Observation,
  canDimensionBeMultiFiltered,
  isNumericalMeasure,
  isOrdinalMeasure,
  isTemporalDimension,
  isTemporalOrdinalDimension,
} from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { getDefaultCategoricalPaletteName } from "@/palettes";

/**
 * This module controls chart controls displayed in the UI.
 * Related to config-types.ts.
 */

type BaseEncodingFieldType = "animation";
type MapEncodingFieldType = "baseLayer" | "areaLayer" | "symbolLayer";
type XYEncodingFieldType = "x" | "y" | "segment";
export type EncodingFieldType =
  | BaseEncodingFieldType
  | MapEncodingFieldType
  | XYEncodingFieldType;

type OnEncodingOptionChange<V, T extends ChartConfig = ChartConfig> = (
  value: V,
  options: {
    draft: Omit<ConfiguratorStateConfiguringChart, "chartConfig"> & {
      chartConfig: T;
    };
    dimensions: DimensionMetadataFragment[];
    measures: DimensionMetadataFragment[];
    field: EncodingFieldType;
  }
) => void;

export type EncodingOptionChartSubType<T extends ChartConfig = ChartConfig> = {
  field: "chartSubType";
  getValues: (
    chartConfig: T,
    dimensions: DimensionMetadataFragment[]
  ) => {
    value: ChartSubType;
    disabled: boolean;
    warnMessage?: string;
  }[];
  onChange: OnEncodingOptionChange<ChartSubType, T>;
};

type EncodingOption<T extends ChartConfig = ChartConfig> =
  | EncodingOptionChartSubType<T>
  | {
      field: "calculation";
      getDisabledState?: (chartConfig: T) => {
        disabled: boolean;
        warnMessage?: string;
      };
    }
  | {
      field: "colorPalette";
    }
  | EncodingOptionColorComponent
  | EncodingOptionImputation<T>
  | {
      field: "showStandardError";
    }
  | {
      field: "sorting";
    }
  | {
      field: "size";
      componentTypes: ComponentType[];
      optional: boolean;
    }
  | {
      field: "useAbbreviations";
    };

const onColorComponentScaleTypeChange: OnEncodingOptionChange<
  ColorScaleType,
  MapConfig
> = (value, { draft, field }) => {
  const basePath = `chartConfig.fields.${field}`;
  const interpolationTypePath = `${basePath}.color.interpolationType`;
  const nbClassPath = `${basePath}.color.nbClass`;

  if (value === "continuous") {
    setWith(draft, interpolationTypePath, "linear", Object);
    unset(draft, nbClassPath);
  } else if (value === "discrete") {
    setWith(draft, interpolationTypePath, "jenks", Object);
    setWith(draft, nbClassPath, 3, Object);
  }
};

const onColorComponentIriChange: OnEncodingOptionChange<string, MapConfig> = (
  iri,
  { draft, dimensions, measures, field }
) => {
  const basePath = `chartConfig.fields.${field}`;
  const components = [...dimensions, ...measures];
  let newField: ColorField = DEFAULT_FIXED_COLOR_FIELD;
  const component = components.find((d) => d.iri === iri);
  const currentColorComponentIri = get(draft, `${basePath}.color.componentIri`);

  if (component) {
    const colorPalette: PaletteType | undefined = get(
      draft,
      `${basePath}.color.palette`
    );

    if (canDimensionBeMultiFiltered(component) || isOrdinalMeasure(component)) {
      const palette = getDefaultCategoricalPaletteName(component, colorPalette);
      newField = {
        type: "categorical",
        componentIri: iri,
        palette,
        colorMapping: mapValueIrisToColor({
          palette,
          dimensionValues: component.values,
        }),
      };
    } else if (isNumericalMeasure(component)) {
      newField = {
        type: "numerical",
        componentIri: iri,
        palette: colorPalette ?? "oranges",
        scaleType: "continuous",
        interpolationType: "linear",
      };
    }
  }

  // Remove old filter.
  unset(draft, `chartConfig.filters["${currentColorComponentIri}"]`);
  setWith(draft, `${basePath}.color`, newField, Object);
};

type EncodingOptionColorComponent = {
  field: "colorComponent";
  optional: boolean;
  componentTypes: ComponentType[];
  enableUseAbbreviations: boolean;
  onComponentIriChange: OnEncodingOptionChange<string, MapConfig>;
  onScaleTypeChange: OnEncodingOptionChange<ColorScaleType, MapConfig>;
};

type EncodingOptionImputation<T extends ChartConfig = ChartConfig> = {
  field: "imputation";
  shouldShow: (chartConfig: T, data: Observation[]) => boolean;
};
/**
 * @todo
 * - Differentiate sorting within chart vs. sorting legend / tooltip only
 */
export type EncodingSortingOption<T extends ChartConfig = ChartConfig> = {
  sortingType: SortingType;
  sortingOrder: SortingOrder[];
  getDisabledState?: (chartConfig: T) => {
    disabled: boolean;
    warnMessage?: string;
  };
};

type OnEncodingChange<T extends ChartConfig = ChartConfig> = (
  iri: string,
  options: {
    draft: Omit<ConfiguratorStateConfiguringChart, "chartConfig"> & {
      chartConfig: T;
    };
    dimensions: DimensionMetadataFragment[];
    measures: DimensionMetadataFragment[];
    initializing: boolean;
    selectedValues: any[];
    field: EncodingFieldType;
  }
) => void;

export interface EncodingSpec<T extends ChartConfig = ChartConfig> {
  field: EncodingFieldType;
  optional: boolean;
  componentTypes: ComponentType[];
  /** If false, using a dimension in this encoding will not prevent it to be used in an other encoding. Default: true */
  exclusive?: boolean;
  filters: boolean;
  disableInteractiveFilters?: boolean;
  sorting?: EncodingSortingOption<T>[];
  options?: {
    [K in EncodingOption["field"]]?: Omit<
      Extract<EncodingOption<T>, { field: K }>,
      "field"
    >;
  };
  onChange?: OnEncodingChange<T>;
  getDisabledState?: (
    chartConfig: T,
    components: DimensionMetadataFragment[],
    observations: Observation[]
  ) => {
    disabled: boolean;
    warnMessage?: string;
  };
}

// dataFilters is enabled by default
type InteractiveFilterType = "legend" | "timeRange" | "animation";

export interface ChartSpec<T extends ChartConfig = ChartConfig> {
  chartType: ChartType;
  encodings: EncodingSpec<T>[];
  interactiveFilters: InteractiveFilterType[];
}

interface ChartSpecs {
  area: ChartSpec<AreaConfig>;
  column: ChartSpec<ColumnConfig>;
  line: ChartSpec<LineConfig>;
  map: ChartSpec<MapConfig>;
  pie: ChartSpec<PieConfig>;
  scatterplot: ChartSpec<ScatterPlotConfig>;
  table: ChartSpec<TableConfig>;
}

const SEGMENT_COMPONENT_TYPES: ComponentType[] = [
  "NominalDimension",
  "OrdinalDimension",
  "TemporalOrdinalDimension",
  "GeoCoordinatesDimension",
  "GeoShapesDimension",
];

const getDefaultSegmentSorting = <
  T extends ChartConfig = ChartConfig
>(): EncodingSortingOption<T>[] => [
  {
    sortingType: "byAuto",
    sortingOrder: ["asc", "desc"],
  },
  {
    sortingType: "byDimensionLabel",
    sortingOrder: ["asc", "desc"],
  },
  {
    sortingType: "byTotalSize",
    sortingOrder: ["asc", "desc"],
    getDisabledState: (
      chartConfig
    ): {
      disabled: boolean;
      warnMessage?: string;
    } => {
      const animationPresent = !!getAnimationField(chartConfig);

      if (animationPresent) {
        return {
          disabled: true,
          warnMessage: t({
            id: "controls.sorting.byTotalSize.disabled-by-animation",
            message: "Sorting by total size is disabled during animation.",
          }),
        };
      }

      return {
        disabled: false,
      };
    },
  },
];

export const AREA_SEGMENT_SORTING = getDefaultSegmentSorting<AreaConfig>();

const LINE_SEGMENT_SORTING: EncodingSortingOption<LineConfig>[] = [
  { sortingType: "byAuto", sortingOrder: ["asc", "desc"] },
  { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
];

export const COLUMN_SEGMENT_SORTING = getDefaultSegmentSorting<ColumnConfig>();

export const PIE_SEGMENT_SORTING: EncodingSortingOption<PieConfig>[] = [
  { sortingType: "byAuto", sortingOrder: ["asc", "desc"] },
  { sortingType: "byMeasure", sortingOrder: ["asc", "desc"] },
  { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
];

export const ANIMATION_FIELD_SPEC: EncodingSpec<
  ColumnConfig | MapConfig | ScatterPlotConfig | PieConfig
> = {
  field: "animation",
  optional: true,
  componentTypes: ["TemporalDimension", "TemporalOrdinalDimension"],
  filters: true,
  disableInteractiveFilters: true,
  onChange: (iri, { draft, initializing }) => {
    if (initializing || !draft.chartConfig.fields.animation) {
      draft.chartConfig.fields.animation = {
        componentIri: iri,
        showPlayButton: true,
        duration: 30,
        type: "continuous",
        dynamicScales: false,
      };
    } else {
      draft.chartConfig.fields.animation.componentIri = iri;
    }
  },
  getDisabledState: (
    chartConfig,
    components
  ): {
    disabled: boolean;
    warnMessage?: string;
  } => {
    const temporalDimensions = components.filter((d) => {
      return isTemporalDimension(d) || isTemporalOrdinalDimension(d);
    });
    const noTemporalDimensions = temporalDimensions.length === 0;

    if (noTemporalDimensions) {
      return {
        disabled: true,
        warnMessage: t({
          id: "controls.section.animation.no-temporal-dimensions",
          message: "There is no dimension that can be animated.",
        }),
      };
    }

    const fieldComponentsMap = Object.fromEntries(
      Object.entries<GenericField>(chartConfig.fields)
        .filter((d) => d[0] !== "animation")
        .map(([k, v]) => [v.componentIri, k])
    );
    const temporalFieldComponentIris = temporalDimensions.filter((d) => {
      return fieldComponentsMap[d.iri];
    });

    if (temporalDimensions.length === temporalFieldComponentIris.length) {
      return {
        disabled: true,
        warnMessage: t({
          id: "controls.section.animation.no-available-temporal-dimensions",
          message: `There are no available temporal dimensions to use. Change some of the following encodings: {fields} to enable animation.`,
          values: {
            fields: temporalFieldComponentIris
              .map((d) => `»${getFieldLabel(fieldComponentsMap[d.iri])}«`)
              .join(", "),
          },
        }),
      };
    }

    if (
      isSortingInConfig(chartConfig) &&
      chartConfig.fields.segment?.sorting?.sortingType === "byTotalSize"
    ) {
      return {
        disabled: true,
        warnMessage: t({
          id: "controls.section.animation.disabled-by-sorting",
          message: "Animation is disabled when sorting by total size.",
        }),
      };
    }

    return {
      disabled: false,
    };
  },
};

const isMissingDataPresent = (chartConfig: AreaConfig, data: Observation[]) => {
  const { fields } = chartConfig;
  const grouped = group(
    data.filter((d) => {
      const y = d[fields.y.componentIri];
      return y !== null && y !== undefined;
    }),
    (d) => d[fields.x.componentIri] as string
  );
  const segments = Array.from(
    new Set(data.map((d) => getSegment(fields.segment?.componentIri)(d)))
  );

  return checkForMissingValuesInSegments(grouped, segments);
};

export const disableStacked = (d?: DimensionMetadataFragment): boolean => {
  return d?.scaleType !== "Ratio";
};

const defaultSegmentOnChange: OnEncodingChange<
  | AreaConfig
  | ColumnConfig
  | LineConfig
  | ScatterPlotConfig
  | PieConfig
  | TableConfig
> = (iri, { draft, dimensions, measures, initializing, selectedValues }) => {
  const components = [...dimensions, ...measures];
  const component = components.find((d) => d.iri === iri);
  const palette = getDefaultCategoricalPaletteName(
    component,
    draft.chartConfig.fields.segment &&
      "palette" in draft.chartConfig.fields.segment
      ? draft.chartConfig.fields.segment.palette
      : undefined
  );
  const colorMapping = mapValueIrisToColor({
    palette,
    dimensionValues: selectedValues,
  });
  const multiFilter = makeMultiFilter(selectedValues.map((d) => d.value));

  if (initializing) {
    draft.chartConfig.fields.segment = {
      componentIri: iri,
      palette,
      sorting: DEFAULT_SORTING,
      colorMapping,
    };
  } else if (
    draft.chartConfig.fields.segment &&
    "palette" in draft.chartConfig.fields.segment
  ) {
    draft.chartConfig.fields.segment.componentIri = iri;
    draft.chartConfig.fields.segment.colorMapping = colorMapping;
  }

  draft.chartConfig.filters[iri] = multiFilter;
};

const onMapFieldChange: OnEncodingChange<MapConfig> = (
  iri,
  { draft, dimensions, measures, field }
) => {
  initializeMapLayerField({
    chartConfig: draft.chartConfig,
    field,
    componentIri: iri,
    dimensions,
    measures,
  });
};

export const getChartSpec = <T extends ChartConfig>(
  chartConfig: T
): ChartSpec<T> => {
  return chartConfigOptionsUISpec[chartConfig.chartType] as ChartSpec<T>;
};

const chartConfigOptionsUISpec: ChartSpecs = {
  area: {
    chartType: "area",
    encodings: [
      {
        field: "y",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
        onChange: (iri, { draft, measures }) => {
          const yMeasure = measures.find((d) => d.iri === iri);

          if (disableStacked(yMeasure)) {
            delete draft.chartConfig.fields.segment;
          }
        },
      },
      {
        field: "x",
        optional: false,
        componentTypes: ["TemporalDimension"],
        filters: true,
      },
      {
        field: "segment",
        optional: true,
        componentTypes: SEGMENT_COMPONENT_TYPES,
        filters: true,
        sorting: AREA_SEGMENT_SORTING,
        onChange: defaultSegmentOnChange,
        getDisabledState: (chartConfig, components, data) => {
          const yIri = chartConfig.fields.y.componentIri;
          const yDimension = components.find((d) => d.iri === yIri);
          const disabledStacked = disableStacked(yDimension);

          if (disabledStacked) {
            return {
              disabled: true,
              warnMessage: t({
                id: "controls.segment.stacked.disabled-by-scale-type",
                message:
                  "Stacked layout can only be enabled if the vertical axis dimension has a ratio scale.",
              }),
            };
          }

          const missingDataPresent = isMissingDataPresent(chartConfig, data);
          const imputationType = chartConfig.fields.y.imputationType;
          const disabled = false;
          const warnMessage =
            missingDataPresent && (!imputationType || imputationType === "none")
              ? t({
                  id: "controls.section.imputation.explanation",
                  message:
                    "For this chart type, replacement values should be assigned to missing values. Decide on the imputation logic or switch to another chart type.",
                })
              : undefined;

          return {
            disabled,
            warnMessage,
          };
        },
        options: {
          calculation: {},
          colorPalette: {},
          imputation: {
            shouldShow: (chartConfig, data) => {
              return isMissingDataPresent(chartConfig, data);
            },
          },
          useAbbreviations: {},
        },
      },
    ],
    interactiveFilters: ["legend", "timeRange"],
  },
  column: {
    chartType: "column",
    encodings: [
      {
        field: "y",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
        onChange: (iri, { draft, measures }) => {
          if (draft.chartConfig.fields.segment?.type === "stacked") {
            const yMeasure = measures.find((d) => d.iri === iri);

            if (disableStacked(yMeasure)) {
              setWith(
                draft,
                "chartConfig.fields.segment.type",
                "grouped",
                Object
              );

              if (draft.chartConfig.interactiveFiltersConfig?.calculation) {
                setWith(
                  draft,
                  "chartConfig.interactiveFiltersConfig.calculation",
                  { active: false, type: "identity" },
                  Object
                );
              }
            }
          }
        },
        options: {
          showStandardError: {},
        },
      },
      {
        field: "x",
        optional: false,
        componentTypes: [
          "TemporalDimension",
          "TemporalOrdinalDimension",
          "NominalDimension",
          "OrdinalDimension",
          "GeoCoordinatesDimension",
          "GeoShapesDimension",
        ],
        filters: true,
        sorting: [
          { sortingType: "byAuto", sortingOrder: ["asc", "desc"] },
          { sortingType: "byMeasure", sortingOrder: ["asc", "desc"] },
          { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
        ],
        onChange: (iri, { draft, dimensions }) => {
          const component = dimensions.find((d) => d.iri === iri);

          if (!isTemporalDimension(component)) {
            setWith(
              draft,
              `chartConfig.interactiveFiltersConfig.timeRange.active`,
              false,
              Object
            );
          }
        },
        options: {
          useAbbreviations: {},
        },
      },
      {
        field: "segment",
        optional: true,
        componentTypes: SEGMENT_COMPONENT_TYPES,
        filters: true,
        sorting: COLUMN_SEGMENT_SORTING,
        onChange: (iri, options) => {
          const { draft, dimensions, measures, initializing } = options;
          defaultSegmentOnChange(iri, options);

          if (!initializing) {
            return;
          }

          const components = [...dimensions, ...measures];
          const segment: ColumnSegmentField = get(
            draft,
            "chartConfig.fields.segment"
          );
          const yComponent = components.find(
            (d) => d.iri === draft.chartConfig.fields.y.componentIri
          );
          setWith(
            draft,
            "chartConfig.fields.segment",
            {
              ...segment,
              type: disableStacked(yComponent) ? "grouped" : "stacked",
            },
            Object
          );
        },
        options: {
          calculation: {
            getDisabledState: (chartConfig) => {
              const grouped = chartConfig.fields.segment?.type === "grouped";

              return {
                disabled: grouped,
                warnMessage: grouped
                  ? t({
                      id: "controls.calculation.disabled-by-grouped",
                      message:
                        "100% mode cannot be used with a grouped layout.",
                    })
                  : undefined,
              };
            },
          },
          chartSubType: {
            getValues: (chartConfig, dimensions) => {
              const yIri = chartConfig.fields.y.componentIri;
              const yDimension = dimensions.find((d) => d.iri === yIri);
              const disabledStacked = disableStacked(yDimension);

              return [
                {
                  value: "stacked",
                  disabled: disabledStacked,
                  warnMessage: disabledStacked
                    ? t({
                        id: "controls.segment.stacked.disabled-by-scale-type",
                        message:
                          "Stacked layout can only be enabled if the vertical axis dimension has a ratio scale.",
                      })
                    : undefined,
                },
                {
                  value: "grouped",
                  disabled: false,
                },
              ];
            },
            onChange: (d, { draft }) => {
              if (
                draft.chartConfig.interactiveFiltersConfig &&
                d === "grouped"
              ) {
                const path = "chartConfig.interactiveFiltersConfig.calculation";
                setWith(draft, path, { active: false, type: "identity" });
              }
            },
          },
          colorPalette: {},
          useAbbreviations: {},
        },
      },
    ],
    interactiveFilters: ["legend", "timeRange", "animation"],
  },
  line: {
    chartType: "line",
    encodings: [
      {
        field: "y",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
      },
      {
        field: "x",
        optional: false,
        componentTypes: ["TemporalDimension"],
        filters: true,
      },
      {
        field: "segment",
        optional: true,
        componentTypes: SEGMENT_COMPONENT_TYPES,
        filters: true,
        sorting: LINE_SEGMENT_SORTING,
        onChange: defaultSegmentOnChange,
        options: {
          colorPalette: {},
          useAbbreviations: {},
        },
      },
    ],
    interactiveFilters: ["legend", "timeRange"],
  },
  map: {
    chartType: "map",
    encodings: [
      // Should this even be an encoding when it's not mapped to a component?
      {
        field: "baseLayer",
        optional: true,
        componentTypes: [],
        filters: false,
      },
      {
        field: "areaLayer",
        optional: true,
        componentTypes: ["GeoShapesDimension"],
        exclusive: false,
        filters: true,
        onChange: onMapFieldChange,
        options: {
          colorComponent: {
            componentTypes: [
              "NumericalMeasure",
              "OrdinalMeasure",
              "TemporalOrdinalDimension",
            ],
            optional: false,
            enableUseAbbreviations: true,
            onComponentIriChange: onColorComponentIriChange,
            onScaleTypeChange: onColorComponentScaleTypeChange,
          },
        },
      },
      {
        field: "symbolLayer",
        optional: true,
        componentTypes: ["GeoCoordinatesDimension", "GeoShapesDimension"],
        exclusive: false,
        filters: true,
        onChange: onMapFieldChange,
        options: {
          colorComponent: {
            componentTypes: [
              "NumericalMeasure",
              "OrdinalMeasure",
              "GeoCoordinatesDimension",
              "GeoShapesDimension",
              "NominalDimension",
              "OrdinalDimension",
              "TemporalOrdinalDimension",
            ],
            optional: true,
            enableUseAbbreviations: true,
            onComponentIriChange: onColorComponentIriChange,
            onScaleTypeChange: onColorComponentScaleTypeChange,
          },
          size: {
            componentTypes: ["NumericalMeasure"],
            optional: true,
          },
        },
      },
    ],
    interactiveFilters: ["animation"],
  },
  pie: {
    chartType: "pie",
    encodings: [
      {
        field: "y",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
      },
      {
        field: "segment",
        optional: false,
        componentTypes: SEGMENT_COMPONENT_TYPES,
        filters: true,
        sorting: PIE_SEGMENT_SORTING,
        onChange: defaultSegmentOnChange,
        options: {
          colorPalette: {},
          useAbbreviations: {},
        },
      },
    ],
    interactiveFilters: ["legend", "animation"],
  },
  scatterplot: {
    chartType: "scatterplot",
    encodings: [
      {
        field: "x",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
      },
      {
        field: "y",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
      },
      {
        field: "segment",
        optional: true,
        componentTypes: SEGMENT_COMPONENT_TYPES,
        filters: true,
        onChange: defaultSegmentOnChange,
        options: {
          colorPalette: {},
          useAbbreviations: {},
        },
      },
    ],
    interactiveFilters: ["legend", "animation"],
  },
  table: {
    // TODO: Add abbreviations here.
    chartType: "table",
    encodings: [],
    interactiveFilters: [],
  },
};

export const getChartFieldChangeSideEffect = (
  chartConfig: ChartConfig,
  field: EncodingFieldType
): OnEncodingChange | undefined => {
  const chartSpec = getChartSpec(chartConfig);
  const encoding = chartSpec.encodings.find((d) => d.field === field);

  return encoding?.onChange;
};

export const getChartFieldOptionChangeSideEffect = (
  chartConfig: ChartConfig,
  field: EncodingFieldType,
  path: string
): OnEncodingOptionChange<any> | undefined => {
  const chartSpec = getChartSpec(chartConfig);
  const encoding = chartSpec.encodings.find((d) => d.field === field);

  switch (`${field}.${path}`) {
    case "segment.type":
      return get(encoding, "options.chartSubType.onChange");
    case "areaLayer.color.componentIri":
    case "symbolLayer.color.componentIri":
      return get(encoding, "options.colorComponent.onComponentIriChange");
    case "areaLayer.color.scaleType":
    case "symbolLayer.color.scaleType":
      return get(encoding, "options.colorComponent.onScaleTypeChange");
  }
};
