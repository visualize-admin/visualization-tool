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
  ComboLineColumnConfig,
  ComboLineDualConfig,
  ComboLineSingleConfig,
  ComponentType,
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
  Component,
  Dimension,
  Measure,
  Observation,
  canDimensionBeMultiFiltered,
  isNumericalMeasure,
  isOrdinalMeasure,
  isTemporalDimension,
  isTemporalOrdinalDimension,
} from "@/domain/data";
import { getDefaultCategoricalPaletteName, getPalette } from "@/palettes";

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
    chartConfig: T;
    dimensions: Dimension[];
    measures: Measure[];
    field: EncodingFieldType;
  }
) => void;

export type EncodingOptionChartSubType<T extends ChartConfig = ChartConfig> = {
  field: "chartSubType";
  getValues: (
    chartConfig: T,
    dimensions: Component[]
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
    }
  // TODO: As these are quite chart type specific, they might be handled in
  // some other way.
  | {
      field: "lineAxisOrientation";
      onChange: OnEncodingOptionChange<"left" | "right", ComboLineColumnConfig>;
    }
  | {
      field: "componentIris";
      onChange: OnEncodingOptionChange<string[], ComboLineSingleConfig>;
    }
  | {
      field: "leftAxisComponentIri";
      onChange: OnEncodingOptionChange<string, ComboLineDualConfig>;
    }
  | {
      field: "rightAxisComponentIri";
      onChange: OnEncodingOptionChange<string, ComboLineDualConfig>;
    }
  | {
      field: "lineComponentIri";
      onChange: OnEncodingOptionChange<string, ComboLineColumnConfig>;
    }
  | {
      field: "columnComponentIri";
      onChange: OnEncodingOptionChange<string, ComboLineColumnConfig>;
    };

const onColorComponentScaleTypeChange: OnEncodingOptionChange<
  ColorScaleType,
  MapConfig
> = (value, { chartConfig, field }) => {
  const basePath = `fields.${field}`;
  const interpolationTypePath = `${basePath}.color.interpolationType`;
  const nbClassPath = `${basePath}.color.nbClass`;

  if (value === "continuous") {
    setWith(chartConfig, interpolationTypePath, "linear", Object);
    unset(chartConfig, nbClassPath);
  } else if (value === "discrete") {
    setWith(chartConfig, interpolationTypePath, "jenks", Object);
    setWith(chartConfig, nbClassPath, 3, Object);
  }
};

const onColorComponentIriChange: OnEncodingOptionChange<string, MapConfig> = (
  iri,
  { chartConfig, dimensions, measures, field }
) => {
  const basePath = `fields["${field}"]`;
  const components = [...dimensions, ...measures];
  let newField: ColorField = DEFAULT_FIXED_COLOR_FIELD;
  const component = components.find((d) => d.iri === iri);
  const currentColorComponentIri = get(
    chartConfig,
    `${basePath}.color.componentIri`
  );

  if (component) {
    const colorPalette: PaletteType | undefined = get(
      chartConfig,
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

    // Remove old filter.
    const cube = chartConfig.cubes.find((d) => d.iri === component.cubeIri);

    if (cube) {
      unset(cube, `filters["${currentColorComponentIri}"]`);
    }
  }

  setWith(chartConfig, `${basePath}.color`, newField, Object);
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
    chartConfig: T;
    dimensions: Dimension[];
    measures: Measure[];
    initializing: boolean;
    selectedValues: any[];
    field: EncodingFieldType;
  }
) => void;

export interface EncodingSpec<T extends ChartConfig = ChartConfig> {
  field: EncodingFieldType;
  optional: boolean;
  componentTypes: ComponentType[];
  /** Used to find component iri inside the encoding. Particularly useful for fields that may contain several components. */
  iriAttributes: string[];
  /** If true, won't use the ChartFieldOption component, but a custom one. Needs to be handled then in ChartOptionsSelector. */
  customComponent?: boolean;
  /** If false, using a dimension in this encoding will not prevent it to be used in an other encoding. Default: true */
  exclusive?: boolean;
  filters: boolean;
  disableInteractiveFilters?: boolean;
  sorting?: EncodingSortingOption<T>[];
  hide?: boolean;
  options?: {
    [K in EncodingOption["field"]]?: Omit<
      Extract<EncodingOption<T>, { field: K }>,
      "field"
    >;
  };
  onChange?: OnEncodingChange<T>;
  getDisabledState?: (
    chartConfig: T,
    components: Component[],
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
  comboLineSingle: ChartSpec<ComboLineSingleConfig>;
  comboLineDual: ChartSpec<ComboLineDualConfig>;
  comboLineColumn: ChartSpec<ComboLineColumnConfig>;
}

const SEGMENT_COMPONENT_TYPES: ComponentType[] = [
  "NominalDimension",
  "OrdinalDimension",
  "TemporalDimension",
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
  iriAttributes: [],
  componentTypes: ["TemporalDimension", "TemporalOrdinalDimension"],
  filters: true,
  hide: true,
  disableInteractiveFilters: true,
  onChange: (iri, { chartConfig, initializing }) => {
    if (initializing || !chartConfig.fields.animation) {
      chartConfig.fields.animation = {
        componentIri: iri,
        showPlayButton: true,
        duration: 30,
        type: "continuous",
        dynamicScales: false,
      };
    } else {
      chartConfig.fields.animation.componentIri = iri;
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
              .map((d) => getFieldLabel(fieldComponentsMap[d.iri]))
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

export const disableStacked = (d?: Component): boolean => {
  return d?.scaleType !== "Ratio";
};

export const defaultSegmentOnChange: OnEncodingChange<
  | AreaConfig
  | ColumnConfig
  | LineConfig
  | ScatterPlotConfig
  | PieConfig
  | TableConfig
> = (iri, { chartConfig, dimensions, measures, selectedValues }) => {
  const components = [...dimensions, ...measures];
  const component = components.find((d) => d.iri === iri);
  const palette = getDefaultCategoricalPaletteName(
    component,
    chartConfig.fields.segment && "palette" in chartConfig.fields.segment
      ? chartConfig.fields.segment.palette
      : undefined
  );
  const colorMapping = mapValueIrisToColor({
    palette,
    dimensionValues: component ? component.values : selectedValues,
  });

  if (chartConfig.fields.segment && "palette" in chartConfig.fields.segment) {
    chartConfig.fields.segment.componentIri = iri;
    chartConfig.fields.segment.colorMapping = colorMapping;
  } else {
    chartConfig.fields.segment = {
      componentIri: iri,
      palette,
      sorting: DEFAULT_SORTING,
      colorMapping,
    };
  }

  if (!selectedValues.length || !component) {
    return;
  }

  const multiFilter = makeMultiFilter(selectedValues.map((d) => d.value));
  const cube = chartConfig.cubes.find((d) => d.iri === component.cubeIri);

  if (cube) {
    cube.filters[iri] = multiFilter;
  }
};

const onMapFieldChange: OnEncodingChange<MapConfig> = (
  iri,
  { chartConfig, dimensions, measures, field }
) => {
  initializeMapLayerField({
    chartConfig,
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
        iriAttributes: ["componentIri"],
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
        onChange: (iri, { chartConfig, measures }) => {
          const yMeasure = measures.find((d) => d.iri === iri);

          if (disableStacked(yMeasure)) {
            delete chartConfig.fields.segment;
          }
        },
      },
      {
        field: "x",
        iriAttributes: ["componentIri"],
        optional: false,
        componentTypes: ["TemporalDimension"],
        filters: true,
      },
      {
        field: "segment",
        optional: true,
        iriAttributes: ["componentIri"],
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
        iriAttributes: ["componentIri"],
        componentTypes: ["NumericalMeasure"],
        filters: false,
        onChange: (iri, { chartConfig, measures }) => {
          if (chartConfig.fields.segment?.type === "stacked") {
            const yMeasure = measures.find((d) => d.iri === iri);

            if (disableStacked(yMeasure)) {
              setWith(chartConfig, "fields.segment.type", "grouped", Object);

              if (chartConfig.interactiveFiltersConfig?.calculation) {
                setWith(
                  chartConfig,
                  "interactiveFiltersConfig.calculation",
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
        iriAttributes: ["componentIri"],
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
        onChange: (iri, { chartConfig, dimensions }) => {
          const component = dimensions.find((d) => d.iri === iri);

          if (!isTemporalDimension(component)) {
            setWith(
              chartConfig,
              "interactiveFiltersConfig.timeRange.active",
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
        iriAttributes: ["componentIri"],
        componentTypes: SEGMENT_COMPONENT_TYPES,
        filters: true,
        sorting: COLUMN_SEGMENT_SORTING,
        onChange: (iri, options) => {
          const { chartConfig, dimensions, measures } = options;
          defaultSegmentOnChange(iri, options);

          const components = [...dimensions, ...measures];
          const segment: ColumnSegmentField = get(
            chartConfig,
            "fields.segment"
          );
          const yComponent = components.find(
            (d) => d.iri === chartConfig.fields.y.componentIri
          );
          setWith(
            chartConfig,
            "fields.segment",
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
            onChange: (d, { chartConfig }) => {
              if (chartConfig.interactiveFiltersConfig && d === "grouped") {
                const path = "interactiveFiltersConfig.calculation";
                setWith(chartConfig, path, { active: false, type: "identity" });
              }
            },
          },
          colorPalette: {},
          useAbbreviations: {},
        },
      },
      ANIMATION_FIELD_SPEC,
    ],
    interactiveFilters: ["legend", "timeRange", "animation"],
  },
  line: {
    chartType: "line",
    encodings: [
      {
        iriAttributes: ["componentIri"],
        field: "y",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
      },
      {
        iriAttributes: ["componentIri"],
        field: "x",
        optional: false,
        componentTypes: ["TemporalDimension"],
        filters: true,
      },
      {
        iriAttributes: ["componentIri"],
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
        iriAttributes: ["componentIri"],
        field: "baseLayer",
        optional: true,
        componentTypes: [],
        filters: false,
      },
      {
        iriAttributes: ["componentIri"],
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
        iriAttributes: ["componentIri"],
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
      ANIMATION_FIELD_SPEC,
    ],
    interactiveFilters: ["animation"],
  },
  pie: {
    chartType: "pie",
    encodings: [
      {
        iriAttributes: ["componentIri"],
        field: "y",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
      },
      {
        iriAttributes: ["componentIri"],
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
      ANIMATION_FIELD_SPEC,
    ],
    interactiveFilters: ["legend", "animation"],
  },
  scatterplot: {
    chartType: "scatterplot",
    encodings: [
      {
        iriAttributes: ["componentIri"],
        field: "x",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
      },
      {
        iriAttributes: ["componentIri"],
        field: "y",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
      },
      {
        iriAttributes: ["componentIri"],
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
      ANIMATION_FIELD_SPEC,
    ],
    interactiveFilters: ["legend", "animation"],
  },
  table: {
    // TODO: Add abbreviations here.
    chartType: "table",
    encodings: [],
    interactiveFilters: [],
  },
  comboLineSingle: {
    chartType: "comboLineSingle",
    encodings: [
      {
        iriAttributes: ["componentIris"],
        field: "y",
        optional: false,
        // TODO: maybe we should even create the components here?
        customComponent: true,
        componentTypes: ["NumericalMeasure"],
        filters: false,
        options: {
          componentIris: {
            onChange: (iris, options) => {
              const { chartConfig } = options;
              const { fields } = chartConfig;
              const { y } = fields;
              const palette = getPalette(y.palette);
              const newColorMapping = Object.fromEntries(
                iris.map((iri, i) => [iri, y.colorMapping[i] ?? palette[i]])
              );
              chartConfig.fields.y.colorMapping = newColorMapping;
            },
          },
        },
      },
      {
        iriAttributes: ["componentIri"],

        field: "x",
        optional: false,
        componentTypes: ["TemporalDimension"],
        filters: true,
      },
    ],
    interactiveFilters: [],
  },
  comboLineDual: {
    chartType: "comboLineDual",
    encodings: [
      {
        field: "y",
        iriAttributes: ["leftAxisComponentIri", "rightAxisComponentIri"],
        optional: false,
        customComponent: true,
        componentTypes: ["NumericalMeasure"],
        filters: false,
        options: {
          leftAxisComponentIri: {
            onChange: (iri, options) => {
              const { chartConfig } = options;
              const { fields } = chartConfig;
              const { y } = fields;
              chartConfig.fields.y.colorMapping = {
                [iri]: y.colorMapping[y.leftAxisComponentIri],
                [y.rightAxisComponentIri]:
                  y.colorMapping[y.rightAxisComponentIri],
              };
            },
          },
          rightAxisComponentIri: {
            onChange: (iri, options) => {
              const { chartConfig } = options;
              const { fields } = chartConfig;
              const { y } = fields;
              chartConfig.fields.y.colorMapping = {
                [y.leftAxisComponentIri]:
                  y.colorMapping[y.leftAxisComponentIri],
                [iri]: y.colorMapping[y.rightAxisComponentIri],
              };
            },
          },
        },
      },
      {
        iriAttributes: ["componentIri"],
        field: "x",
        optional: false,
        componentTypes: ["TemporalDimension"],
        filters: true,
      },
    ],
    interactiveFilters: [],
  },
  comboLineColumn: {
    chartType: "comboLineColumn",
    encodings: [
      {
        field: "y",
        optional: false,
        customComponent: true,
        iriAttributes: ["lineComponentIri", "columnComponentIri"],
        componentTypes: ["NumericalMeasure"],
        filters: false,
        options: {
          lineComponentIri: {
            onChange: (iri, options) => {
              const { chartConfig } = options;
              const { fields } = chartConfig;
              const { y } = fields;
              const lineColor = y.colorMapping[y.lineComponentIri];
              const columnColor = y.colorMapping[y.columnComponentIri];

              chartConfig.fields.y.colorMapping =
                y.lineAxisOrientation === "left"
                  ? { [iri]: lineColor, [y.columnComponentIri]: columnColor }
                  : { [y.columnComponentIri]: columnColor, [iri]: lineColor };
            },
          },
          columnComponentIri: {
            onChange: (iri, options) => {
              const { chartConfig } = options;
              const { fields } = chartConfig;
              const { y } = fields;
              const columnColor = y.colorMapping[y.columnComponentIri];
              const lineColor = y.colorMapping[y.lineComponentIri];

              chartConfig.fields.y.colorMapping =
                y.lineAxisOrientation === "left"
                  ? { [y.lineComponentIri]: lineColor, [iri]: columnColor }
                  : { [iri]: columnColor, [y.lineComponentIri]: lineColor };
            },
          },
          lineAxisOrientation: {
            onChange: (_, options) => {
              const { chartConfig } = options;
              const { fields } = chartConfig;
              const { y } = fields;
              const lineAxisLeft = y.lineAxisOrientation === "left";
              // Need the correct order to not enable "Reset color palette" button.
              const firstIri = lineAxisLeft
                ? y.columnComponentIri
                : y.lineComponentIri;
              const secondIri = lineAxisLeft
                ? y.lineComponentIri
                : y.columnComponentIri;

              chartConfig.fields.y.colorMapping = {
                [firstIri]: y.colorMapping[secondIri],
                [secondIri]: y.colorMapping[firstIri],
              };
            },
          },
        },
      },
      {
        field: "x",
        iriAttributes: ["componentIri"],
        optional: false,
        componentTypes: ["TemporalDimension"],
        filters: true,
      },
    ],
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
    case "y.componentIris":
      return get(encoding, "options.componentIris.onChange");
    case "y.lineAxisOrientation":
      return get(encoding, "options.lineAxisOrientation.onChange");
    case "y.leftAxisComponentIri":
      return get(encoding, "options.leftAxisComponentIri.onChange");
    case "y.rightAxisComponentIri":
      return get(encoding, "options.rightAxisComponentIri.onChange");
    case "y.lineComponentIri":
      return get(encoding, "options.lineComponentIri.onChange");
    case "y.columnComponentIri":
      return get(encoding, "options.columnComponentIri.onChange");
  }
};
