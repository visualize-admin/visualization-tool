import { brushX, scaleTime, select, Selection } from "d3";
import "d3-transition";
import { useCallback, useEffect, useRef } from "react";
import { Box } from "theme-ui";
import { useResizeObserver } from "../../lib/use-resize-observer";
import { useTheme } from "../../themes";
import { ConfiguratorStateDescribingChart } from "../config-types";
import { useConfiguratorState } from "../configurator-state";
import { updateInteractiveTimeFilter } from "./interactive-filters-config-state";

const HANDLE_HEIGHT = 20;
const BRUSH_HEIGHT = 3;
const MARGINS = {
  top: HANDLE_HEIGHT / 2,
  right: HANDLE_HEIGHT / 2,
  bottom: HANDLE_HEIGHT / 2,
  left: HANDLE_HEIGHT / 2,
};

export const EditorBrush = ({ timeExtent }: { timeExtent: Date[] }) => {
  const [resizeRef, width] = useResizeObserver<HTMLDivElement>();
  const brushRef = useRef<SVGGElement>(null);
  const theme = useTheme();
  const brushWidth = width - MARGINS.left - MARGINS.right;

  const [state, dispatch] = useConfiguratorState();
  const { chartConfig } = state as ConfiguratorStateDescribingChart;

  const timeScale = scaleTime().domain(timeExtent).range([0, brushWidth]);

  const brushed = ({ selection }: { selection: [number, number] }) => {
    if (selection) {
      const [xStart, xEnd] = selection.map((s) => timeScale.invert(s));

      // Update interactive brush presets
      // The dates don't correspond to a data point.
      const newIFConfig = updateInteractiveTimeFilter(
        chartConfig.interactiveFiltersConfig,
        {
          path: "time",
          timeExtent: [xStart.toISOString(), xEnd.toISOString()],
        }
      );
      dispatch({
        type: "INTERACTIVE_FILTER_CHANGED",
        value: newIFConfig,
      });
    }
  };

  const brush = brushX()
    .extent([
      [0, 0],
      [brushWidth, BRUSH_HEIGHT],
    ])
    .on("end", brushed);
  // .on("end", updateBrushStatus);

  const mkBrush = useCallback(
    (g: Selection<SVGGElement, unknown, null, undefined>) => {
      g.select(".overlay")
        .attr("fill", theme.colors.monochrome300)
        .attr("fill-opacity", 0.9);
      g.select(".selection")
        .attr("fill", theme.colors.primary)
        .attr("fill-opacity", 1)
        .attr("stroke", "none");
      g.selectAll(".handle")
        .attr("fill", theme.colors.primary)
        .style("y", `-${HANDLE_HEIGHT / 2}px`)
        // .style("transform", `translateX(-${0}px)`)
        .style("width", `${HANDLE_HEIGHT}px`)
        .style("height", `${HANDLE_HEIGHT}px`)
        .attr("rx", `${HANDLE_HEIGHT}px`);

      // g.select(".handle--w")
      //   .attr("tabindex", 0)
      //   .on("keydown", (e: $FixMe) => moveBrushOnKeyPress(e, "w"));
      // g.select(".handle--e")
      //   .attr("tabindex", 0)
      //   .on("keydown", (e: $FixMe) => moveBrushOnKeyPress(e, "e"));

      // Apply brush to selected group
      g.call(brush);
    },
    [brush, theme.colors.monochrome300, theme.colors.primary]
  );

  useEffect(() => {
    const g = select(brushRef.current);
    mkBrush(g as Selection<SVGGElement, unknown, null, undefined>);
  }, [mkBrush]);

  return (
    <Box ref={resizeRef}>
      {width && (
        <svg
          width={width + MARGINS.left + MARGINS.right}
          height={BRUSH_HEIGHT + MARGINS.top + MARGINS.bottom}
        >
          <g
            ref={brushRef}
            transform={`translate(${MARGINS.left}, ${MARGINS.top})`}
          />
        </svg>
      )}
    </Box>
  );
};
