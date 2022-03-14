import Flex from "../../components/flex";;
import { Trans } from "@lingui/macro";
import { bisector, brushX, scaleTime, select, Selection } from "d3";
import React, { useCallback, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Label } from "../../components/form";
import { useResizeObserver } from "../../lib/use-resize-observer";
import { useTheme } from "../../themes";
import { parseDate, useFormatFullDateAuto } from "../components/ui-helpers";
import { ConfiguratorStateDescribingChart } from "../config-types";
import { useConfiguratorState } from "../configurator-state";
import { updateInteractiveTimeFilter } from "./interactive-filters-config-state";

const HANDLE_HEIGHT = 20;
const BRUSH_HEIGHT = 3;
const MARGINS = {
  top: HANDLE_HEIGHT / 2,
  right: 8,
  bottom: HANDLE_HEIGHT / 2,
  left: 8,
};

export const EditorBrush = ({
  timeExtent,
  timeDataPoints,
  disabled,
}: {
  timeExtent: Date[];
  timeDataPoints?: {
    __typename: "DimensionValue";
    value: string;
    label: string;
  }[];
  disabled: boolean;
}) => {
  const [resizeRef, width] = useResizeObserver<HTMLDivElement>();
  const brushRef = useRef<SVGGElement>(null);
  const theme = useTheme();
  const formatDateAuto = useFormatFullDateAuto();

  // FIXME: make component responsive (currently triggers infinite loop)
  const brushWidth = 267; //width - MARGINS.left - MARGINS.right;

  const [state, dispatch] = useConfiguratorState();
  const { chartConfig } = state as ConfiguratorStateDescribingChart;

  const timeScale = scaleTime().domain(timeExtent).range([0, brushWidth]);

  const getClosestDimensionValue = useCallback(
    (date: Date): Date => {
      if (timeDataPoints) {
        const dimensionValues = timeDataPoints.map((d) => parseDate(d.value));

        const bisectDateLeft = bisector(
          (dvs: Date, date: Date) => dvs.getTime() - date.getTime()
        ).left;

        const startIndex = bisectDateLeft(dimensionValues, date, 1);
        const dStartLeft = dimensionValues[startIndex - 1];
        const dStartRight = dimensionValues[startIndex] || dStartLeft;
        const closestDatum =
          date.getTime() - dStartLeft.getTime() >
          dStartRight.getTime() - date.getTime()
            ? dStartRight
            : dStartLeft;

        return closestDatum;
      } else {
        return date;
      }
    },
    [timeDataPoints]
  );

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

  useEffect(() => {
    const g = select(brushRef.current);
    const mkBrush = (g: Selection<SVGGElement, unknown, null, undefined>) => {
      g.select(".overlay")
        .attr("pointer-events", disabled && "none")
        .attr("fill", theme.colors.monochrome300)
        .attr("fill-opacity", 0.9);
      g.select(".selection")
        .attr("pointer-events", disabled && "none")
        .attr(
          "fill",
          disabled ? theme.colors.monochrome500 : theme.colors.primary
        )
        .attr("fill-opacity", 1)
        .attr("stroke", "none");
      g.selectAll(".handle")
        .attr("pointer-events", disabled && "none")
        .attr(
          "fill",
          disabled ? theme.colors.monochrome500 : theme.colors.primary
        )
        .style("y", `-${HANDLE_HEIGHT / 2 - 1}px`)
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
    };

    mkBrush(g as Selection<SVGGElement, unknown, null, undefined>);
  }, [
    brush,
    disabled,
    theme.colors.monochrome300,
    theme.colors.monochrome500,
    theme.colors.primary,
  ]);

  // Set default selection to full extent
  useEffect(() => {
    const defaultSelection = timeExtent.map((d) => timeScale(d));
    const g = select(brushRef.current);
    (g as Selection<SVGGElement, unknown, null, undefined>).call(
      brush.move,
      defaultSelection
    );
  }, []);

  return (
    <Box sx={{ mt: 4 }}>
      <Label smaller htmlFor="editor-brush">
        <Trans id="controls..interactiveFilters.time.defaultSettings">
          Default Settings
        </Trans>
      </Label>
      <Box ref={resizeRef} id="editor-brush">
        {width > 0 && (
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
      <Flex sx={{ justifyContent: "space-between" }}>
        <Typography component="div" variant="meta">
          {chartConfig &&
            chartConfig.interactiveFiltersConfig?.time.presets.from &&
            formatDateAuto(
              getClosestDimensionValue(
                parseDate(
                  chartConfig.interactiveFiltersConfig?.time.presets.from
                )
              )
            )}
        </Typography>
        <Typography component="div" variant="meta">
          {chartConfig &&
            chartConfig.interactiveFiltersConfig?.time.presets.to &&
            formatDateAuto(
              getClosestDimensionValue(
                parseDate(chartConfig.interactiveFiltersConfig?.time.presets.to)
              )
            )}
        </Typography>
      </Flex>
    </Box>
  );
};
