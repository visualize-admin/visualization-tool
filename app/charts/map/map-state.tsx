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
import { ReactNode, useCallback } from "react";
import { ckmeans } from "simple-statistics";
import {
  getColorInterpolator,
  getSingleHueSequentialPalette,
} from "../../configurator/components/ui-helpers";
import {
  MapBaseLayer,
  MapFields,
  PaletteType,
} from "../../configurator/config-types";
import { Observation } from "../../domain/data";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { InteractionProvider } from "../shared/use-interaction";
import { Bounds, Observer, useWidth } from "../shared/use-width";

export type GeoData = {
  cantons: GeoJSON.FeatureCollection | GeoJSON.Feature;
  municipalities?: GeoJSON.FeatureCollection | GeoJSON.Feature;
  municipalityMesh?: GeoJSON.MultiLineString;
  cantonCentroids: { id: number; coordinates: [number, number] }[];
  cantonMesh: GeoJSON.MultiLineString;
  lakes: GeoJSON.FeatureCollection | GeoJSON.Feature;
};
export interface MapState {
  chartType: "map";
  bounds: Bounds;
  data: Observation[];
  features: GeoData;
  getFeatureLabel: (d: Observation | undefined) => string;
  baseLayer: MapBaseLayer;
  areaLayer: {
    showAreaLayer: boolean;
    areaMeasureLabel: string;
    getColor: (x: number | undefined) => number[];
    getValue: (d: Observation) => number | null;
    paletteType: PaletteType;
    palette: string;
    nbClass: number;
    dataDomain: [number, number];
    colorScale:
      | ScaleSequential<string>
      | ScaleQuantize<string>
      | ScaleQuantile<string>
      | ScaleLinear<string, string>
      | ScaleThreshold<number, string>;
  };
  symbolLayer: {
    symbolMeasureLabel: string;
    showSymbolLayer: boolean;
    radiusScale: ScalePower<number, number>;
    getRadius: (d: Observation) => number | null;
    symbolColorScale: (x: number) => string;
  };
}
const getColorScale = ({
  paletteType,
  palette,
  getValue,
  data,
  dataDomain,
  nbClass,
}: {
  paletteType: PaletteType;
  palette: string;
  getValue: (x: Observation) => number | null;
  data: Observation[];
  dataDomain: [number, number];
  nbClass: number;
}) => {
  const paletteDomain = getSingleHueSequentialPalette({
    palette,
    nbClass: 9,
  });

  switch (paletteType) {
    case "continuous":
      return scaleSequential(getColorInterpolator(palette)).domain(dataDomain);
    case "discrete":
      return scaleQuantize<string>()
        .domain(dataDomain)
        .range(getSingleHueSequentialPalette({ palette, nbClass }));
    case "quantile":
      return scaleQuantile<string>()
        .domain(data.map((d) => getValue(d)))
        .range(getSingleHueSequentialPalette({ palette, nbClass }));
    case "jenks":
      const ckMeansThresholds = ckmeans(
        data.map((d) => getValue(d) ?? NaN),
        nbClass
      ).map((v) => v.pop() || 0);

      return scaleThreshold<number, string>()
        .domain(ckMeansThresholds)
        .range(getSingleHueSequentialPalette({ palette, nbClass }));
    default:
      return scaleLinear<string>()
        .domain(dataDomain)
        .range([paletteDomain[0], paletteDomain[paletteDomain.length - 1]]);
  }
};
const useMapState = ({
  data,
  features,
  fields,
  dimensions,
  measures,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  features: GeoData;
  fields: MapFields;
}): MapState => {
  const width = useWidth();

  const { palette, nbClass, paletteType } = fields["areaLayer"];
  const getValue = useCallback(
    (d: Observation): number | null => {
      const v = d[fields.areaLayer.componentIri];
      return v !== null && v !== "..." // FIXME: && v !== "..." -> only used for the prototype and mock data
        ? +v
        : null;
    },
    [fields.areaLayer.componentIri]
  );

  const getFeatureLabel = useCallback(
    (d: Observation | undefined): string =>
      d ? `${d[fields.areaLayer.label.componentIri]}` : "",
    [fields.areaLayer.label.componentIri]
  );
  const getRadius = useCallback(
    (d: Observation): number | null => {
      const v = d[fields.symbolLayer.componentIri];
      return v !== null && v !== "..." // FIXME: && v !== "..." -> only used for the prototype and mock data
        ? +v
        : null;
    },
    [fields.symbolLayer.componentIri]
  );

  const areaMeasureLabel =
    measures
      .find((m) => m.iri === fields["areaLayer"].componentIri)
      ?.label.split("_")[1] || "";
  const symbolMeasureLabel =
    measures
      .find((m) => m.iri === fields["symbolLayer"].componentIri)
      ?.label.split("_")[1] || "";
  const dataDomain = (extent(data, (d) => getValue(d)) || [0, 100]) as [
    number,
    number
  ];

  const colorScale = getColorScale({
    paletteType,
    palette,
    getValue,
    data,
    dataDomain,
    nbClass,
  });
  const getColor = (v: number | undefined) => {
    if (v === undefined) {
      return [0, 0, 0];
    }
    const c = colorScale && colorScale(v);
    const rgb = c && color(`${c}`)?.rgb();
    return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
  };

  const radiusExtent = extent(data, (d) => getRadius(d));
  const radiusRange = radiusExtent[0] === 0 ? [0, 23] : [0, 23];
  const radiusScale = scaleSqrt()
    .domain(radiusExtent as [number, number])
    .range(radiusRange);
  const symbolColorScale = (x: number) => "#006699";

  // Dimensions
  const margins = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  const chartWidth = width - margins.left - margins.right;
  const chartHeight = chartWidth * 0.5;
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  return {
    chartType: "map",
    data,
    features,
    bounds,
    getFeatureLabel,
    baseLayer: fields["baseLayer"],
    areaLayer: {
      areaMeasureLabel,
      showAreaLayer: fields.areaLayer.show,
      getColor,
      getValue,
      paletteType,
      palette,
      nbClass: nbClass,
      dataDomain,
      colorScale,
    },
    symbolLayer: {
      symbolMeasureLabel,
      showSymbolLayer: fields.symbolLayer.show,
      radiusScale,
      getRadius,
      symbolColorScale,
    },
  };
};

const MapChartProvider = ({
  data,
  features,
  fields,
  dimensions,
  measures,
  children,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" // "interactiveFiltersConfig"
> & { features: GeoData; children: ReactNode; fields: MapFields }) => {
  const state = useMapState({
    data,
    features,
    fields,
    dimensions,
    measures,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const MapChart = ({
  data,
  features,
  fields,
  dimensions,
  measures,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  features: GeoData;

  fields: MapFields;
  children: ReactNode;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <MapChartProvider
          data={data}
          features={features}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          // interactiveFiltersConfig={interactiveFiltersConfig}
        >
          {children}
        </MapChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
