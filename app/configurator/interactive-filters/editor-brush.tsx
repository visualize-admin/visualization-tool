import { Box, Typography } from "@mui/material";
import { brushX } from "d3-brush";
import { scaleTime } from "d3-scale";
import { pointer, select, Selection } from "d3-selection";
import { CountableTimeInterval } from "d3-time";
import { useCallback, useEffect, useRef } from "react";

import { Flex } from "@/components/flex";
import { useTimeFormatUnit } from "@/formatters";
import { TimeUnit } from "@/graphql/query-hooks";
import { useTheme } from "@/themes";
import { useResizeObserver } from "@/utils/use-resize-observer";

const HANDLE_SIZE = 16;
const HANDLE_OFFSET = HANDLE_SIZE / 8;
const BRUSH_HEIGHT = 1;
const MARGIN = HANDLE_SIZE / 2;

type EditorBrushProps = {
  timeExtent: Date[];
  timeRange: Date[];
  timeInterval: CountableTimeInterval;
  timeUnit: TimeUnit;
  onChange: (extent: Date[]) => void;
  disabled?: boolean;
  hideEndHandle?: boolean;
};

export const EditorBrush = (props: EditorBrushProps) => {
  const {
    timeExtent,
    timeRange,
    timeInterval,
    timeUnit,
    onChange,
    disabled = false,
    hideEndHandle = false,
  } = props;
  const [resizeRef, width] = useResizeObserver<HTMLDivElement>();
  const brushRef = useRef<SVGGElement>(null);
  const theme = useTheme();
  const timeFormatUnit = useTimeFormatUnit();

  const brushWidth = width - (MARGIN + HANDLE_OFFSET) * 2;
  const timeScale = scaleTime().domain(timeExtent).range([0, brushWidth]);

  const getClosestDimensionValue = useCallback(
    (date: Date): Date => {
      return timeInterval.round(date);
    },
    [timeInterval]
  );

  function brushed(e: $FixMe) {
    const selection = e.selection as [number, number] | undefined;

    if (selection) {
      const [xStart, xEnd] = selection.map((s) =>
        getClosestDimensionValue(timeScale.invert(s))
      );

      onChange([xStart, xEnd]);
    } else {
      const g = select(brushRef.current);
      //@ts-ignore
      const [mx] = pointer(e, this);
      const x = mx < 0 ? 0 : mx > brushWidth ? brushWidth : mx;
      g.call(brush.move as any, [x, x]);
    }
  }
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

      if (hideEndHandle) {
        g.select(".handle--e").remove();
      }

      g.call(brush);
    };

    mkBrush(g as Selection<SVGGElement, unknown, null, undefined>);
  }, [
    brush,
    disabled,
    hideEndHandle,
    theme.palette.grey,
    theme.palette.primary.main,
  ]);

  // Set default selection to full extent
  const [fromPx, toPx] = timeRange.map(timeScale);

  // FIXME: fix dependency array but don't include brush.move!
  useEffect(() => {
    const g = select(brushRef.current);
    (g as Selection<SVGGElement, unknown, null, undefined>).call(brush.move, [
      fromPx,
      toPx,
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromPx, toPx]);

  return (
    <Box sx={{ mt: 4 }}>
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
          {timeFormatUnit(timeExtent[0], timeUnit)}
        </Typography>
        <Typography component="div" variant="caption">
          {timeFormatUnit(timeExtent[1], timeUnit)}
        </Typography>
      </Flex>
    </Box>
  );
};
