import { Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import {
  brushX,
  CountableTimeInterval,
  scaleTime,
  select,
  Selection,
} from "d3";
import React, { useCallback, useEffect, useRef } from "react";

import Flex from "@/components/flex";
import { Label } from "@/components/form";
import { useFormatFullDateAuto } from "@/configurator/components/ui-helpers";
import { useResizeObserver } from "@/lib/use-resize-observer";
import { useTheme } from "@/themes";

const HANDLE_SIZE = 20;
const HANDLE_OFFSET = HANDLE_SIZE / 8;
const BRUSH_HEIGHT = 3;
const MARGIN = HANDLE_SIZE / 2;

export const EditorIntervalBrush = ({
  timeExtent,
  timeRange,
  timeInterval,
  onChange,
  disabled = false,
}: {
  timeExtent: Date[];
  timeRange: Date[];
  timeInterval: CountableTimeInterval;
  onChange: (extent: Date[]) => void;
  disabled?: boolean;
}) => {
  const [resizeRef, width] = useResizeObserver<HTMLDivElement>();
  const brushRef = useRef<SVGGElement>(null);
  const theme = useTheme();
  const formatDateAuto = useFormatFullDateAuto();

  const brushWidth = width - (MARGIN + HANDLE_OFFSET) * 2;
  const timeScale = scaleTime().domain(timeExtent).range([0, brushWidth]);

  const getClosestDimensionValue = useCallback(
    (date: Date): Date => {
      return timeInterval.round(date);
    },
    [timeInterval]
  );

  const brushed = ({ selection }: { selection: [number, number] }) => {
    if (selection) {
      const [xStart, xEnd] = selection.map((s) =>
        getClosestDimensionValue(timeScale.invert(s))
      );

      onChange([xStart, xEnd]);
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
        .style("y", `-${HANDLE_SIZE / 2 - 1}px`)
        .style("width", `${HANDLE_SIZE}px`)
        .style("height", `${HANDLE_SIZE}px`)
        .attr("rx", `${HANDLE_SIZE}px`);

      g.call(brush);
    };

    mkBrush(g as Selection<SVGGElement, unknown, null, undefined>);
  }, [brush, disabled, theme.palette.grey, theme.palette.primary.main]);

  // Set default selection to full extent
  const [fromPx, toPx] = timeRange.map(timeScale);

  // FIXME: fix dependency array but don't include brush.move!
  useEffect(() => {
    const g = select(brushRef.current);
    (g as Selection<SVGGElement, unknown, null, undefined>).call(brush.move, [
      fromPx,
      toPx,
    ]);
  }, [fromPx, toPx]);

  return (
    <Box sx={{ mt: 4 }}>
      <Label smaller htmlFor="editor-brush">
        <Trans id="controls.filters.time.range">Time Range</Trans>
      </Label>
      <Box ref={resizeRef} id="editor-brush">
        {width > 0 && (
          <svg width={width} height={BRUSH_HEIGHT + MARGIN * 2}>
            <g
              ref={brushRef}
              transform={`translate(${HANDLE_OFFSET * 2}, ${MARGIN})`}
            />
          </svg>
        )}
      </Box>
      <Flex
        sx={{
          mt: 1,
          justifyContent: "space-between",
          px: `${HANDLE_OFFSET}px`,
        }}
      >
        <Typography component="div" variant="caption">
          {formatDateAuto(timeExtent[0])}
        </Typography>
        <Typography component="div" variant="caption">
          {formatDateAuto(timeExtent[1])}
        </Typography>
      </Flex>
    </Box>
  );
};
