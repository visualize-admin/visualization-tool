import { Box, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import * as d3 from "d3";
import capitalize from "lodash/capitalize";
import React from "react";

import { ChartSelectionTabs } from "@/components/chart-selection-tabs";
import { ChartConfig, Layout } from "@/config-types";
import { hasChartConfigs } from "@/configurator";
import { useConfiguratorState } from "@/configurator/configurator-state";
import {
  DragDropProvider,
  createDragDropContext,
  createUseDragDrop,
} from "@/stores/drag-drop";

const useStyles = makeStyles((theme: Theme) => ({
  panelLayoutVertical: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
  },
  panelLayoutTall: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 50%)",
    gap: theme.spacing(4),

    "& > :nth-child(3n - 2)": {
      gridColumn: "1 / span 2",
    },
    "& > :nth-child(3n - 1, 3n)": {
      gridColumn: "1 / span 1",
    },
  },
  chartWrapper: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.grey[100],
    border: "1px solid",
    borderColor: theme.palette.divider,
    overflow: "hidden",
    width: "auto",
  },
}));

const ChartDragDropContext = createDragDropContext<
  ChartConfig,
  HTMLDivElement
>();
const useChartDragDrop = createUseDragDrop(ChartDragDropContext);

type ChartPanelLayoutProps = {
  chartConfigs: ChartConfig[];
  renderChart: (chartConfig: ChartConfig) => React.ReactNode;
};

export const ChartPanelLayout = (props: ChartPanelLayoutProps) => {
  const { chartConfigs, renderChart } = props;
  return (
    <DragDropProvider Context={ChartDragDropContext}>
      <ChartPanelLayoutInner
        chartConfigs={chartConfigs}
        renderChart={renderChart}
      />
    </DragDropProvider>
  );
};

export const ChartPanelLayoutInner = (props: ChartPanelLayoutProps) => {
  const { chartConfigs, renderChart } = props;
  const classes = useStyles();
  const [, dispatch] = useConfiguratorState(hasChartConfigs);
  const { source, handleDragStart, handleDragUpdate, handleDragEnd } =
    useChartDragDrop((state) => ({
      source: state.source,
      handleDragStart: state.handleDragStart,
      handleDragUpdate: state.handleDragUpdate,
      handleDragEnd: state.handleDragEnd,
    }));
  const wrapperClass = "chart-wrapper";
  const setTargetStyle = React.useCallback(
    (targetElement: HTMLDivElement | null) => {
      if (targetElement) {
        targetElement.style.border = "2px dashed black";
      }
    },
    []
  );
  const resetTargetStyle = React.useCallback(
    (targetElement: HTMLDivElement | null) => {
      if (targetElement) {
        targetElement.style.border = "2px dashed transparent";
      }
    },
    []
  );

  return (
    <div className={classes.panelLayoutTall}>
      {chartConfigs.map((chartConfig) => (
        <Box
          key={chartConfig.key}
          className={wrapperClass}
          sx={{ border: "2px dashed transparent", transition: "border 0.2s" }}
        >
          <ChartWrapper
            onMouseEnter={(e) => {
              if (source) {
                handleDragUpdate(chartConfig, e.currentTarget);
                setTargetStyle(e.currentTarget.parentNode);
              }
            }}
            onMouseLeave={(e) => {
              if (source) {
                handleDragUpdate(null, null);
                resetTargetStyle(e.currentTarget.parentNode);
              }
            }}
            onDragStart={(e) => {
              handleDragStart(chartConfig, e.currentTarget);
              setTargetStyle(e.currentTarget.parentNode);
            }}
            onDragEnd={() => {
              handleDragEnd(({ source, target, targetElement }) => {
                if (source && target) {
                  dispatch({
                    type: "CHART_CONFIG_REORDER",
                    value: {
                      oldIndex: chartConfigs.findIndex(
                        (c) => c.key === source.key
                      ),
                      newIndex: chartConfigs.findIndex(
                        (c) => c.key === target.key
                      ),
                    },
                  });
                }

                if (targetElement?.parentNode instanceof HTMLDivElement) {
                  resetTargetStyle(targetElement.parentNode);
                }
              });
            }}
          >
            {renderChart(chartConfig)}
          </ChartWrapper>
        </Box>
      ))}
    </div>
  );
};

