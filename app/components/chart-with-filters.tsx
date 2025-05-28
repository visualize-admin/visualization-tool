import { makeStyles } from "@mui/styles";
import dynamic from "next/dynamic";
import { forwardRef } from "react";

import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { Observer } from "@/charts/shared/use-size";
import { useSyncInteractiveFilters } from "@/charts/shared/use-sync-interactive-filters";
import { EmbedQueryParams } from "@/components/embed-params";
import {
  type ChartConfig,
  type DashboardFiltersConfig,
  type DataSource,
} from "@/config-types";

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
const ChartBarsVisualization = dynamic(
  import("@/charts/bar/chart-bar").then(
    (mod) => mod.ChartBarsVisualization,
    () => null as never
  )
);
const ChartComboLineSingleVisualization = dynamic(
  import("@/charts/combo/chart-combo-line-single").then(
    (mod) => mod.ChartComboLineSingleVisualization,
    () => null as never
  )
);
const ChartComboLineDualVisualization = dynamic(
  import("@/charts/combo/chart-combo-line-dual").then(
    (mod) => mod.ChartComboLineDualVisualization,
    () => null as never
  )
);
const ChartComboLineColumnVisualization = dynamic(
  import("@/charts/combo/chart-combo-line-column").then(
    (mod) => mod.ChartComboLineColumnVisualization,
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
  dataSource: DataSource;
  componentIds: string[] | undefined;
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
  embedParams?: EmbedQueryParams;
};

const GenericChart = ({
  dataSource,
  componentIds,
  chartConfig,
  dashboardFilters,
  embedParams,
}: GenericChartProps) => {
  const observationQueryFilters = useQueryFilters({
    chartConfig,
    dashboardFilters,
    componentIds,
  });

  const commonProps = {
    dataSource,
    observationQueryFilters,
    componentIds,
    embedParams,
  };

  switch (chartConfig.chartType) {
    case "column":
      return (
        <ChartColumnsVisualization {...commonProps} chartConfig={chartConfig} />
      );
    case "bar":
      return (
        <ChartBarsVisualization {...commonProps} chartConfig={chartConfig} />
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
    case "comboLineSingle":
      return (
        <ChartComboLineSingleVisualization
          {...commonProps}
          chartConfig={chartConfig}
        />
      );
    case "comboLineDual":
      return (
        <ChartComboLineDualVisualization
          {...commonProps}
          chartConfig={chartConfig}
        />
      );
    case "comboLineColumn":
      return (
        <ChartComboLineColumnVisualization
          {...commonProps}
          chartConfig={chartConfig}
        />
      );

    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }
};

type ChartWithFiltersProps = {
  dataSource: DataSource;
  componentIds: string[] | undefined;
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
  embedParams?: EmbedQueryParams;
};

export const useChartWithFiltersClasses = makeStyles(() => ({
  chartWithFilters: {
    width: "100%",
    height: "100%",
  },
}));

export const ChartWithFilters = forwardRef<
  HTMLDivElement,
  ChartWithFiltersProps
>((props, ref) => {
  useSyncInteractiveFilters(props.chartConfig, props.dashboardFilters);
  const classes = useChartWithFiltersClasses();

  return (
    <div className={classes.chartWithFilters} ref={ref}>
      <Observer>
        <GenericChart {...props} />
      </Observer>
    </div>
  );
});
ChartWithFilters.displayName = "ChartWithFilters";
