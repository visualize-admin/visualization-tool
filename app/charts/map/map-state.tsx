import { color, extent, ScaleQuantize, scaleQuantize } from "d3";
import { ReactNode, useCallback } from "react";
import { getSingleHueSequentialPalette } from "../../configurator/components/ui-helpers";
import { MapFields, PaletteType } from "../../configurator/config-types";
import { Observation } from "../../domain/data";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { InteractionProvider } from "../shared/use-interaction";
import { Bounds, Observer, useWidth } from "../shared/use-width";

export type GeoData = GeoJSON.FeatureCollection | GeoJSON.Feature;
export interface MapState {
  chartType: "map";
  bounds: Bounds;
  data: Observation[];
  features: GeoData;
  getLabel: (d: Observation) => string;
  getColor: (x: number | undefined) => number[];
  getValue: (d: Observation) => number;
  paletteType: PaletteType;
  palette: string;
  nbSteps: number;
  dataDomain: [number, number];
  colorScale: ScaleQuantize<number, string>;
}

const useMapState = ({
  data,
  features,
  fields,
  dimensions,
  measures,
}: // interactiveFiltersConfig,
Pick<
  ChartProps,
  "data" | "dimensions" | "measures" //|  "interactiveFiltersConfig"
> & {
  features: GeoData;
  fields: MapFields;
}): MapState => {
  const width = useWidth();

  const { palette, nbSteps, paletteType } = fields.y;
  const getValue = useCallback(
    (d: Observation): number => +d[fields.y.componentIri],
    [fields.y.componentIri]
  );
  const getLabel = useCallback(
    (d: Observation): string => d[fields.x.componentIri] as string,
    [fields.x.componentIri]
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
    getLabel,
    getColor,
    getValue,
    bounds,
    paletteType,
    palette,
    nbSteps,
    dataDomain,
    colorScale,
  };
};

const MapChartProvider = ({
  data,
  features,
  fields,
  dimensions,
  measures,
  // interactiveFiltersConfig,
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
    // interactiveFiltersConfig,
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
  // interactiveFiltersConfig,
  children,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" //| "interactiveFiltersConfig"
> & {
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