type ChartPanelProps = React.PropsWithChildren<{
  editing?: boolean;
  layout?: Layout;
  onDragStart?: (e: any) => void;
  onDragEnd?: () => void;
  onMouseEnter?: (e: any) => void;
  onMouseLeave?: (e: any) => void;
}>;

export const ChartWrapper = (props: ChartPanelProps) => {
  const {
    children,
    editing,
    layout,
    onDragStart = () => {},
    onDragEnd = () => {},
    onMouseEnter,
    onMouseLeave,
  } = props;
  const classes = useStyles();
  const ref = React.useRef<HTMLDivElement>(null);
  const wrapperChildrenClass = "chart-wrapper-children";
  console.log("render");

  React.useEffect(() => {
    if (ref.current) {
      const selection = d3.select(ref.current);
      const node = selection.node() as HTMLDivElement;
      let clone: HTMLDivElement;
      const moveClone = (
        e: d3.D3DragEvent<HTMLDivElement, unknown, { x: number; y: number }>
      ) => {
        clone.style.left = `${e.sourceEvent.clientX - e.subject.x}px`;
        clone.style.top = `${e.sourceEvent.clientY - e.subject.y}px`;
      };

      const drag = d3
        .drag<HTMLDivElement, unknown>()
        .on("start", (e) => {
          onDragStart(e.sourceEvent);

          clone = node.cloneNode(true) as HTMLDivElement;
          moveClone(e);
          clone.style.zIndex = "10000";
          clone.style.position = "absolute";
          clone.style.width = `${node.offsetWidth}px`;
          clone.style.height = `${node.offsetHeight}px`;
          clone.style.boxShadow = "0 0 2px rgba(0, 0, 0, 0.2)";
          clone.style.pointerEvents = "none";
          document.body.appendChild(clone);

          d3.selectAll(`.${wrapperChildrenClass}`).style(
            "pointer-events",
            "none"
          );
        })
        .on("drag", (e) => {
          moveClone(e);

          //  scroll body if needed
          // const scrollThreshold = 100;
          // const scrollSpeed = 5;
          // const scrollY = e.sourceEvent.clientY;
          // const scrollElement = d3
          //   .select(".makeStyles-MPanelBodyWrapper-18")
          //   .node() as HTMLDivElement;
          // const scrollTop = scrollElement.scrollTop;
          // const scrollHeight = scrollElement.scrollHeight;
          // const windowHeight = window.innerHeight;

          // if (scrollY < scrollThreshold) {
          //   scrollElement.scrollTop = scrollTop - scrollSpeed;
          // } else if (scrollY > windowHeight - scrollThreshold) {
          //   scrollElement.scrollTop = scrollTop + scrollSpeed;
          // }

          // if (scrollTop < 0) {
          //   scrollElement.scrollTop = 0;
          // } else if (scrollTop > scrollHeight - windowHeight) {
          //   scrollElement.scrollTop = scrollHeight - windowHeight;
          // }
        })
        .on("end", () => {
          onDragEnd();
          d3.selectAll(`.${wrapperChildrenClass}`).style(
            "pointer-events",
            "all"
          );

          d3.select(clone)
            .transition()
            .duration(200)
            .style("opacity", 0)
            .remove();
        });

      selection.call(drag);
    }
  }, [onDragEnd, onDragStart, ref]);

  return (
    <>
      {(editing || layout?.type === "tab") && <ChartSelectionTabs />}
      <Box
        ref={ref}
        className={classes.chartWrapper}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
          minHeight: [150, 300, 500],
          height: "100%",
        }}
      >
        <div className={wrapperChildrenClass}>{children}</div>
      </Box>
    </>
  );
};

type ChartPanelLayoutOldProps = React.PropsWithChildren<{
  type: Extract<Layout, { type: "dashboard" }>["layout"];
}>;

export const ChartPanelLayoutOld = (props: ChartPanelLayoutOldProps) => {
  const { children, type } = props;
  const classes = useStyles();

  return (
    <Box
      className={
        classes[
          `panelLayout${
            capitalize(type) as Capitalize<ChartPanelLayoutOldProps["type"]>
          }`
        ]
      }
    >
      {children}
    </Box>
  );
};
