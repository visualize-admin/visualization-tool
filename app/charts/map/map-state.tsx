import { color, extent, scaleQuantize } from "d3";
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
  getColor: (x: number | undefined) => number[];
  getValue: (d: Observation) => number;
  paletteType: PaletteType;
  palette: string;
  nbSteps: number;
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

  const domain = (extent(data, (d) => getValue(d)) || [0, 100]) as [
    number,
    number
  ];
  const getColor = (v: number | undefined) => {
    const colorScale = scaleQuantize<number, string>()
      .domain(domain)
      .range(
        getSingleHueSequentialPalette({
          palette,
          nbSteps: paletteType === "continuous" ? 9 : nbSteps,
        }) as $FixMe[]
      );
    if (v === undefined) {
      return [0, 0, 0];
    }
    const c = colorScale && colorScale(v);
    const rgb = c && color(`${c}`)?.rgb();
    return rgb ? [rgb.r, rgb.g, rgb.b] : [0, 0, 0];
  };

  const margins = {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40,
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
    getColor,
    getValue,
    bounds,
    paletteType,
    palette,
    nbSteps,
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
