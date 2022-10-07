import {
  color as makeColor,
  extent,
  ScaleLinear,
  scaleLinear,
  ScalePower,
  ScaleQuantile,
  scaleQuantile,
  ScaleQuantize,
  scaleQuantize,
  scaleSequential,
  ScaleSequential,
  scaleSqrt,
  ScaleThreshold,
  scaleThreshold,
} from "d3";
import keyBy from "lodash/keyBy";
import mapValues from "lodash/mapValues";
import { ReactNode, useCallback, useMemo } from "react";
import { ckmeans } from "simple-statistics";

import { MapTooltipProvider } from "@/charts/map/map-tooltip";
import {
  useOptionalNumericVariable,
  useStringVariable,
} from "@/charts/shared/chart-helpers";
import { ChartContext, ChartProps } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Bounds, Observer, useWidth } from "@/charts/shared/use-width";
import {
  formatNumberWithUnit,
  getColorInterpolator,
  getErrorMeasure,
  getSingleHueSequentialPalette,
  useErrorMeasure,
  useErrorVariable,
  useFormatNumber,
} from "@/configurator/components/ui-helpers";
import {
  BaseLayer,
  BBox,
  ColorMapping,
  ColorScaleInterpolationType,
  DivergingPaletteType,
  MapFields,
  MapSymbolLayer,
  SequentialPaletteType,
} from "@/configurator/config-types";
import {
  findRelatedErrorDimension,
  GeoData,
  isGeoShapesDimension,
  Observation,
  ObservationValue,
} from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

import { convertHexToRgbArray } from "../shared/colors";

import { getBBox } from "./helpers";

export interface MapState {
  chartType: "map";
  bounds: Bounds;
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
        measureDimension?: DimensionMetadataFragment;
        measureLabel: string;
        getLabel: (d: Observation) => string;
        getValue: (d: Observation) => number | null;
        errorDimension?: DimensionMetadataFragment;
        getFormattedError: null | ((d: Observation) => string);
        getColor: (x: number | null) => number[];
        colorScale:
          | ScaleSequential<string>
          | ScaleQuantize<string>
          | ScaleQuantile<string>
          | ScaleLinear<string, string>
          | ScaleThreshold<number, string>;
        colorScaleInterpolationType: ColorScaleInterpolationType;
        palette: DivergingPaletteType | SequentialPaletteType;
        nbClass: number;
      }
    | undefined;
  symbolLayer:
    | {
        data: Observation[];
        dataDomain: [number, number];
        measureDimension?: DimensionMetadataFragment;
        measureLabel: string;
        getLabel: (d: Observation) => string;
        getValue: (d: Observation) => number | null;
        errorDimension?: DimensionMetadataFragment;
        getFormattedError: null | ((d: Observation) => string);
        radiusScale: ScalePower<number, number>;
        colors:
          | {
              type: "fixed";
              getColor: (d: Observation) => number[];
            }
          | {
              type: "categorical";
              palette: string;
              component: DimensionMetadataFragment;
              domain: string[];
              getColor: (d: Observation) => number[];
            }
          | {
              type: "continuous";
              palette: string;
              component: DimensionMetadataFragment;
              domain: [number, number];
              getColor: (d: Observation) => number[];
              getFormattedError: null | ((d: Observation) => string);
            };
      }
    | undefined;
}

const getAreaColorScale = ({
  scaleInterpolationType,
  palette,
  getValue,
  data,
  dataDomain,
  nbClass,
}: {
  scaleInterpolationType: ColorScaleInterpolationType;
  palette: DivergingPaletteType | SequentialPaletteType;
  getValue: (x: Observation) => number | null;
  data: Observation[];
  dataDomain: [number, number];
  nbClass: number;
}) => {
  const interpolator = getColorInterpolator(palette);
  const getDiscreteRange = () => {
    return Array.from({ length: nbClass }, (_, i) =>
      interpolator(i / (nbClass - 1))
    );
  };

  switch (scaleInterpolationType) {
    case "linear":
      return scaleSequential(interpolator).domain(dataDomain);
    case "quantize":
      return scaleQuantize<string>()
        .domain(dataDomain)
        .range(getDiscreteRange());
    case "quantile":
      return scaleQuantile<string>()
        .domain(data.map((d) => getValue(d)))
        .range(getDiscreteRange());
    case "jenks":
      const ckMeansThresholds = ckmeans(
        data.map((d) => getValue(d) ?? NaN),
        Math.min(nbClass, data.length)
      ).map((v) => v.pop() || 0);

      return scaleThreshold<number, string>()
        .domain(ckMeansThresholds)
        .range(getDiscreteRange());
    default:
      const paletteDomain = getSingleHueSequentialPalette({
        palette,
        nbClass: 9,
      });

      return scaleLinear<string>()
        .domain(dataDomain)
        .range([paletteDomain[0], paletteDomain[paletteDomain.length - 1]]);
  }
};

