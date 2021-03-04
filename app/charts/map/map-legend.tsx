import {
  axisBottom,
  interpolateOranges,
  range,
  scaleBand,
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
import { MapState } from "./map-state";
const WIDTH = 256;
const COLOR_RAMP_HEIGHT = 10;
const LABELS_SPACE = 26;
const MARGINS = {
  top: 0,
  right: 20,
  bottom: 0,
  left: 20,
};
export const MapLegend = ({ legendTitle }: { legendTitle?: string }) => {
  const {
    paletteType,
    palette,
    nbSteps,
    dataDomain,
    colorScale,
  } = useChartState() as MapState;
  const formatNumber = useFormatNumber();
  const legendAxisRef = useRef<SVGGElement>(null);

  const linearScale = scaleLinear()
    .domain([0, colorScale.range().length])
    .range([0, WIDTH]);

  // const thresholds = colorScale.thresholds();

  // const tickValues = range(thresholds.length);

  // const bandScale = scaleBand()
  //   .domain(colorScale.domain())
  //   .rangeRound([MARGINS.left, WIDTH - MARGINS.right]);

  // const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
  //   g.call(axisBottom(bandScale).tickValues(thresholds));
  // };

  // useEffect(() => {
  //   const g = select(legendAxisRef.current);
  //   mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  // });

  return (
    <Flex
      sx={{
        flexDirection: "column",
        justifyContent: "flex-start",
        m: 4,
        width: WIDTH,
      }}
    >
      {legendTitle && <Text variant="meta">{legendTitle}</Text>}
      {paletteType === "continuous" && (
        <>
          <Box sx={{ my: 1, width: WIDTH, height: COLOR_RAMP_HEIGHT }}>
            <ColorRamp
              colorInterpolator={getColorInterpolator(palette)}
              nbSteps={WIDTH}
              width={WIDTH}
              height={COLOR_RAMP_HEIGHT}
            />
          </Box>
          <Flex sx={{ justifyContent: "space-between" }}>
            <Text variant="meta">{formatNumber(dataDomain[0])}</Text>
            <Text variant="meta">{formatNumber(dataDomain[1])}</Text>
          </Flex>
        </>
      )}
      {paletteType === "discrete" && (
        <Box sx={{ my: 1 }}>
          <svg
            width={WIDTH + MARGINS.left + MARGINS.right}
            height={COLOR_RAMP_HEIGHT + LABELS_SPACE}
          >
            {/* <g
              ref={legendAxisRef}
              key="legend-axis"
              transform={`translate(${MARGINS.left}, ${COLOR_RAMP_HEIGHT})`}
            /> */}
            <g transform={`translate(${MARGINS.left}, 0)`}>
              {colorScale.range().map((c, i) => (
                <rect
                  x={linearScale(i)}
                  y={0}
                  width={WIDTH / colorScale.range().length}
                  height={COLOR_RAMP_HEIGHT}
                  fill={`${c}`}
                />
              ))}
              <g>
                {/* FIXME: Should this be an axisBottom()? */}
                {/* @ts-ignore */}
                {[dataDomain[0], ...colorScale.thresholds(), dataDomain[1]].map(
                  (t: number, i: number) => (
                    <>
                      <rect
                        x={linearScale(i)}
                        y={0}
                        width={1}
                        height={COLOR_RAMP_HEIGHT + 4}
                        fill={"#000000"}
                      />
                      <text
                        x={linearScale(i)}
                        y={LABELS_SPACE}
                        fontSize={8}
                        textAnchor="middle"
                      >
                        {formatNumber(t)}
                      </text>
                    </>
                  )
                )}
              </g>
            </g>
          </svg>
        </Box>
      )}
    </Flex>
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
