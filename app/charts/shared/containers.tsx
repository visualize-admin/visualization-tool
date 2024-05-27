import { Box, BoxProps } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { select } from "d3-selection";
import { ReactNode, useEffect, useRef } from "react";

import { useChartState } from "@/charts/shared/chart-state";
import { CalculationToggle } from "@/charts/shared/interactive-filter-calculation-toggle";
import { useObserverRef } from "@/charts/shared/use-width";
import { chartPanelLayoutGridClasses } from "@/components/chart-panel-layout-grid";
import { ChartConfig } from "@/configurator";
import { useTransitionStore } from "@/stores/transition";

const useStyles = makeStyles<
  {},
  {},
  ChartConfig["chartType"] | "chartContainer"
>(() => ({
  chartContainer: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    flexGrow: 1,

    // TODO The aspect ratio is currently set for the whole chart instead of
    // affecting only the plot area. Only the plot area should be affected
    // otherwise long y-axis ticks squash vertically a chart.
    // To remedy, the aspectRatio should be provided via context so that
    // the chart state function can get it and apply it to the plot area.
    // The ReactGridChartPreview component should also disable this behavior.
    aspectRatio: "5 / 2",
    minHeight: 300,

    [`.${chartPanelLayoutGridClasses.root} &`]: {
      aspectRatio: "auto",
      minHeight: 0,
    },
  },

  // Chart type specific styles, if we need for example to set a specific aspect-ratio
  // for a specific chart type
  area: {},
  column: {},
  comboLineColumn: {},
  comboLineDual: {},
  comboLineSingle: {},
  line: {},
  map: {},
  pie: {},
  scatterplot: {},
  table: {},
}));

export const ChartContainer = ({
  children,
  type,
}: {
  children: ReactNode;
  type: ChartConfig["chartType"];
}) => {
  const ref = useObserverRef();
  const classes = useStyles();

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={clsx(classes.chartContainer, classes[type])}
    >
      {children}
    </div>
  );
};

export const ChartSvg = ({ children }: { children: ReactNode }) => {
  const ref = useRef<SVGSVGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { bounds, interactiveFiltersConfig } = useChartState();
  const { width, height, margins } = bounds;

  useEffect(() => {
    if (ref.current) {
      // Initialize height on mount.
      if (!ref.current.getAttribute("height")) {
        ref.current.setAttribute("height", height.toString());
      }

      const sel = select(ref.current);
      (enableTransition
        ? sel.transition().duration(transitionDuration)
        : sel
      ).attr("height", height);
    }
  }, [height, enableTransition, transitionDuration]);

  return (
    <svg
      ref={ref}
      width={width}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      {interactiveFiltersConfig?.calculation.active && (
        <foreignObject
          width={width - margins.right}
          height="24"
          style={{ textAlign: "right" }}
        >
          <CalculationToggle />
        </foreignObject>
      )}
      {children}
    </svg>
  );
};

export const ChartControlsContainer = (props: BoxProps) => {
  const { sx, ...rest } = props;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        mt: 2,
        mb: 4,
        ...sx,
      }}
      {...rest}
    />
  );
};
