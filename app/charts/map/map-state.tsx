import { extent } from "d3-array";
import {
  ScaleLinear,
  ScalePower,
  ScaleQuantile,
  scaleQuantile,
  ScaleQuantize,
  scaleQuantize,
  ScaleSequential,
  scaleSequential,
  scaleSqrt,
  ScaleThreshold,
  scaleThreshold,
} from "d3-scale";
import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from "geojson";
import keyBy from "lodash/keyBy";
import mapValues from "lodash/mapValues";
import { useCallback, useMemo } from "react";
import { ckmeans } from "simple-statistics";

import { ChartMapProps } from "@/charts/map/chart-map";
import { getBBox } from "@/charts/map/helpers";
import {
  MapStateData,
  MapStateVariables,
  useMapStateData,
  useMapStateVariables,
} from "@/charts/map/map-state-props";
import { MapTooltipProvider } from "@/charts/map/map-tooltip";
import {
  useOptionalNumericVariable,
  useStringVariable,
} from "@/charts/shared/chart-helpers";
import {
  ChartContext,
  CommonChartState,
  useNumericalYErrorVariables,
} from "@/charts/shared/chart-state";
import { colorToRgbArray } from "@/charts/shared/colors";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useSize } from "@/charts/shared/use-size";
import {
  BBox,
  ColorScaleInterpolationType,
  MapAreaLayer,
  MapSymbolLayer,
  NumericalColorField,
} from "@/config-types";
import {
  Component,
  Dimension,
  GeoData,
  isGeoShapesDimension,
  Measure,
  Observation,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import { getColorInterpolator } from "@/palettes";
import { getFittingColorInterpolator } from "@/utils/color-palette-utils";

export type MapState = CommonChartState &
  MapStateVariables & {
    chartType: "map";
    features: GeoData;
    locked: boolean;
    lockedBBox: BBox | undefined;
    featuresBBox: BBox | undefined;
    showBaseLayer: boolean;
    identicalLayerComponentIds: boolean;
    areaLayer:
      | {
          data: Observation[];
          dataDomain: [number, number];
          getLabel: (d: Observation) => string;
          colors: AreaLayerColors;
        }
      | undefined;
    symbolLayer:
      | {
          data: Observation[];
          dataDomain: [number, number];
          measureDimension?: Measure;
          measureLabel: string;
          getLabel: (d: Observation) => string;
          getValue: (d: Observation) => number | null;
          getFormattedError: null | ((d: Observation) => string | undefined);
          radiusScale: ScalePower<number, number>;
          colors: SymbolLayerColors;
        }
      | undefined;
  };

const useMapState = (
  chartProps: ChartMapProps,
  variables: MapStateVariables,
  data: MapStateData
): MapState => {
  const { width } = useSize();
  const { chartConfig, measures, dimensions } = chartProps;
  const { chartData, scalesData, allData, features } = data;
  const { fields, baseLayer } = chartConfig;
  const { areaLayer, symbolLayer } = fields;

  const areaLayerState = useLayerState({
    field: areaLayer,
    componentId: fields.areaLayer?.componentId,
    measureId: fields.areaLayer?.color.componentId,
    data: scalesData,
    features,
    dimensions,
    measures,
  });

  const areaColors = useColors({
    color: areaLayer?.color,
    data: areaLayerState.data,
    dimensions,
    measures,
  });

  const preparedAreaLayerState: MapState["areaLayer"] = useMemo(() => {
    if (areaLayer?.componentId === undefined) {
      return;
    }

    return {
      data: areaLayerState.data,
      dataDomain: areaLayerState.dataDomain,
      getLabel: areaLayerState.getLabel,
      colors: areaColors as unknown as AreaLayerColors,
    };
  }, [areaColors, areaLayer, areaLayerState]);

  const symbolLayerState = useLayerState({
    field: symbolLayer,
    componentId: symbolLayer?.componentId,
    measureId: symbolLayer?.measureId,
    data: scalesData,
    features,
    dimensions,
    measures,
  });

  const symbolColors = useColors({
    color: symbolLayer?.color,
    data: symbolLayerState.data,
    dimensions,
    measures,
  });

  const radiusScale = useMemo(() => {
    // Measure dimension is undefined. Can be useful when the user wants to
    // encode only the color of symbols, and the size is irrelevant.
    if (symbolLayerState.dataDomain[1] === undefined) {
      return scaleSqrt().range([0, 12]).unknown(12);
    }

    const baseScale = scaleSqrt()
      .domain([0, symbolLayerState.dataDomain[1]])
      .range([0, 24]);

    const wrappedScale = (x: number | null) => {
      if (x === null || x === undefined) return 0;
      if (x === 0) return 0;
      const scaled = baseScale(x);
      return Math.max(2, scaled);
    };

    Object.assign(wrappedScale, baseScale);

    return wrappedScale;
  }, [symbolLayerState.dataDomain]) as ScalePower<number, number>;

  const preparedSymbolLayerState: MapState["symbolLayer"] = useMemo(() => {
    if (symbolLayer?.componentId === undefined) {
      return;
    }

    return {
      ...symbolLayerState,
      colors: symbolColors as SymbolLayerColors,
      radiusScale,
    };
  }, [symbolLayer?.componentId, symbolLayerState, radiusScale, symbolColors]);

  const identicalLayerComponentIds =
    areaLayer?.componentId !== undefined &&
    symbolLayer?.componentId !== undefined &&
    areaLayer.componentId === symbolLayer.componentId;

  const height = width * 0.5;
  const bounds = {
    width,
    height,
    aspectRatio: height / width,
    margins: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    chartWidth: width,
    chartHeight: width * 0.5,
  };

  const featuresBBox = useMemo(() => {
    return getBBox(
      areaLayer?.componentId !== undefined
        ? filterFeatureCollection(
            features.areaLayer?.shapes,
            (f) => !!f?.properties?.observation
          )
        : undefined,
      symbolLayer?.componentId !== undefined
        ? features.symbolLayer?.points.filter(
            (p) => !!p?.properties?.observation
          )
        : undefined
    );
  }, [
    areaLayer?.componentId,
    features.areaLayer?.shapes,
    symbolLayer?.componentId,
    features.symbolLayer?.points,
  ]);

  return {
    chartType: "map",
    chartData,
    allData,
    bounds,
    features,
    showBaseLayer: baseLayer.show,
    locked: baseLayer.locked || false,
    lockedBBox: baseLayer.bbox,
    featuresBBox,
    identicalLayerComponentIds,
    areaLayer: preparedAreaLayerState,
    symbolLayer: preparedSymbolLayerState,
    ...variables,
  };
};

type AreaLayerColors =
  | {
      type: "categorical";
      paletteId: string;
      component: Dimension;
      domain: string[];
      getValue: (d: Observation) => string;
      getColor: (d: Observation) => number[];
      useAbbreviations: boolean;
    }
  | {
      type: "continuous";
      paletteId: string;
      component: Measure;
      domain: [number, number];
      // Needed for the legend.
      scale:
        | ScaleSequential<string>
        | ScaleQuantize<string>
        | ScaleQuantile<string>
        | ScaleLinear<string, string>
        | ScaleThreshold<number, string>;
      interpolationType: ColorScaleInterpolationType;
      getValue: (d: Observation) => number | null;
      getColor: (d: Observation) => number[];
      getFormattedError: null | ((d: Observation) => string);
    };

type SymbolLayerColors =
  | { type: "fixed"; getColor: (d: Observation) => number[] }
  | AreaLayerColors;

const getNumericalColorScale = ({
  color,
  getValue,
  data,
  dataDomain,
}: {
  color: NumericalColorField;
  getValue: (d: Observation) => number | null;
  data: Observation[];
  dataDomain: [number, number];
}) => {
  const interpolator = getFittingColorInterpolator(
    { color },
    getColorInterpolator
  );

  switch (color.scaleType) {
    case "continuous":
      switch (color.interpolationType) {
        case "linear":
          return scaleSequential(interpolator).domain(dataDomain);
      }
    case "discrete":
      const range = Array.from({ length: color.nbClass }, (_, i) =>
        interpolator(i / (color.nbClass - 1))
      );

      switch (color.interpolationType) {
        case "jenks":
          const ckMeansThresholds = ckmeans(
            data.map((d) => getValue(d) ?? null).filter(truthy),
            Math.min(color.nbClass, data.length)
          ).map((v) => v.pop() || 0);

          return scaleThreshold<number, string>()
            .domain(ckMeansThresholds)
            .range(range);
        case "quantile":
          return scaleQuantile<string>()
            .domain(data.map((d) => getValue(d)))
            .range(range);
        case "quantize":
          return scaleQuantize<string>().domain(dataDomain).range(range);
      }
    default:
      const _exhaustiveCheck: never = color;
      return _exhaustiveCheck;
  }
};

const useFixedColors = (colorSpec: MapSymbolLayer["color"] | undefined) => {
  return useMemo(() => {
    if (colorSpec?.type !== "fixed") {
      return;
    }

    const color = colorToRgbArray(colorSpec.value, colorSpec.opacity * 2.55);

    return {
      type: "fixed" as const,
      getColor: () => color,
    };
  }, [colorSpec]);
};

const useCategoricalColors = (
  colorSpec: MapSymbolLayer["color"] | undefined,
  {
    dimensions,
    measures,
  }: {
    dimensions: Dimension[];
    measures: Measure[];
  }
) => {
  return useMemo(() => {
    if (colorSpec?.type !== "categorical") {
      return;
    }

    const component = [...dimensions, ...measures].find(
      (d) => d.id === colorSpec.componentId
    ) as Component;
    const valuesByLabel = keyBy(component.values, (d) => d.label);
    const valuesByAbbreviationOrLabel = keyBy(
      component.values,
      colorSpec.useAbbreviations
        ? (d) => d.alternateName ?? d.label
        : (d) => d.label
    );
    const domain = component.values.map((d) => `${d.value}`) ?? [];
    const rgbColorMapping = mapValues(colorSpec.colorMapping, (c) =>
      colorToRgbArray(c, colorSpec.opacity * 2.55)
    );
    const getDimensionValue = (d: Observation) => {
      const abbreviationOrLabel = d[colorSpec.componentId] as string;

      return (
        valuesByAbbreviationOrLabel[abbreviationOrLabel] ??
        valuesByLabel[abbreviationOrLabel]
      );
    };

    return {
      type: "categorical" as const,
      paletteId: colorSpec.paletteId,
      component,
      domain,
      getValue: colorSpec.useAbbreviations
        ? (d: Observation) => {
            const v = getDimensionValue(d);
            return v.alternateName || v.label;
          }
        : (d: Observation) => {
            return getDimensionValue(d).label;
          },
      getColor: (d: Observation) => {
        const value = getDimensionValue(d);
        return rgbColorMapping[value.value];
      },
      useAbbreviations: colorSpec.useAbbreviations ?? false,
    };
  }, [colorSpec, dimensions, measures]);
};

const useNumericalColors = (
  colorSpec: MapSymbolLayer["color"] | undefined,
  {
    data,
    dimensions,
    measures,
  }: {
    data: Observation[];
    dimensions: Dimension[];
    measures: Measure[];
  }
) => {
  const componentId =
    colorSpec?.type === "numerical" ? colorSpec.componentId : "";
  const conversionFactor =
    colorSpec?.type === "numerical"
      ? (colorSpec.unitConversion?.factor ?? 1)
      : 1;
  const getValue = useCallback(
    (d: Observation) =>
      d[componentId] !== null
        ? Number(d[componentId]) * conversionFactor
        : null,
    [componentId, conversionFactor]
  );
  const { getFormattedYUncertainty } = useNumericalYErrorVariables(
    { componentId },
    { getValue, dimensions, measures }
  );

  return useMemo(() => {
    if (colorSpec?.type !== "numerical") {
      return;
    }

    const component = measures.find((d) => d.id === componentId) as Measure;
    const domain = extent(data.map(getValue).filter(truthy)) as [
      number,
      number,
    ];
    const colorScale = getNumericalColorScale({
      color: colorSpec,
      getValue,
      data,
      dataDomain: domain,
    });

    return {
      type: "continuous" as const,
      paletteId: colorSpec.paletteId,
      component,
      scale: colorScale,
      interpolationType: colorSpec.interpolationType,
      getValue,
      getColor: (d: Observation) => {
        const value = getValue(d);

        if (value !== null) {
          const c = colorScale(value);

          if (c) {
            return colorToRgbArray(c, colorSpec.opacity * 2.55);
          }
        }

        return [0, 0, 0, 255 * 0.1];
      },
      getFormattedError: getFormattedYUncertainty,
      domain,
    };
  }, [
    colorSpec,
    componentId,
    data,
    getFormattedYUncertainty,
    getValue,
    measures,
  ]);
};

const useColors = ({
  color,
  data,
  dimensions,
  measures,
}: {
  color?: MapSymbolLayer["color"];
  data: Observation[];
  dimensions: Dimension[];
  measures: Measure[];
}) => {
  const fixedColors = useFixedColors(color);
  const categoricalColors = useCategoricalColors(color, {
    dimensions,
    measures,
  });
  const numericalColors = useNumericalColors(color, {
    data,
    dimensions,
    measures,
  });

  if (!color) {
    return undefined;
  }

  switch (color.type) {
    case "fixed":
      return fixedColors;
    case "categorical":
      return categoricalColors;
    case "numerical":
      return numericalColors;
    default:
      const _exhaustiveCheck: never = color;
      return _exhaustiveCheck;
  }
};

const usePreparedData = ({
  geoDimensionId,
  getLabel,
  data,
  dimensions,
  features,
}: {
  geoDimensionId: string;
  getLabel: (d: Observation) => string;
  data: Observation[];
  dimensions: Dimension[];
  features: GeoData;
}) => {
  return useMemo(() => {
    if (geoDimensionId === "") {
      return [];
    }

    const dimension = dimensions.find((d) => d.id === geoDimensionId);

    if (
      isGeoShapesDimension(dimension) &&
      features.areaLayer?.shapes?.features
    ) {
      const hierarchyLabels = features.areaLayer.shapes.features.map(
        (d) => d.properties.label
      );

      return data.filter((d) => hierarchyLabels.includes(getLabel(d)));
    }

    return data;
  }, [
    geoDimensionId,
    getLabel,
    data,
    dimensions,
    features.areaLayer?.shapes.features,
  ]);
};

const useLayerState = ({
  field,
  componentId = "",
  measureId = "",
  data,
  features,
  dimensions,
  measures,
}: {
  field: MapAreaLayer | MapSymbolLayer | undefined;
  componentId: string | undefined;
  measureId: string | undefined;
  data: Observation[];
  features: GeoData;
  dimensions: Dimension[];
  measures: Measure[];
}) => {
  const getLabel = useStringVariable(componentId);
  const getRawValue = useOptionalNumericVariable(measureId);
  const unitConversion =
    field && "unitConversion" in field ? field.unitConversion : undefined;
  const getValue = useCallback(
    (d: Observation) => {
      const rawValue = getRawValue(d);

      if (rawValue === null) {
        return null;
      }

      return unitConversion ? rawValue * unitConversion.factor : rawValue;
    },
    [getRawValue, unitConversion]
  );
  const measureDimension = measures.find((d) => d.id === measureId);

  const { showYUncertainty, getFormattedYUncertainty } =
    useNumericalYErrorVariables(
      { componentId: measureId },
      { getValue, dimensions, measures }
    );

  const preparedData = usePreparedData({
    geoDimensionId: componentId,
    getLabel,
    data,
    dimensions,
    features,
  });
  const dataDomain = useMemo(() => {
    return (extent(preparedData, (d) => getValue(d)) || [0, 100]) as [
      number,
      number,
    ];
  }, [getValue, preparedData]);

  return {
    data: preparedData,
    dataDomain,
    measureDimension,
    measureLabel: measureDimension?.label || "",
    getLabel,
    getValue,
    getFormattedError: showYUncertainty ? getFormattedYUncertainty : null,
  };
};

const filterFeatureCollection = <TFeatureCollection extends FeatureCollection>(
  fc: TFeatureCollection | undefined,
  predicate: (feature: Feature<Geometry, GeoJsonProperties>) => boolean
) => {
  if (!fc) {
    return fc;
  }
  return {
    ...fc,
    features: fc.features.filter(predicate),
  };
};

const MapChartProvider = (props: React.PropsWithChildren<ChartMapProps>) => {
  const { children, ...chartProps } = props;
  const variables = useMapStateVariables(chartProps);
  const data = useMapStateData(chartProps, variables);
  const state = useMapState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const MapChart = (props: React.PropsWithChildren<ChartMapProps>) => {
  const { children, ...rest } = props;

  return (
    <InteractionProvider>
      <MapChartProvider {...rest}>
        <MapTooltipProvider>{children}</MapTooltipProvider>
      </MapChartProvider>
    </InteractionProvider>
  );
};