const getFixedSymbolColors = ({
  value,
  opacity,
}: {
  type: "fixed";
  value: string;
  opacity: number;
}) => {
  const color = convertHexToRgbArray(value, opacity * 2.55);
  return {
    type: "fixed",
    getColor: (_: Observation) => color,
  } as const;
};

const getCategoricalSymbolColors = (
  {
    palette,
    componentIri,
    colorMapping,
  }: {
    type: "categorical";
    palette: string;
    componentIri: string;
    colorMapping: ColorMapping;
  },
  dimensions: DimensionMetadataFragment[]
) => {
  const component = dimensions.find(
    (d) => d.iri === componentIri
  ) as DimensionMetadataFragment;
  const componentValuesByLabel = keyBy(component.values, (d) => d.label);
  const domain: string[] = component.values.map((d) => d.value) || [];
  const rgbColorMapping = mapValues(colorMapping, (d) =>
    convertHexToRgbArray(d)
  );

  return {
    type: "categorical",
    palette,
    component,
    domain,
    getColor: (d: Observation) => {
      const label = d[componentIri] as string;
      const value = componentValuesByLabel[label].value;
      return rgbColorMapping[value];
    },
  } as const;
};

const getContinousSymbolColors = (
  {
    palette,
    componentIri,
  }: {
    type: "continuous";
    palette: string;
    componentIri: string;
  },
  data: Observation[],
  dimensions: DimensionMetadataFragment[],
  measures: DimensionMetadataFragment[],
  { formatNumber }: { formatNumber: ReturnType<typeof useFormatNumber> }
) => {
  const component = measures.find(
    (d) => d.iri === componentIri
  ) as DimensionMetadataFragment;
  const domain = extent(
    data.map((d) => d[componentIri]),
    (d) => +d!
  ) as [number, number];
  const colorScale = scaleSequential(
    getColorInterpolator(palette as any)
  ).domain(domain);
  const errorDimension = findRelatedErrorDimension(componentIri, dimensions);
  const errorMeasure = getErrorMeasure({ dimensions, measures }, componentIri);
  const getError = errorMeasure
    ? (d: Observation) => d[errorMeasure.iri]
    : null;
  const getFormattedError = makeErrorFormatter(
    getError,
    formatNumber,
    errorDimension?.unit
  );

  return {
    type: "continuous",
    palette,
    component,
    getColor: (d: Observation) => {
      const color = colorScale(+d[componentIri]!);
      if (color) {
        const rgb = makeColor(color)?.rgb();
        return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
      }
      return [0, 0, 0, 255 * 0.1];
    },
    getFormattedError,
    domain,
  } as const;
};

