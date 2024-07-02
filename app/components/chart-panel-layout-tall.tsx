import { Box, useMediaQuery } from "@mui/material";
import { useMemo } from "react";

import { ChartConfig } from "@/config-types";
import { useTheme } from "@/themes";

type ChartPanelLayoutTallProps = {
  chartConfigs: ChartConfig[];
  renderChart: (chartConfig: ChartConfig) => JSX.Element;
};

export const ChartPanelLayoutTall = (props: ChartPanelLayoutTallProps) => {
  const { chartConfigs, renderChart } = props;
  const rows = useMemo(() => {
    return getChartPanelLayoutTallRows(chartConfigs, renderChart);
  }, [chartConfigs, renderChart]);

  return (
    <>
      {rows.map((row, i) => (
        <ChartPanelLayoutTallRow key={i} row={row} />
      ))}
    </>
  );
};
type ChartPanelLayoutTallRowProps = {
  row: ChartPanelLayoutTallRow;
};

const ChartPanelLayoutTallRow = (props: ChartPanelLayoutTallRowProps) => {
  const { row } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  switch (row.type) {
    case "wide":
      return row.renderChart(row.chartConfig);
    case "narrow":
      if (isMobile) {
        return <>{row.chartConfigs.map(row.renderChart)}</>;
      }

      return (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "calc(50% - 8px) calc(50% - 8px)",
            },
            gridAutoRows: "min-content",
            columnGap: 4,
          }}
        >
          {row.chartConfigs.map(row.renderChart)}
        </Box>
      );
  }
};
type ChartPanelLayoutTallRow = {
  renderChart: (chartConfig: ChartConfig) => JSX.Element;
} & (
  | {
      type: "wide";
      chartConfig: ChartConfig;
    }
  | {
      type: "narrow";
      chartConfigs: [ChartConfig] | [ChartConfig, ChartConfig];
    }
);

export const getChartPanelLayoutTallRows = (
  chartConfigs: ChartConfig[],
  renderChart: (chartConfig: ChartConfig) => JSX.Element
): ChartPanelLayoutTallRow[] => {
  const rows: ChartPanelLayoutTallRow[] = [];

  for (let i = 0; i < chartConfigs.length; i += 1) {
    if (i % 3 === 0) {
      rows.push({
        type: "wide",
        chartConfig: chartConfigs[i],
        renderChart,
      });
    }

    if (i % 3 === 1) {
      const currentConfig = chartConfigs[i];
      const nextConfig = chartConfigs[i + 1];
      rows.push({
        type: "narrow",
        chartConfigs: nextConfig
          ? [currentConfig, nextConfig]
          : [currentConfig],
        renderChart,
      });
    }
  }

  return rows;
};
