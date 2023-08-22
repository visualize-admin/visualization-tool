import dynamic from "next/dynamic";

import { useQueryFilters } from "@/charts/shared/chart-helpers";
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

export default GenericChart;
