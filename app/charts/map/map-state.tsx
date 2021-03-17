import {
  color,
  extent,
  ScalePower,
  ScaleQuantize,
  scaleQuantize,
  scaleSqrt,
} from "d3";
import { ReactNode, useCallback } from "react";
import { getSingleHueSequentialPalette } from "../../configurator/components/ui-helpers";
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
  areaLayer: {
    showAreaLayer: boolean;
    getLabel: (d: Observation) => string;
    getColor: (x: number | undefined) => number[];
    getValue: (d: Observation) => number;
    paletteType: PaletteType;
    palette: string;
    nbSteps: number;
    dataDomain: [number, number];
    colorScale: ScaleQuantize<number, string>;
  };
  baseLayer: MapBaseLayer;
  symbolLayer: {
    showSymbolLayer: boolean;
    radiusScale: ScalePower<number, number>;
    getRadius: (d: Observation) => number;
  };
}

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

  const { palette, nbSteps, paletteType } = fields["areaLayer"];
  const getValue = useCallback(
    (d: Observation): number => +d[fields["areaLayer"].componentIri],
    [fields["areaLayer"].componentIri]
  );
  const getLabel = useCallback(
    (d: Observation): string =>
      d[fields["areaLayer"].label.componentIri] as string,
    [fields["areaLayer"].label.componentIri]
  );
  const getRadius = useCallback(
    (d: Observation): number => +d[fields["symbolLayer"].componentIri],
    [fields["symbolLayer"].componentIri]
  );

  const dataDomain = (extent(data, (d) => getValue(d)) || [0, 100]) as [
    number,
    number
  ];

  // FIXME: for continuous scale, just interpolate between 2 colors?
  const colorScale = scaleQuantize<number, string>()
    .domain(dataDomain)
    .range(
      getSingleHueSequentialPalette({
        palette,
        nbSteps: paletteType === "continuous" ? 9 : nbSteps,
      }) as $FixMe[]
    );

  const getColor = (v: number | undefined) => {
    // FIXME: make this function functional

    if (v === undefined) {
      return [0, 0, 0];
    }
    const c = colorScale && colorScale(v);
    const rgb = c && color(`${c}`)?.rgb();
    return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
  };

  const radiusExtent = extent(data, (d) => getRadius(d));
  console.log({ radiusExtent });
  const radiusScale = scaleSqrt()
    .domain(radiusExtent as [number, number])
    .range([2, 2000]);

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
    areaLayer: {
      showAreaLayer: fields.areaLayer.show,
      getLabel,
      getColor,
      getValue,
      paletteType,
      palette,
      nbSteps,
      dataDomain,
      colorScale,
    },
    baseLayer: fields["baseLayer"],
    symbolLayer: {
      showSymbolLayer: fields.symbolLayer.show,
      radiusScale,
      getRadius,
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
