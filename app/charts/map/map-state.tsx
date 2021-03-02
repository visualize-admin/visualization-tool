import { ReactNode } from "react";
import { useFormatNumber } from "../../configurator/components/ui-helpers";
import { MapFields } from "../../configurator/config-types";
import { Observation } from "../../domain/data";
import { useTheme } from "../../themes";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { InteractionProvider } from "../shared/use-interaction";
import { Bounds, Observer, useWidth } from "../shared/use-width";

export type GeoData = GeoJSON.FeatureCollection | GeoJSON.Feature;
export interface MapState {
  chartType: "map";
  data: Observation[];
  features: GeoData;
  bounds: Bounds;
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
  const theme = useTheme();
  const width = useWidth();
  const formatNumber = useFormatNumber();
  const margins = {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40,
  };
  const chartWidth = width - margins.left - margins.right;
  const chartHeight = chartWidth;
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
