import { Box, BoxProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { forwardRef, HTMLProps, PropsWithChildren, useCallback } from "react";

import {
  ChartPanelLayoutCanvas,
  chartPanelLayoutGridClasses,
} from "@/components/chart-panel-layout-grid";
import { ChartPanelLayoutTall } from "@/components/chart-panel-layout-tall";
import { ChartPanelLayoutVertical } from "@/components/chart-panel-layout-vertical";
import { ChartSelectionTabs } from "@/components/chart-selection-tabs";
import { DashboardInteractiveFilters } from "@/components/dashboard-interactive-filters";
import { Markdown } from "@/components/markdown";
import { ChartConfig, Layout, LayoutDashboard } from "@/config-types";
import { hasChartConfigs, LayoutBlock, LayoutTextBlock } from "@/configurator";
import { useConfiguratorState, useLocale } from "@/src";

const useStyles = makeStyles((theme: Theme) => ({
  panelLayout: {
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
  },
  chartWrapper: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
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
    width: "auto",
    height: "100%",
  },
}));

export const getChartWrapperId = (chartKey: string) =>
  `chart-wrapper-${chartKey}`;

export type ChartWrapperProps = BoxProps & {
  editing?: boolean;
  layoutType?: Layout["type"];
  chartKey: string;
};

export const ChartWrapper = forwardRef<HTMLDivElement, ChartWrapperProps>(
  (props, ref) => {
    const { children, editing, layoutType, ...rest } = props;
    const classes = useStyles();
    return (
      <Box
        ref={ref}
        {...rest}
        id={getChartWrapperId(props.chartKey)}
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

type ChartPanelLayoutProps = PropsWithChildren<{
  layoutType: LayoutDashboard["layout"];
  chartConfigs: ChartConfig[];
  renderChart: (chartConfig: ChartConfig) => JSX.Element;
}> &
  HTMLProps<HTMLDivElement>;

export type ChartPanelLayoutTypeProps = {
  blocks: LayoutBlock[];
  renderBlock: (block: LayoutBlock) => JSX.Element;
  className?: string;
};

const Wrappers: Record<
  LayoutDashboard["layout"],
  (props: ChartPanelLayoutTypeProps) => JSX.Element
> = {
  vertical: ChartPanelLayoutVertical,
  tall: ChartPanelLayoutTall,
  canvas: ChartPanelLayoutCanvas,
};

export const ChartPanelLayout = ({
  children,
  renderChart,
  chartConfigs,
  className,
  layoutType,
  ...rest
}: ChartPanelLayoutProps) => {
  const locale = useLocale();
  const classes = useStyles();
  const Wrapper = Wrappers[layoutType];
  const [state] = useConfiguratorState(hasChartConfigs);
  const { layout } = state;
  const { blocks } = layout;

  const renderTextBlock = useCallback(
    (textBlock: LayoutTextBlock) => {
      return (
        // Key is important, otherwise ReactGrid breaks.
        <div key={textBlock.key} style={{ padding: "0.75rem" }}>
          <Markdown>{textBlock.text[locale]}</Markdown>
        </div>
      );
    },
    [locale]
  );

  const renderBlock = useCallback(
    (block: LayoutBlock) => {
      switch (block.type) {
        case "chart":
          const chartConfig = chartConfigs.find(
            (c) => c.key === block.key
          ) as ChartConfig;
          return renderChart(chartConfig);
        case "text":
          return renderTextBlock(block);
        default:
          const _exhaustiveCheck: never = block;
          return _exhaustiveCheck;
      }
    },
    [chartConfigs, renderChart, renderTextBlock]
  );

  return (
    <div className={clsx(classes.panelLayout, className)} {...rest}>
      {state.layout.type === "dashboard" ? (
        <DashboardInteractiveFilters
          // We want to completely remount this component if chartConfigs change
          key={chartConfigs.map((x) => x.key).join(",")}
        />
      ) : null}
      <Wrapper blocks={blocks} renderBlock={renderBlock} />
    </div>
  );
};
