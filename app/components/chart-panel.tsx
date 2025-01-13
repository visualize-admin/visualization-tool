import { Box, BoxProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { selectAll } from "d3-selection";
import {
  forwardRef,
  HTMLProps,
  PropsWithChildren,
  useCallback,
  useEffect,
} from "react";

import {
  ChartPanelLayoutCanvas,
  chartPanelLayoutGridClasses,
} from "@/components/chart-panel-layout-grid";
import { ChartPanelLayoutTall } from "@/components/chart-panel-layout-tall";
import { ChartPanelLayoutVertical } from "@/components/chart-panel-layout-vertical";
import { ChartSelectionTabs } from "@/components/chart-selection-tabs";
import { DashboardInteractiveFilters } from "@/components/dashboard-interactive-filters";
import { DragHandle } from "@/components/drag-handle";
import { Markdown } from "@/components/markdown";
import { ROW_HEIGHT } from "@/components/react-grid";
import { ChartConfig, Layout, LayoutDashboard } from "@/config-types";
import {
  hasChartConfigs,
  isLayouting,
  LayoutBlock,
  LayoutTextBlock,
} from "@/configurator";
import { useConfiguratorState, useLocale } from "@/src";
import useEvent from "@/utils/use-event";

const useStyles = makeStyles<Theme, { editable?: boolean }>((theme) => ({
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
  textBlockWrapper: {
    display: "flex",
    padding: "0.75rem",
    cursor: ({ editable }) => (editable ? "pointer" : "default"),
    "&:hover": {
      textDecoration: ({ editable }) => (editable ? "underline" : "none"),
    },
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
    const classes = useStyles({});

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

const TEXT_BLOCK_WRAPPER_CLASS = "text-block-wrapper";
const TEXT_BLOCK_CONTENT_CLASS = "text-block-content";

export const ChartPanelLayout = ({
  children,
  renderChart,
  chartConfigs,
  className,
  layoutType,
  ...rest
}: ChartPanelLayoutProps) => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const layouting = isLayouting(state);
  const classes = useStyles({ editable: layouting });
  const Wrapper = Wrappers[layoutType];
  const { layout } = state;
  const { blocks } = layout;

  const handleTextBlockClick = useEvent((block: LayoutTextBlock) => {
    dispatch({
      type: "LAYOUT_ACTIVE_FIELD_CHANGED",
      value: block.key,
    });
  });

  const renderTextBlock = useCallback(
    (block: LayoutTextBlock) => {
      return (
        <div
          // Important, otherwise ReactGrid breaks.
          key={block.key}
          id={block.key}
          className={clsx(classes.textBlockWrapper, TEXT_BLOCK_WRAPPER_CLASS)}
          onClick={(e) => {
            if (e.isPropagationStopped()) {
              return;
            }

            handleTextBlockClick(block);
          }}
        >
          <div
            className={TEXT_BLOCK_CONTENT_CLASS}
            style={{ flexGrow: 1, height: "fit-content" }}
          >
            <Markdown>{block.text[locale]}</Markdown>
          </div>
          {layouting ? (
            <DragHandle
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          ) : null}
        </div>
      );
    },
    [classes.textBlockWrapper, handleTextBlockClick, layouting, locale]
  );

  useSyncTextBlockHeight();

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

const useSyncTextBlockHeight = () => {
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const layout = state.layout;
  const layouting = isLayouting(state);

  useEffect(() => {
    // Only adjust the height when not in published mode.
    if (
      !layouting ||
      layout.type !== "dashboard" ||
      layout.layout !== "canvas"
    ) {
      return;
    }

    selectAll<HTMLDivElement, unknown>(`.${TEXT_BLOCK_WRAPPER_CLASS}`).each(
      function () {
        const wrapperEl = this;
        const contentEl = wrapperEl.querySelector<HTMLDivElement>(
          `.${TEXT_BLOCK_CONTENT_CLASS}`
        );

        if (!contentEl) {
          return;
        }

        const key = wrapperEl.id;
        const h = Math.ceil(contentEl.clientHeight / ROW_HEIGHT) || 1;
        // TODO: how to get current layout?
        const bp = "xl";
        const blockLayout = layout.layouts[bp].find((b) => b.i === key);

        if (blockLayout && blockLayout.minH !== h) {
          dispatch({
            type: "LAYOUT_CHANGED",
            value: {
              ...layout,
              layouts: {
                ...layout.layouts,
                [bp]: layout.layouts[bp].map((b) => {
                  return b.i === key ? { ...b, h, minH: h } : b;
                }),
              },
            },
          });
        }
      }
    );
  }, [dispatch, layout, layouting]);
};
