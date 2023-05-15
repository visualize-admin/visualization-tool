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

const GenericChart = ({
  dataSet,
  dataSource,
  chartConfig,
  published,
}: {
  dataSet: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  published: boolean;
}) => {
  const queryFilters = useQueryFilters({ chartConfig });
  const props = {
    dataSetIri: dataSet,
    dataSource,
    queryFilters,
    published,
  };

  switch (chartConfig.chartType) {
    case "column":
      return <ChartColumnsVisualization {...props} chartConfig={chartConfig} />;
    case "line":
      return <ChartLinesVisualization {...props} chartConfig={chartConfig} />;
    case "area":
      return <ChartAreasVisualization {...props} chartConfig={chartConfig} />;
    case "scatterplot":
      return (
        <ChartScatterplotVisualization {...props} chartConfig={chartConfig} />
      );
    case "pie":
      return <ChartPieVisualization {...props} chartConfig={chartConfig} />;
    case "table":
      return <ChartTableVisualization {...props} chartConfig={chartConfig} />;
    case "map":
      return <ChartMapVisualization {...props} chartConfig={chartConfig} />;
    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }
};

export default GenericChart;
