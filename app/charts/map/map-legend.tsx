import {
  axisBottom,
  axisTop,
  interpolateOranges,
  range,
  scaleBand,
  ScaleLinear,
  scaleLinear,
  select,
  Selection,
} from "d3";
import * as React from "react";
import { useEffect, useRef } from "react";
import { Box, Flex, Text } from "theme-ui";
import {
  getColorInterpolator,
  useFormatNumber,
} from "../../configurator/components/ui-helpers";
import { useChartState } from "../shared/use-chart-state";
import { useChartTheme } from "../shared/use-chart-theme";
import { useInteraction } from "../shared/use-interaction";
import { useWidth } from "../shared/use-width";
import { MapState } from "./map-state";

const WIDTH = 256;
const COLOR_RAMP_HEIGHT = 10;

export const MapLegend = ({ legendTitle }: { legendTitle?: string }) => {
  const { paletteType } = useChartState() as MapState;

  return (
    <Box sx={{ m: 4 }}>
      {legendTitle && <Text variant="meta">{legendTitle}</Text>}

      {paletteType === "continuous" && <ContinuousColorLegend />}

      {paletteType === "discrete" && <DiscreteColorLegend />}
    </Box>
  );
};

const DiscreteColorLegend = () => {
  const legendAxisRef = useRef<SVGGElement>(null);
  const {
    axisLabelColor,
    labelColor,
    fontFamily,
    labelFontSize,
  } = useChartTheme();
  const { dataDomain, colorScale } = useChartState() as MapState;
  const formatNumber = useFormatNumber();
  const width = useWidth();

  const legendWidth = Math.min(width, WIDTH);
  const margins = {
    top: 6,
    right: 4,
    bottom: 14,
    left: 4,
  };

  const classesScale = scaleLinear()
    .domain([0, colorScale.range().length])
    .range([0, legendWidth]);

  const scale = scaleLinear().domain(dataDomain).range([0, legendWidth]);

  // @ts-ignore
  const thresholds = colorScale.thresholds ? colorScale.thresholds() : [];

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.call(
      axisBottom(scale)
        .tickValues(thresholds)
        .tickSizeInner(-COLOR_RAMP_HEIGHT - 2)
        .tickFormat(formatNumber)
    );
    g.select("path.domain").remove();
    g.selectAll(".tick line").attr("stroke", axisLabelColor);
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor);
  };

  useEffect(() => {
    const g = select(legendAxisRef.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <svg
      width={legendWidth + margins.left + margins.right}
      height={COLOR_RAMP_HEIGHT + margins.top + margins.bottom}
    >
      <g transform={`translate(${margins.left}, ${0})`}>
        <DataPointIndicator scale={scale} />
      </g>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        {colorScale.range().map((c, i) => (
          <rect
            key={i}
            x={classesScale(i)}
            y={0}
            width={legendWidth / colorScale.range().length}
            height={COLOR_RAMP_HEIGHT}
            fill={`${c}`}
          />
        ))}
      </g>
      <g
        ref={legendAxisRef}
        key="legend-axis"
        transform={`translate(${margins.left}, ${
          COLOR_RAMP_HEIGHT + margins.top + 2
        })`}
      />
    </svg>
  );
};

const ContinuousColorLegend = () => {
  const { palette, dataDomain } = useChartState() as MapState;
  const { legendLabelColor, labelFontSize, fontFamily } = useChartTheme();
  const formatNumber = useFormatNumber();
  const width = useWidth();

  const legendWidth = Math.min(width, WIDTH);
  const margins = {
    top: 6,
    right: 4,
    bottom: 14,
    left: 4,
  };
  const scale = scaleLinear().domain(dataDomain).range([0, legendWidth]);

  return (
    <svg
      width={legendWidth + margins.left + margins.right}
      height={COLOR_RAMP_HEIGHT + margins.top + margins.bottom}
    >
      <g transform={`translate(${margins.left}, ${0})`}>
        <DataPointIndicator scale={scale} />
      </g>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        <foreignObject
          x={0}
          y={0}
          width={legendWidth}
          height={COLOR_RAMP_HEIGHT}
        >
          <ColorRamp
            colorInterpolator={getColorInterpolator(palette)}
            nbSteps={legendWidth}
            width={legendWidth}
            height={COLOR_RAMP_HEIGHT}
          />
        </foreignObject>
      </g>
      <g
        transform={`translate(${margins.left}, ${
          COLOR_RAMP_HEIGHT + margins.top + margins.bottom
        })`}
      >
        <text
          x={0}
          y={0}
          textAnchor="start"
          fontSize={labelFontSize}
          fontFamily={fontFamily}
          fill={legendLabelColor}
        >
          {formatNumber(dataDomain[0])}
        </text>
        <text
          x={legendWidth}
          y={0}
          textAnchor="end"
          fontSize={labelFontSize}
          fontFamily={fontFamily}
          fill={legendLabelColor}
        >
          {formatNumber(dataDomain[1])}
        </text>
      </g>
    </svg>
  );
};
const DataPointIndicator = ({
  scale,
}: {
  scale: ScaleLinear<number, number>;
}) => {
  const [state] = useInteraction();
  const { getValue } = useChartState() as MapState;
  const { labelColor } = useChartTheme();
  return (
    <>
      {state.interaction.d &&
        state.interaction.visible &&
        !isNaN(getValue(state.interaction.d)) && (
          <polygon
            fill={labelColor}
            points="-4,0 4,0 0,5"
            transform={`translate(${scale(getValue(state.interaction.d))}, 0)`}
          />
        )}
    </>
  );
};
const ColorRamp = ({
  colorInterpolator = interpolateOranges,
  nbSteps,
  width,
  height,
}: {
  colorInterpolator: (t: number) => string;
  nbSteps: number;
  width: number;
  height: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas && canvas.getContext("2d");
    if (canvas && context) {
      context.clearRect(0, 0, width, height);
      canvas.style.imageRendering = "-moz-crisp-edges";
      canvas.style.imageRendering = "pixelated";

      for (let i = 0; i < nbSteps; ++i) {
        context.fillStyle = colorInterpolator(i / (nbSteps - 1));
        context.fillRect(i, 0, 1, height);
      }
    }
  });

  return <canvas ref={canvasRef} />;
};
