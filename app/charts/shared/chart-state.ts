import { Bounds } from "@/charts/shared/use-width";
import { ChartConfig, ChartType } from "@/configurator";
import { Observation } from "@/domain/data";

import { getAreasStateMetadata } from "../area/areas-state";

export interface CommonChartState {
  chartType: ChartType;
  bounds: Bounds;
}

export type ChartStateMetadata = {
  sortData: (data: Observation[]) => Observation[];
};

export const getChartStateMetadata = (
  chartConfig: ChartConfig
): ChartStateMetadata | undefined => {
  switch (chartConfig.chartType) {
    case "area":
      return getAreasStateMetadata(chartConfig);
  }
};
