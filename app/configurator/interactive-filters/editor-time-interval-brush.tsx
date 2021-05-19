import { Trans } from "@lingui/macro";
import {
  brushX,
  CountableTimeInterval,
  scaleTime,
  select,
  Selection,
} from "d3";
import "d3-transition";
import React, { useCallback, useEffect, useRef } from "react";
import { Box, Flex, Text } from "theme-ui";
import { Label } from "../../components/form";
import { useResizeObserver } from "../../lib/use-resize-observer";
import { useTheme } from "../../themes";
import { useFormatFullDateAuto } from "../components/ui-helpers";

const HANDLE_HEIGHT = 20;
const BRUSH_HEIGHT = 3;
const MARGINS = {
  top: HANDLE_HEIGHT / 2,
  right: 8,
  bottom: HANDLE_HEIGHT / 2,
  left: 8,
};

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

  // FIXME: make component responsive (currently triggers infinite loop)
  const brushWidth = 267; //width - MARGINS.left - MARGINS.right;

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
        <Text variant="meta">{formatDateAuto(timeExtent[0])}</Text>
        <Text variant="meta">{formatDateAuto(timeExtent[1])}</Text>
      </Flex>
    </Box>
  );
};
