import { Box, BoxProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import React, { HTMLProps, forwardRef } from "react";

import ChartPanelLayoutCanvas, {
  chartPanelLayoutGridClasses,
} from "@/components/chart-panel-layout-grid";
import { ChartPanelLayoutTall } from "@/components/chart-panel-layout-tall";
import { ChartPanelLayoutVertical } from "@/components/chart-panel-layout-vertical";
import { ChartSelectionTabs } from "@/components/chart-selection-tabs";
import { DashboardInteractiveFilters } from "@/components/DashboardInteractiveFilters";
import { ChartConfig, Layout, LayoutDashboard } from "@/config-types";
import { hasChartConfigs } from "@/configurator";
import { useConfiguratorState } from "@/src";

const useStyles = makeStyles((theme: Theme) => ({
  panelLayout: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
  },
  chartWrapper: {
    [`.${chartPanelLayoutGridClasses.root} &`]: {
      transition: theme.transitions.create(["box-shadow"], {
        duration: theme.transitions.duration.shortest,
      }),
    },
    [`.${chartPanelLayoutGridClasses.root} &:has(.${chartPanelLayoutGridClasses.dragHandle}:hover)`]:
      {
        boxShadow: theme.shadows[6],
      },
  },
  chartWrapperInner: {
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

export const ChartWrapper = forwardRef<HTMLDivElement, ChartWrapperProps>(
  (props, ref) => {
    const { children, editing, layoutType, ...rest } = props;
    const classes = useStyles();
    return (
      <Box
        ref={ref}
        {...rest}
        className={clsx(classes.chartWrapper, props.className)}
      >
        {(editing || layoutType === "tab") && <ChartSelectionTabs />}
        <Box
          className={classes.chartWrapperInner}
          sx={{ minHeight: [150, 300, 500] }}
        >
          {children}
        </Box>
      </Box>
    );
  }
);

type ChartPanelLayoutProps = React.PropsWithChildren<{
  layoutType: LayoutDashboard["layout"];
  chartConfigs: ChartConfig[];
  renderChart: (chartConfig: ChartConfig) => JSX.Element;
}> &
  HTMLProps<HTMLDivElement>;

export type ChartPanelLayoutTypeProps = {
  chartConfigs: ChartConfig[];
  renderChart: (chartConfig: ChartConfig) => JSX.Element;
};

const Wrappers: Record<
  LayoutDashboard["layout"],
  (props: ChartPanelLayoutTypeProps) => JSX.Element
> = {
  vertical: ChartPanelLayoutVertical,
  tall: ChartPanelLayoutTall,
  canvas: ChartPanelLayoutCanvas,
};

export const ChartPanelLayout = (props: ChartPanelLayoutProps) => {
  const {
    children,
    renderChart,
    chartConfigs,
    className,
    layoutType,
    ...rest
  } = props;
  const classes = useStyles();
  const Wrapper = Wrappers[layoutType];
  const [state] = useConfiguratorState(hasChartConfigs);
  return (
    <div className={clsx(classes.panelLayout, className)} {...rest}>
      {state.layout.type === "dashboard" ? (
        <DashboardInteractiveFilters
          key={chartConfigs.map((x) => x.key).join(",")}
        />
      ) : null}
      <Wrapper chartConfigs={chartConfigs} renderChart={renderChart} />
    </div>
  );
};