const useSymbolColors = ({
  colors,
  data,
  dimensions,
  measures,
}: {
  colors?: MapSymbolLayer["colors"];
  data: Observation[];
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
}) => {
  const formatNumber = useFormatNumber();

  return useMemo(() => {
    if (!colors) {
      return undefined;
    }

    switch (colors.type) {
      case "fixed":
        return getFixedSymbolColors(colors);
      case "categorical":
        return getCategoricalSymbolColors(
          colors as {
            type: "categorical";
            componentIri: string;
            palette: string;
            colorMapping: ColorMapping;
          },
          dimensions
        );
      case "continuous":
        return getContinousSymbolColors(
          colors as {
            type: "continuous";
            componentIri: string;
            palette: string;
          },
          data,
          dimensions,
          measures,
          { formatNumber }
        );
    }
  }, [colors, data, dimensions, measures, formatNumber]);
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
  dimensions: DimensionMetadataFragment[];
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
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
}) => {
  const formatNumber = useFormatNumber();

  const getLabel = useStringVariable(componentIri);
  const getValue = useOptionalNumericVariable(measureIri);

  const measureDimension = measures.find((d) => d.iri === measureIri);

  const errorDimension = findRelatedErrorDimension(measureIri, dimensions);
  const errorMeasure = useErrorMeasure({ dimensions, measures }, measureIri);
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
      number
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

const useMapState = (
  chartProps: Pick<ChartProps, "data" | "measures" | "dimensions"> & {
    features: GeoData;
    fields: MapFields;
    baseLayer: BaseLayer;
  }
): MapState => {
  const width = useWidth();
  const { data, features, fields, measures, dimensions, baseLayer } =
    chartProps;
  const { areaLayer, symbolLayer } = fields;

  const areaLayerState = useLayerState({
    componentIri: areaLayer?.componentIri,
    measureIri: areaLayer?.measureIri,
    data,
    features,
    dimensions,
    measures,
  });

  const areaColorScale = useMemo(() => {
    if (areaLayer?.componentIri === undefined) {
      return;
    }

    return getAreaColorScale({
      scaleInterpolationType: areaLayer.colorScaleInterpolationType,
      palette: areaLayer.palette,
      getValue: areaLayerState.getValue,
      data: areaLayerState.data,
      dataDomain: areaLayerState.dataDomain,
      nbClass: areaLayer.nbClass,
    });
  }, [areaLayer, areaLayerState]);

  const getAreaColor = useCallback(
    (v: number | null) => {
      if (v === null) {
        return [0, 0, 0, 255 * 0.1];
      }

      const color = areaColorScale && areaColorScale(v);
      const rgb = color && makeColor(color)?.rgb();

      return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
    },
    [areaColorScale]
  );

  const preparedAreaLayerState: MapState["areaLayer"] = useMemo(() => {
    if (areaLayer?.componentIri === undefined) {
      return undefined;
    }

    return {
      ...areaLayerState,
      colorScale: areaColorScale!,
      getColor: getAreaColor,
      colorScaleInterpolationType: areaLayer.colorScaleInterpolationType,
      palette: areaLayer.palette,
      nbClass: areaLayer.nbClass,
    };
  }, [areaLayer, areaLayerState, areaColorScale, getAreaColor]);

  const symbolLayerState = useLayerState({
    componentIri: symbolLayer?.componentIri,
    measureIri: symbolLayer?.measureIri,
    data,
    features,
    dimensions,
    measures,
  });

  const symbolColors = useSymbolColors({
    colors: symbolLayer?.colors,
    data: symbolLayerState.data,
    dimensions,
    measures,
  });

  const radiusScale = useMemo(() => {
    return scaleSqrt()
      .domain([0, symbolLayerState.dataDomain[1]])
      .range([0, 24]);
  }, [symbolLayerState.dataDomain]);

  const preparedSymbolLayerState: MapState["symbolLayer"] = useMemo(() => {
    if (symbolLayer?.componentIri === undefined) {
      return undefined;
    }

    return {
      ...symbolLayerState,
      colors: symbolColors!,
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
        ? features.areaLayer?.shapes
        : undefined,
      symbolLayer?.componentIri !== undefined
        ? features.symbolLayer?.points
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
    features,
    bounds,
    showBaseLayer: baseLayer.show,
    locked: baseLayer.locked || false,
    lockedBBox: chartProps.baseLayer.bbox,
    featuresBBox,
    identicalLayerComponentIris,
    areaLayer: preparedAreaLayerState,
    symbolLayer: preparedSymbolLayerState,
  };
};

const MapChartProvider = ({
  data,
  features,
  fields,
  measures,
  dimensions,
  baseLayer,
  children,
}: Pick<ChartProps, "data" | "measures" | "dimensions"> & {
  features: GeoData;
  children: ReactNode;
  fields: MapFields;
  baseLayer: BaseLayer;
}) => {
  const state = useMapState({
    data,
    features,
    fields,
    measures,
    dimensions,
    baseLayer,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const MapChart = ({
  data,
  features,
  fields,
  measures,
  dimensions,
  baseLayer,
  children,
}: Pick<ChartProps, "data" | "measures" | "dimensions"> & {
  features: GeoData;
  fields: MapFields;
  baseLayer: BaseLayer;
  children: ReactNode;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <MapChartProvider
          data={data}
          features={features}
          fields={fields}
          measures={measures}
          dimensions={dimensions}
          baseLayer={baseLayer}
        >
          <MapTooltipProvider>{children}</MapTooltipProvider>
        </MapChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
