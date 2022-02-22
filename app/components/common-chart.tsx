import { useEffect } from "react";
import { ChartAreasVisualization } from "../charts/area/chart-area";
import { ChartBarsVisualization } from "../charts/bar/chart-bar";
import { ChartColumnsVisualization } from "../charts/column/chart-column";
import { ChartLinesVisualization } from "../charts/line/chart-lines";
import { ChartMapVisualization } from "../charts/map/chart-map";
import { ChartPieVisualization } from "../charts/pie/chart-pie";
import { ChartScatterplotVisualization } from "../charts/scatterplot/chart-scatterplot";
import { useQueryFilters } from "../charts/shared/chart-helpers";
import { useChartError } from "../charts/shared/errors";
import { ChartTableVisualization } from "../charts/table/chart-table";
import { ChartConfig } from "../configurator";

const GenericChart = ({
  dataSet,
  chartConfig,
}: {
  dataSet: string;
  chartConfig: ChartConfig;
}) => {
  const { setChartError } = useChartError();
  // Combine filters from config + interactive filters
  const queryFilters = useQueryFilters({
    chartConfig,
  });

  const props = {
    dataSetIri: dataSet,
    chartConfig,
    queryFilters,
  };

  // Remove any chart errors on chart switch
  useEffect(
    () => setChartError("none"),
    [chartConfig.chartType, setChartError]
  );

  switch (chartConfig.chartType) {
    case "column":
      return <ChartColumnsVisualization {...props} chartConfig={chartConfig} />;
    case "bar":
      return <ChartBarsVisualization {...props} chartConfig={chartConfig} />;
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
