import { extent } from "d3-array";
import {
  ScaleLinear,
  ScalePower,
  ScaleQuantile,
  ScaleQuantize,
  ScaleSequential,
  ScaleThreshold,
  scaleQuantile,
  scaleQuantize,
  scaleSequential,
  scaleSqrt,
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
import { useMemo } from "react";
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
import { ChartContext, CommonChartState } from "@/charts/shared/chart-state";
import { colorToRgbArray } from "@/charts/shared/colors";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useSize } from "@/charts/shared/use-size";
import {
  BBox,
  CategoricalColorField,
  ColorScaleInterpolationType,
  FixedColorField,
  MapSymbolLayer,
  NumericalColorField,
} from "@/config-types";
import {
  getErrorMeasure,
  useErrorMeasure,
  useErrorVariable,
} from "@/configurator/components/ui-helpers";
import {
  Component,
  Dimension,
  GeoData,
  Measure,
  Observation,
  ObservationValue,
  findRelatedErrorDimension,
  isGeoShapesDimension,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";
import { getColorInterpolator } from "@/palettes";

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
          errorDimension?: Component;
          getFormattedError: null | ((d: Observation) => string);
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
      return undefined;
    }

    return {
      data: areaLayerState.data,
      dataDomain: areaLayerState.dataDomain,
      getLabel: areaLayerState.getLabel,
      colors: areaColors as AreaLayerColors,
    };
  }, [areaColors, areaLayer, areaLayerState]);

  const symbolLayerState = useLayerState({
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
    // Measure dimension is undefined. Can be useful when the user want to
    // encode only the color of symbols, and the size is irrelevant.
    if (symbolLayerState.dataDomain[1] === undefined) {
      return scaleSqrt().range([0, 12]).unknown(12);
    } else {
      return scaleSqrt()
        .domain([0, symbolLayerState.dataDomain[1]])
        .range([0, 24]);
    }
  }, [symbolLayerState.dataDomain]) as ScalePower<number, number>;

  const preparedSymbolLayerState: MapState["symbolLayer"] = useMemo(() => {
    if (symbolLayer?.componentId === undefined) {
      return undefined;
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
            (f) => f?.properties?.observation !== undefined
          )
        : undefined,
      symbolLayer?.componentId !== undefined
        ? features.symbolLayer?.points.filter(
            (p) => p?.properties?.observation !== undefined
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
      palette: string;
      component: Dimension;
      domain: string[];
      getValue: (d: Observation) => string;
      getColor: (d: Observation) => number[];
      useAbbreviations: boolean;
    }
  | {
      type: "continuous";
      palette: string;
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
  const interpolator = getColorInterpolator(color.palette);

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

const getFixedColors = (color: FixedColorField) => {
  const c = colorToRgbArray(color.value, color.opacity * 2.55);
  return { type: "fixed" as const, getColor: (_: Observation) => c };
};

const getCategoricalColors = (
  color: CategoricalColorField,
  dimensions: Dimension[],
  measures: Measure[]
) => {
  const component = [...dimensions, ...measures].find(
    (d) => d.id === color.componentId
  ) as Component;
  const valuesByLabel = keyBy(component.values, (d) => d.label);
  const valuesByAbbreviationOrLabel = keyBy(
    component.values,
    color.useAbbreviations ? (d) => d.alternateName ?? d.label : (d) => d.label
  );
  const domain: string[] = component.values.map((d) => `${d.value}`) || [];
  const rgbColorMapping = mapValues(color.colorMapping, (c) =>
    colorToRgbArray(c, color.opacity * 2.55)
  );
  const getDimensionValue = (d: Observation) => {
    const abbreviationOrLabel = d[color.componentId] as string;

    return (
      valuesByAbbreviationOrLabel[abbreviationOrLabel] ??
      valuesByLabel[abbreviationOrLabel]
    );
  };

  return {
    type: "categorical" as const,
    palette: color.palette,
    component,
    domain,
    getValue: color.useAbbreviations
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
    useAbbreviations: color.useAbbreviations ?? false,
  };
};

const getNumericalColors = (
  color: NumericalColorField,
  data: Observation[],
  dimensions: Dimension[],
  measures: Measure[],
  { formatNumber }: { formatNumber: ReturnType<typeof useFormatNumber> }
) => {
  const component = measures.find((d) => d.id === color.componentId) as Measure;
  const domain = extent(
    data.map((d) => d[color.componentId]),
    (d) => +d!
  ) as [number, number];
  const getValue = (d: Observation) =>
    d[color.componentId] !== null ? Number(d[color.componentId]) : null;
  const colorScale = getNumericalColorScale({
    color,
    getValue,
    data,
    dataDomain: domain,
  });
  const errorDimension = findRelatedErrorDimension(
    color.componentId,
    dimensions
  );
  const errorMeasure = getErrorMeasure(
    { dimensions, measures },
    color.componentId
  );
  const getError = errorMeasure ? (d: Observation) => d[errorMeasure.id] : null;
  const getFormattedError = makeErrorFormatter(
    getError,
    formatNumber,
    errorDimension?.unit
  );

  return {
    type: "continuous" as const,
    palette: color.palette,
    component,
    scale: colorScale,
    interpolationType: color.interpolationType,
    getValue,
    getColor: (d: Observation) => {
      const c = colorScale(+d[color.componentId]!);

      if (c) {
        return colorToRgbArray(c, color.opacity * 2.55);
      }

      return [0, 0, 0, 255 * 0.1];
    },
    getFormattedError,
    domain,
  };
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
  const formatNumber = useFormatNumber();

  return useMemo(() => {
    if (!color) {
      return undefined;
    }

    switch (color.type) {
      case "fixed":
        return getFixedColors(color);
      case "categorical":
        return getCategoricalColors(color, dimensions, measures);
      case "numerical":
        return getNumericalColors(color, data, dimensions, measures, {
          formatNumber,
        });
    }
  }, [color, data, dimensions, measures, formatNumber]);
};

const makeErrorFormatter = (
  getter: ((d: Observation) => ObservationValue) | null,
  formatter: (n: number) => string,
  unit?: string | null
) => {
  if (!getter) {
    return null;
  } else {
    return (d: Observation) => {
      const error = getter(d);
      return formatNumberWithUnit(error as number, formatter, unit);
    };
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
  componentId = "",
  measureId = "",
  data,
  features,
  dimensions,
  measures,
}: {
  componentId: string | undefined;
  measureId: string | undefined;
  data: Observation[];
  features: GeoData;
  dimensions: Dimension[];
  measures: Measure[];
}) => {
  const formatNumber = useFormatNumber();

  const getLabel = useStringVariable(componentId);
  const getValue = useOptionalNumericVariable(measureId);

  const measureDimension = measures.find((d) => d.id === measureId);

  const errorDimension = findRelatedErrorDimension(measureId, dimensions);
  const errorMeasure = useErrorMeasure(measureId, {
    dimensions,
    measures,
  });
  const getError = useErrorVariable(errorMeasure);
  const getFormattedError = makeErrorFormatter(
    getError,
    formatNumber,
    errorDimension?.unit
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
    errorDimension,
    getFormattedError,
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
