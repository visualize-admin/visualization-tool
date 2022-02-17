import {
  color,
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
import { ReactNode, useCallback, useMemo } from "react";
import { ckmeans } from "simple-statistics";
import {
  getColorInterpolator,
  getSingleHueSequentialPalette,
} from "../../configurator/components/ui-helpers";
import {
  BaseLayer,
  ColorScaleInterpolationType,
  DivergingPaletteType,
  MapFields,
  SequentialPaletteType,
} from "../../configurator/config-types";
import {
  GeoData,
  GeoFeature,
  GeoShapes,
  isGeoCoordinatesDimension,
  isGeoShapesDimension,
  Observation,
} from "../../domain/data";
import {
  useOptionalNumericVariable,
  useStringVariable,
} from "../shared/chart-helpers";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { InteractionProvider } from "../shared/use-interaction";
import { Bounds, Observer, useWidth } from "../shared/use-width";
import { MapTooltipProvider } from "./map-tooltip";

export interface MapState {
  chartType: "map";
  bounds: Bounds;
  features: GeoData;
  showRelief: boolean;
  showWater: boolean;
  identicalLayerComponentIris: boolean;
  areaLayer: {
    data: Observation[];
    hierarchyLevel: number;
    show: boolean;
    measureLabel: string;
    getLabel: (d: Observation) => string;
    getValue: (d: Observation) => number | null;
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
    hierarchyLevel: number;
    show: boolean;
    measureLabel: string;
    getLabel: (d: Observation) => string;
    getValue: (d: Observation) => number | null;
    color: string;
    radiusScale: ScalePower<number, number>;
    dataDomain: [number, number];
  };
}

const getColorScale = ({
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

const useMapState = ({
  data,
  features,
  fields,
  measures,
  dimensions,
  baseLayer,
  geoShapes,
}: Pick<ChartProps, "data" | "measures" | "dimensions"> & {
  features: GeoData;
  fields: MapFields;
  baseLayer: BaseLayer;
  geoShapes?: GeoShapes;
}): MapState => {
  const width = useWidth();
  const { areaLayer, symbolLayer } = fields;

  const getAreaLabel = useStringVariable(areaLayer.componentIri);
  const getSymbolLabel = useStringVariable(symbolLayer.componentIri);

  const getAreaValue = useOptionalNumericVariable(areaLayer.measureIri);
  const getSymbolValue = useOptionalNumericVariable(symbolLayer.measureIri);

  const getDataByHierarchyLevel = useCallback(
    ({
      geoDimensionIri,
      hierarchyLevel,
      getLabel,
    }: {
      geoDimensionIri: string;
      hierarchyLevel: number;
      getLabel: (d: Observation) => string;
    }) => {
      const dimension = dimensions.find((d) => d.iri === geoDimensionIri);

      // Right now hierarchies are only created for geoShapes
      if (isGeoShapesDimension(dimension) && geoShapes) {
        const dimensionLabels = dimension.values.map((d) => d.label);
        const hierarchyLabels = (
          (geoShapes as any).topology.objects.shapes.geometries as GeoFeature[]
        )
          .filter((d) => d.properties.hierarchyLevel === hierarchyLevel)
          .map((d) => d.properties.label);

        return data
          .filter((d) => dimensionLabels.includes(getLabel(d)))
          .filter((d) => hierarchyLabels.includes(getLabel(d)));
      } else if (isGeoCoordinatesDimension(dimension)) {
        const dimensionLabels = dimension.values.map((d) => d.label);

        return data.filter((d) => dimensionLabels.includes(getLabel(d)));
      }

      return data;
    },
    [data, dimensions, geoShapes]
  );

  const areaData = useMemo(
    () =>
      getDataByHierarchyLevel({
        geoDimensionIri: areaLayer.componentIri,
        hierarchyLevel: areaLayer.hierarchyLevel,
        getLabel: getAreaLabel,
      }),
    [
      areaLayer.componentIri,
      areaLayer.hierarchyLevel,
      getAreaLabel,
      getDataByHierarchyLevel,
    ]
  );

  const symbolData = useMemo(
    () =>
      getDataByHierarchyLevel({
        geoDimensionIri: symbolLayer.componentIri,
        hierarchyLevel: symbolLayer.hierarchyLevel,
        getLabel: getSymbolLabel,
      }),
    [
      symbolLayer.componentIri,
      symbolLayer.hierarchyLevel,
      getSymbolLabel,
      getDataByHierarchyLevel,
    ]
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

  const areaColorScale = getColorScale({
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

    const c = areaColorScale && areaColorScale(v);
    const rgb = c && color(`${c}`)?.rgb();

    return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
  };

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

  return {
    chartType: "map",
    features,
    bounds,
    showRelief: baseLayer.showRelief,
    showWater: baseLayer.showWater,
    identicalLayerComponentIris,
    areaLayer: {
      data: areaData,
      hierarchyLevel: areaLayer.hierarchyLevel,
      show: fields.areaLayer.show,
      measureLabel: areaMeasureLabel,
      getLabel: getAreaLabel,
      getValue: getAreaValue,
      getColor: getAreaColor,
      colorScale: areaColorScale,
      colorScaleInterpolationType: areaLayer.colorScaleInterpolationType,
      palette: areaLayer.palette,
      nbClass: areaLayer.nbClass,
      dataDomain: areaDataDomain,
    },
    symbolLayer: {
      data: symbolData,
      hierarchyLevel: symbolLayer.hierarchyLevel,
      color: fields.symbolLayer.color,
      measureLabel: symbolMeasureLabel,
      show: fields.symbolLayer.show,
      getLabel: getSymbolLabel,
      radiusScale,
      getValue: getSymbolValue,
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
  geoShapes,
  children,
}: Pick<ChartProps, "data" | "measures" | "dimensions"> & {
  features: GeoData;
  children: ReactNode;
  fields: MapFields;
  baseLayer: BaseLayer;
  geoShapes?: GeoShapes;
}) => {
  const state = useMapState({
    data,
    features,
    fields,
    measures,
    dimensions,
    baseLayer,
    geoShapes,
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
  geoShapes,
  children,
}: Pick<ChartProps, "data" | "measures" | "dimensions"> & {
  features: GeoData;
  fields: MapFields;
  baseLayer: BaseLayer;
  geoShapes?: GeoShapes;
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
            geoShapes={geoShapes}
            baseLayer={baseLayer}
          >
            {children}
          </MapChartProvider>
        </MapTooltipProvider>
      </InteractionProvider>
    </Observer>
  );
};
