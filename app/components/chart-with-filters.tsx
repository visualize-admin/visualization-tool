import dynamic from "next/dynamic";
import React from "react";

import { ChartDataFilters } from "@/charts/shared/chart-data-filters";
import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { LoadingStateProvider } from "@/charts/shared/chart-loading-state";
import useSyncInteractiveFilters from "@/charts/shared/use-sync-interactive-filters";
import { ChartFiltersList } from "@/components/chart-filters-list";
import Flex from "@/components/flex";
import { ChartConfig, DataSource } from "@/configurator";

const ChartAreasVisualization = dynamic(
  import("@/charts/area/chart-area").then(
    (mod) => mod.ChartAreasVisualization,
    () => null as never
  )
);
const ChartColumnsVisualization = dynamic(
  import("@/charts/column/chart-column").then(
    (mod) => mod.ChartColumnsVisualization,
    () => null as never
  )
);
const ChartLinesVisualization = dynamic(
  import("@/charts/line/chart-lines").then(
    (mod) => mod.ChartLinesVisualization,
    () => null as never
  )
);
const ChartMapVisualization = dynamic(
  import("@/charts/map/chart-map").then(
    (mod) => mod.ChartMapVisualization,
    () => null as never
  )
);
const ChartPieVisualization = dynamic(
  import("@/charts/pie/chart-pie").then(
    (mod) => mod.ChartPieVisualization,
    () => null as never
  )
);
const ChartScatterplotVisualization = dynamic(
  import("@/charts/scatterplot/chart-scatterplot").then(
    (mod) => mod.ChartScatterplotVisualization,
    () => null as never
  )
);
const ChartTableVisualization = dynamic(
  import("@/charts/table/chart-table").then(
    (mod) => mod.ChartTableVisualization,
    () => null as never
  )
);

type GenericChartProps = {
  dataSet: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  published: boolean;
};

const GenericChart = (props: GenericChartProps) => {
  const { dataSet, dataSource, chartConfig, published } = props;
  const queryFilters = useQueryFilters({ chartConfig });
  const commonProps = {
    dataSetIri: dataSet,
    dataSource,
    queryFilters,
    published,
  };

  switch (chartConfig.chartType) {
    case "column":
      return (
        <ChartColumnsVisualization {...commonProps} chartConfig={chartConfig} />
      );
    case "line":
      return (
        <ChartLinesVisualization {...commonProps} chartConfig={chartConfig} />
      );
    case "area":
      return (
        <ChartAreasVisualization {...commonProps} chartConfig={chartConfig} />
      );
    case "scatterplot":
      return (
        <ChartScatterplotVisualization
          {...commonProps}
          chartConfig={chartConfig}
        />
      );
    case "pie":
      return (
        <ChartPieVisualization {...commonProps} chartConfig={chartConfig} />
      );
    case "table":
      return (
        <ChartTableVisualization {...commonProps} chartConfig={chartConfig} />
      );
    case "map":
      return (
        <ChartMapVisualization {...commonProps} chartConfig={chartConfig} />
      );
    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }
};

type ChartWithFiltersProps = {
  dataSet: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  published: boolean;
};

export const ChartWithFilters = React.forwardRef<
  HTMLDivElement,
  ChartWithFiltersProps
>((props, ref) => {
  useSyncInteractiveFilters(props.chartConfig);

  return (
    <LoadingStateProvider>
      <Flex
        ref={ref}
        sx={{
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
        }}
      >
        {props.chartConfig.interactiveFiltersConfig?.dataFilters.active ? (
          <ChartDataFilters {...props} />
        ) : (
          <ChartFiltersList {...props} />
        )}
        <GenericChart {...props} />
      </Flex>
    </LoadingStateProvider>
  );
});
ChartWithFilters.displayName = "ChartWithFilters";