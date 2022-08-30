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
import { keyBy } from "lodash";
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
  getSingleHueSequentialPalette,
  useErrorMeasure,
  useErrorVariable,
  useFormatNumber,
} from "@/configurator/components/ui-helpers";
import {
  BaseLayer,
  BBox,
  ColorScaleInterpolationType,
  DivergingPaletteType,
  MapFields,
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
  areaLayer: {
    data: Observation[];
    show: boolean;
    measureLabel: string;
    getLabel: (d: Observation) => string;
    getValue: (d: Observation) => number | null;
    measureDimension?: DimensionMetadataFragment;
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
    dataDomain: [number, number];
  };
  symbolLayer: {
    data: Observation[];
    show: boolean;
    measureLabel: string;
    getLabel: (d: Observation) => string;
    getValue: (d: Observation) => number | null;
    getColor: (d: Observation) => number[];
    errorDimension?: DimensionMetadataFragment;
    measureDimension?: DimensionMetadataFragment;
    getFormattedError: null | ((d: Observation) => string);
    radiusScale: ScalePower<number, number>;
    dataDomain: [number, number];
  };
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

  const getAreaLabel = useStringVariable(areaLayer.componentIri);
  const getSymbolLabel = useStringVariable(symbolLayer.componentIri);

  const areaMeasureDimension = useMemo(
    () => measures.find((x) => x.iri === areaLayer.measureIri),
    [measures, areaLayer]
  );
  const areaErrorDimension = useMemo(
    () => findRelatedErrorDimension(areaLayer.measureIri, dimensions),
    [dimensions, areaLayer]
  );
  const symbolMeasureDimension = useMemo(
    () => measures.find((x) => x.iri === symbolLayer.measureIri),
    [measures, symbolLayer]
  );
  const symbolErrorDimension = useMemo(
    () => findRelatedErrorDimension(symbolLayer.measureIri, dimensions),
    [dimensions, symbolLayer]
  );

  const getAreaValue = useOptionalNumericVariable(areaLayer.measureIri);

  const areaErrorMeasure = useErrorMeasure(chartProps, areaLayer.measureIri);
  const getAreaError = useErrorVariable(areaErrorMeasure);
  const formatNumber = useFormatNumber();
  const getAreaFormattedError = useMemo(
    () =>
      makeErrorFormatter(getAreaError, formatNumber, areaErrorDimension?.unit),
    [areaErrorDimension?.unit, formatNumber, getAreaError]
  );

  const getSymbolValue = useOptionalNumericVariable(symbolLayer.measureIri);
  const symbolErrorMeasure = useErrorMeasure(chartProps, areaLayer.measureIri);
  const getSymbolError = useErrorVariable(symbolErrorMeasure);
  const getSymbolFormattedError = useMemo(
    () =>
      makeErrorFormatter(
        getSymbolError,
        formatNumber,
        symbolErrorDimension?.unit
      ),
    [symbolErrorDimension?.unit, formatNumber, getSymbolError]
  );

  const getData = useCallback(
    ({
      geoDimensionIri,
      getLabel,
    }: {
      geoDimensionIri: string;
      getLabel: (d: Observation) => string;
    }) => {
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
    },
    [data, dimensions, features.areaLayer?.shapes.features]
  );

  const areaData = useMemo(
    () =>
      areaLayer.componentIri !== ""
        ? getData({
            geoDimensionIri: areaLayer.componentIri,
            getLabel: getAreaLabel,
          })
        : [],
    [areaLayer.componentIri, getAreaLabel, getData]
  );

  const symbolData = useMemo(
    () =>
      symbolLayer.componentIri !== ""
        ? getData({
            geoDimensionIri: symbolLayer.componentIri,
            getLabel: getSymbolLabel,
          })
        : [],
    [symbolLayer.componentIri, getSymbolLabel, getData]
  );

  const identicalLayerComponentIris =
    areaLayer.componentIri === symbolLayer.componentIri;

  const areaMeasureLabel = useMemo(
    () => measures.find((m) => m.iri === areaLayer.measureIri)?.label || "",
    [areaLayer.measureIri, measures]
  );
  const symbolMeasureLabel = useMemo(
    () => measures.find((m) => m.iri === symbolLayer.measureIri)?.label || "",
    [symbolLayer.measureIri, measures]
  );

  const areaDataDomain = (extent(areaData, (d) => getAreaValue(d)) || [
    0, 100,
  ]) as [number, number];
  const symbolDataDomain = (extent(symbolData, (d) => getSymbolValue(d)) || [
    0, 100,
  ]) as [number, number];

  const areaColorScale = getAreaColorScale({
    scaleInterpolationType: areaLayer.colorScaleInterpolationType,
    palette: areaLayer.palette,
    getValue: getAreaValue,
    data: areaData,
    dataDomain: areaDataDomain,
    nbClass: areaLayer.nbClass,
  });

  const getAreaColor = (v: number | null) => {
    if (v === null) {
      return [0, 0, 0, 255 * 0.1];
    }

    const color = areaColorScale && areaColorScale(v);
    const rgb = color && makeColor(color)?.rgb();

    return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
  };

  // @ts-ignore
  // console.log(
  //   [...dimensions, ...measures].find(
  //     (d) => d.iri === symbolLayer.colors.componentIri
  //   )
  // );

  const getSymbolColor = useMemo(() => {
    const colors = symbolLayer.colors;

    switch (colors.type) {
      case "fixed":
        const color = convertHexToRgbArray(colors.value);
        return (_: Observation) => color;
      case "categorical":
        const component = dimensions.find((d) => d.iri === colors.componentIri);
        const componentValuesByLabel = keyBy(component?.values, (d) => d.label);
        return (d: Observation) => {
          const label = d[colors.componentIri] as string;
          const value = componentValuesByLabel[label].value;
          const color = colors.colorMapping?.[value];
          return color ? convertHexToRgbArray(color) : [0, 0, 0, 255 * 0.1];
        };
      case "continuous":
        const colorScaleDomain = extent(
          symbolData.map((d) => d[colors.componentIri]),
          (d) => +d!
        ) as [number, number];
        const colorScale = scaleSequential(
          getColorInterpolator(colors.palette as any)
        ).domain(colorScaleDomain);
        return (d: Observation) => {
          const color = colorScale(+d[colors.componentIri]!);
          if (color) {
            const rgb = makeColor(color)?.rgb();
            return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
          }
          return [0, 0, 0, 255 * 0.1];
        };
    }
  }, [symbolLayer.colors, symbolData, dimensions]);

  const radiusDomain = [0, symbolDataDomain[1]];
  const radiusRange = [0, 24];
  const radiusScale = scaleSqrt().domain(radiusDomain).range(radiusRange);

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
      areaLayer.show ? features.areaLayer?.shapes : undefined,
      symbolLayer.show ? features.symbolLayer?.points : undefined
    );
  }, [
    areaLayer.show,
    features.areaLayer?.shapes,
    symbolLayer.show,
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
    areaLayer: {
      data: areaData,
      show: fields.areaLayer.show,
      measureLabel: areaMeasureLabel,
      measureDimension: areaMeasureDimension,
      errorDimension: areaErrorDimension,
      getLabel: getAreaLabel,
      getValue: getAreaValue,
      getFormattedError: getAreaFormattedError,
      getColor: getAreaColor,
      colorScale: areaColorScale,
      colorScaleInterpolationType: areaLayer.colorScaleInterpolationType,
      palette: areaLayer.palette,
      nbClass: areaLayer.nbClass,
      dataDomain: areaDataDomain,
    },
    symbolLayer: {
      data: symbolData,
      measureLabel: symbolMeasureLabel,
      measureDimension: symbolMeasureDimension,
      errorDimension: symbolErrorDimension,
      show: fields.symbolLayer.show,
      getLabel: getSymbolLabel,
      radiusScale,
      getValue: getSymbolValue,
      getFormattedError: getSymbolFormattedError,
      getColor: getSymbolColor,
      dataDomain: symbolDataDomain,
    },
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
        <MapTooltipProvider>
          <MapChartProvider
            data={data}
            features={features}
            fields={fields}
            measures={measures}
            dimensions={dimensions}
            baseLayer={baseLayer}
          >
            {children}
          </MapChartProvider>
        </MapTooltipProvider>
      </InteractionProvider>
    </Observer>
  );
};
