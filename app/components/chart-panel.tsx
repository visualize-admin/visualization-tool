import { Box, BoxProps, Theme, useMediaQuery } from "@mui/material";
import { makeStyles } from "@mui/styles";
import capitalize from "lodash/capitalize";
import React from "react";

import { AlignChartElementsProvider } from "@/components/chart-preview";
import { ChartSelectionTabs } from "@/components/chart-selection-tabs";
import { ChartConfig, Layout } from "@/config-types";
import { useTheme } from "@/themes";

const useStyles = makeStyles((theme: Theme) => ({
  panelLayoutVertical: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
  },
  panelLayoutTall: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
  },
  chartWrapper: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.grey[100],
    border: "1px solid",
    borderColor: theme.palette.divider,
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
      <Box ref={ref} {...rest}>
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

type ChartPanelLayoutProps = React.PropsWithChildren<{
  type: Extract<Layout, { type: "dashboard" }>["layout"];
}>;

export const ChartPanelLayout = (props: ChartPanelLayoutProps) => {
  const { children, type } = props;
  const classes = useStyles();

  return (
    <div
      className={
        classes[
          `panelLayout${
            capitalize(type) as Capitalize<ChartPanelLayoutProps["type"]>
          }`
        ]
      }
    >
      {children}
    </div>
  );
};

type ChartPanelLayoutVerticalProps = {
  chartConfigs: ChartConfig[];
  renderChart: (chartConfig: ChartConfig) => JSX.Element;
};

export const ChartPanelLayoutVertical = (
  props: ChartPanelLayoutVerticalProps
) => {
  const { chartConfigs, renderChart } = props;

  return (
    <ChartPanelLayout type="tall">
      {chartConfigs.map(renderChart)}
    </ChartPanelLayout>
  );
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
    <ChartPanelLayout type="tall">
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
      return (
        <AlignChartElementsProvider>
          {row.renderChart(row.chartConfig)}
        </AlignChartElementsProvider>
      );
    case "narrow":
      if (isMobile) {
        return (
          <>
            {row.chartConfigs.map((chartConfig) => (
              <AlignChartElementsProvider key={chartConfig.key}>
                {row.renderChart(chartConfig)}
              </AlignChartElementsProvider>
            ))}
          </>
        );
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
          <AlignChartElementsProvider>
            {row.chartConfigs.map(row.renderChart)}
          </AlignChartElementsProvider>
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
