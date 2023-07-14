import { Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { Selection, bisector, brushX, scaleTime, select } from "d3";
import { useCallback, useEffect, useRef } from "react";

import Flex from "@/components/flex";
import { Label } from "@/components/form";
import { parseDate } from "@/configurator/components/ui-helpers";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { updateInteractiveTimeRangeFilter } from "@/configurator/interactive-filters/interactive-filters-config-state";
import { DimensionValue } from "@/domain/data";
import { useTheme } from "@/themes";
import { useResizeObserver } from "@/utils/use-resize-observer";
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
  formatDate,
}: {
  timeExtent: Date[];
  timeDataPoints?: DimensionValue[];
  disabled: boolean;
  formatDate: (d: Date) => string;
}) => {
  const [resizeRef, width] = useResizeObserver<HTMLDivElement>();
  const brushRef = useRef<SVGGElement>(null);
  const theme = useTheme();

  // FIXME: make component responsive (currently triggers infinite loop)
  const brushWidth = 267;

  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const { chartConfig } = state;

  const timeScale = scaleTime().domain(timeExtent).range([0, brushWidth]);

  const getClosestDimensionValue = useCallback(
    (date: Date): Date => {
      if (timeDataPoints) {
        const dimensionValues = timeDataPoints.map((d) =>
          parseDate(d.value as string)
        );

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
      const newIFConfig = updateInteractiveTimeRangeFilter(
        chartConfig.interactiveFiltersConfig,
        { timeExtent: [formatDate(xStart), formatDate(xEnd)] }
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
        .attr("fill", theme.palette.grey[300])
        .attr("fill-opacity", 0.9);
      g.select(".selection")
        .attr("pointer-events", disabled && "none")
        .attr(
          "fill",
          disabled ? theme.palette.grey[500] : theme.palette.primary.main
        )
        .attr("fill-opacity", 1)
        .attr("stroke", "none");
      g.selectAll(".handle")
        .attr("pointer-events", disabled && "none")
        .attr(
          "fill",
          disabled ? theme.palette.grey[500] : theme.palette.primary.main
        )
        .style("y", `-${HANDLE_HEIGHT / 2 - 1}px`)
        .style("width", `${HANDLE_HEIGHT}px`)
        .style("height", `${HANDLE_HEIGHT}px`)
        .attr("rx", `${HANDLE_HEIGHT}px`);

      g.call(brush);
    };

    mkBrush(g as Selection<SVGGElement, unknown, null, undefined>);
  }, [brush, disabled, theme.palette.grey, theme.palette.primary.main]);

  // Set default selection to currently selected extent (or full extent if no
  // extent has been selected yet). Currently selected extent is kept when
  // switching chart types.
  useEffect(() => {
    let defaultSelection = timeExtent.map((d) => timeScale(d));
    const { interactiveFiltersConfig } = chartConfig;

    if (interactiveFiltersConfig) {
      const { from, to } = interactiveFiltersConfig.timeRange.presets;

      if (from && to) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        defaultSelection = [timeScale(fromDate), timeScale(toDate)];
      }
    }

    const g = select(brushRef.current);
    (g as Selection<SVGGElement, unknown, null, undefined>).call(
      brush.move,
      defaultSelection
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <Typography component="div" variant="caption">
          {chartConfig &&
            chartConfig.interactiveFiltersConfig?.timeRange.presets.from &&
            formatDate(
              getClosestDimensionValue(
                parseDate(
                  chartConfig.interactiveFiltersConfig?.timeRange.presets.from
                )
              )
            )}
        </Typography>
        <Typography component="div" variant="caption">
          {chartConfig &&
            chartConfig.interactiveFiltersConfig?.timeRange.presets.to &&
            formatDate(
              getClosestDimensionValue(
                parseDate(
                  chartConfig.interactiveFiltersConfig?.timeRange.presets.to
                )
              )
            )}
        </Typography>
      </Flex>
    </Box>
  );
};
