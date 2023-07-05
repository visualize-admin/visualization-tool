import { getAreasStateMetadata } from "@/charts/area/areas-state";
import { getColumnsGroupedStateMetadata } from "@/charts/column/columns-grouped-state";
import { getColumnsStackedStateMetadata } from "@/charts/column/columns-stacked-state";
import { getColumnsStateMetadata } from "@/charts/column/columns-state";
import { getLinesStateMetadata } from "@/charts/line/lines-state";
import { getMapStateMetadata } from "@/charts/map/map-state";
import { getPieStateMetadata } from "@/charts/pie/pie-state";
import { getScatterplotStateMetadata } from "@/charts/scatterplot/scatterplot-state";
import { Bounds } from "@/charts/shared/use-width";
import { getTableStateMetadata } from "@/charts/table/table-state";
import { ChartConfig, ChartType } from "@/configurator";
import { Observation } from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

export interface CommonChartState {
  chartType: ChartType;
  bounds: Bounds;
}

export type ChartStateMetadata = {
  assureDefined: {
    getX?: (d: Observation) => unknown | null;
    getY?: (d: Observation) => unknown | null;
  };
  getXDate?: (d: Observation) => Date;
  getSegment?: (d: Observation) => string;
  sortData: (data: Observation[]) => Observation[];
};

type ChartStateMetadataProps = {
  chartConfig: ChartConfig;
  observations: Observation[];
  dimensions: DimensionMetadataFragment[];
};

export const getChartStateMetadata = (
  props: ChartStateMetadataProps
): ChartStateMetadata => {
  const { chartConfig, observations, dimensions } = props;

  switch (chartConfig.chartType) {
    case "area":
      return getAreasStateMetadata(chartConfig, observations, dimensions);
    case "column":
      switch (chartConfig.fields.segment?.type) {
        case undefined:
          return getColumnsStateMetadata(chartConfig, observations, dimensions);
        case "grouped":
          return getColumnsGroupedStateMetadata(
            chartConfig,
            observations,
            dimensions
          );
        case "stacked":
          return getColumnsStackedStateMetadata(
            chartConfig,
            observations,
            dimensions
          );
      }
    case "line":
      return getLinesStateMetadata(chartConfig, observations, dimensions);
    case "map":
      return getMapStateMetadata();
    case "pie":
      return getPieStateMetadata(chartConfig, observations, dimensions);
    case "scatterplot":
      return getScatterplotStateMetadata(chartConfig, observations, dimensions);
    case "table":
      return getTableStateMetadata();
  }
};
