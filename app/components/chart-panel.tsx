import { Box, BoxProps, Theme, useMediaQuery } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";

import { ChartSelectionTabs } from "@/components/chart-selection-tabs";
import { ChartConfig, Layout } from "@/config-types";
import { useTheme } from "@/themes";

const useStyles = makeStyles((theme: Theme) => ({
  panelLayout: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
  },
  chartWrapper: {
    display: "contents",
    overflow: "hidden",
    width: "auto",
    height: "100%",
  },
}));

export type ChartWrapperProps = BoxProps & {
  editing?: boolean;
  layoutType?: Layout["type"];
};

export const ChartWrapper = React.forwardRef<HTMLDivElement, ChartWrapperProps>(
  (props, ref) => {
    const { children, editing, layoutType, ...rest } = props;
    const classes = useStyles();
    return (
      <Box ref={ref} {...rest} sx={{ ...rest.sx, display: "contents" }}>
        {(editing || layoutType === "tab") && <ChartSelectionTabs />}
        <Box
          className={classes.chartWrapper}
          sx={{ minHeight: [150, 300, 500] }}
        >
          {children}
        </Box>
      </Box>
    );
  }
);

type ChartPanelLayoutProps = React.PropsWithChildren<{}>;

export const ChartPanelLayout = (props: ChartPanelLayoutProps) => {
  const { children } = props;
  const classes = useStyles();
  return <div className={classes.panelLayout}>{children}</div>;
};

type ChartPanelLayoutVerticalProps = {
  chartConfigs: ChartConfig[];
  renderChart: (chartConfig: ChartConfig) => JSX.Element;
};

export const ChartPanelLayoutVertical = (
  props: ChartPanelLayoutVerticalProps
) => {
  const { chartConfigs, renderChart } = props;
  return <ChartPanelLayout>{chartConfigs.map(renderChart)}</ChartPanelLayout>;
};

type ChartPanelLayoutTallProps = {
  chartConfigs: ChartConfig[];
  renderChart: (chartConfig: ChartConfig) => JSX.Element;
};

export const ChartPanelLayoutTall = (props: ChartPanelLayoutTallProps) => {
  const { chartConfigs, renderChart } = props;
  const rows = React.useMemo(() => {
    return getChartPanelLayoutTallRows(chartConfigs, renderChart);
  }, [chartConfigs, renderChart]);

  return (
    <ChartPanelLayout>
      {rows.map((row, i) => (
        <ChartPanelLayoutTallRow key={i} row={row} />
      ))}
    </ChartPanelLayout>
  );
};

type ChartPanelLayoutTallRowProps = {
  row: ChartPanelLayoutTallRow;
};

export const ChartPanelLayoutTallRow = (
  props: ChartPanelLayoutTallRowProps
) => {
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
            gap: "16px",
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
