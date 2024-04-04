import { extent } from "d3-array";
import { color as makeColor } from "d3-color";
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
import { Observer, useWidth } from "@/charts/shared/use-width";
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
    identicalLayerComponentIris: boolean;
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
  const width = useWidth();
  const { chartConfig, measures, dimensions } = chartProps;
  const { chartData, scalesData, allData, features } = data;
  const { fields, baseLayer } = chartConfig;
  const { areaLayer, symbolLayer } = fields;

  const areaLayerState = useLayerState({
    componentIri: fields.areaLayer?.componentIri,
    measureIri: fields.areaLayer?.color.componentIri,
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
    if (areaLayer?.componentIri === undefined) {
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
    componentIri: symbolLayer?.componentIri,
    measureIri: symbolLayer?.measureIri,
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
    if (symbolLayer?.componentIri === undefined) {
      return undefined;
    }

    return {
      ...symbolLayerState,
      colors: symbolColors as SymbolLayerColors,
      radiusScale,
    };
  }, [symbolLayer?.componentIri, symbolLayerState, radiusScale, symbolColors]);

  const identicalLayerComponentIris =
    areaLayer?.componentIri !== undefined &&
    symbolLayer?.componentIri !== undefined &&
    areaLayer.componentIri === symbolLayer.componentIri;

  const bounds = {
    width,
    height: width * 0.5,
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
      areaLayer?.componentIri !== undefined
        ? filterFeatureCollection(
            features.areaLayer?.shapes,
            (f) => f?.properties?.observation !== undefined
          )
        : undefined,
      symbolLayer?.componentIri !== undefined
        ? features.symbolLayer?.points.filter(
            (p) => p?.properties?.observation !== undefined
          )
        : undefined
    );
  }, [
    areaLayer?.componentIri,
    features.areaLayer?.shapes,
    symbolLayer?.componentIri,
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
    identicalLayerComponentIris,
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
  return { type: "fixed" as "fixed", getColor: (_: Observation) => c };
};

const getCategoricalColors = (
  color: CategoricalColorField,
  dimensions: Dimension[],
  measures: Measure[]
) => {
  const component = [...dimensions, ...measures].find(
    (d) => d.iri === color.componentIri
  ) as Component;
  const valuesByLabel = keyBy(component.values, (d) => d.label);
  const valuesByAbbreviationOrLabel = keyBy(
    component.values,
    color.useAbbreviations ? (d) => d.alternateName ?? d.label : (d) => d.label
  );
  const domain: string[] = component.values.map((d) => `${d.value}`) || [];
  const rgbColorMapping = mapValues(color.colorMapping, (d) =>
    colorToRgbArray(d)
  );
  const getDimensionValue = (d: Observation) => {
    const abbreviationOrLabel = d[color.componentIri] as string;

    return (
      valuesByAbbreviationOrLabel[abbreviationOrLabel] ||
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
  const component = measures.find(
    (d) => d.iri === color.componentIri
  ) as Measure;
  const domain = extent(
    data.map((d) => d[color.componentIri]),
    (d) => +d!
  ) as [number, number];
  const getValue = (d: Observation) =>
    d[color.componentIri] !== null ? Number(d[color.componentIri]) : null;
  const colorScale = getNumericalColorScale({
    color,
    getValue,
    data,
    dataDomain: domain,
  });
  const errorDimension = findRelatedErrorDimension(
    color.componentIri,
    dimensions
  );
  const errorMeasure = getErrorMeasure(
    { dimensions, measures },
    color.componentIri
  );
  const getError = errorMeasure
    ? (d: Observation) => d[errorMeasure.iri]
    : null;
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
      const c = colorScale(+d[color.componentIri]!);

      if (c) {
        const rgb = makeColor(c)?.rgb();
        return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
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
  geoDimensionIri,
  getLabel,
  data,
  dimensions,
  features,
}: {
  geoDimensionIri: string;
  getLabel: (d: Observation) => string;
  data: Observation[];
  dimensions: Dimension[];
  features: GeoData;
}) => {
  return useMemo(() => {
    if (geoDimensionIri === "") {
      return [];
    }

    const dimension = dimensions.find((d) => d.iri === geoDimensionIri);

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
    geoDimensionIri,
    getLabel,
    data,
    dimensions,
    features.areaLayer?.shapes.features,
  ]);
};

const useLayerState = ({
  componentIri = "",
  measureIri = "",
  data,
  features,
  dimensions,
  measures,
}: {
  componentIri: string | undefined;
  measureIri: string | undefined;
  data: Observation[];
  features: GeoData;
  dimensions: Dimension[];
  measures: Measure[];
}) => {
  const formatNumber = useFormatNumber();

  const getLabel = useStringVariable(componentIri);
  const getValue = useOptionalNumericVariable(measureIri);

  const measureDimension = measures.find((d) => d.iri === measureIri);

  const errorDimension = findRelatedErrorDimension(measureIri, dimensions);
  const errorMeasure = useErrorMeasure(measureIri, {
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
    geoDimensionIri: componentIri,
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
    <Observer>
      <InteractionProvider>
        <MapChartProvider {...rest}>
          <MapTooltipProvider>{children}</MapTooltipProvider>
        </MapChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
