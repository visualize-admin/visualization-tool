import {
  axisBottom,
  interpolateOranges,
  max,
  min,
  range,
  ScaleLinear,
  scaleLinear,
  ScaleQuantile,
  ScaleQuantize,
  ScaleThreshold,
  select,
  Selection,
} from "d3";
import * as React from "react";
import { useEffect, useRef } from "react";
import { Box, Flex, Text } from "theme-ui";
import {
  getColorInterpolator,
  useFormatInteger,
  useFormatNumber,
} from "../../configurator/components/ui-helpers";
import { useChartState } from "../shared/use-chart-state";
import { useChartTheme } from "../shared/use-chart-theme";
import { useInteraction } from "../shared/use-interaction";
import { useWidth } from "../shared/use-width";
import { MapState } from "./map-state";

const WIDTH = 256;
const COLOR_RAMP_HEIGHT = 10;

export const MapLegend = () => {
  const {
    areaLayer: { areaMeasureLabel, showAreaLayer, paletteType },
    symbolLayer: { symbolMeasureLabel, showSymbolLayer },
  } = useChartState() as MapState;

  return (
    <Flex
      sx={{
        minHeight: 100,
        borderTop: "1px solid",
        borderTopColor: "monochrome200",
        flexWrap: "wrap",
      }}
    >
      {showAreaLayer && (
        <Box sx={{ p: 4 }}>
          {areaMeasureLabel && (
            <Text as="div" variant="meta">
              {areaMeasureLabel}
            </Text>
          )}

          {paletteType === "continuous" && <ContinuousColorLegend />}

          {paletteType === "discrete" && <QuantizeColorLegend />}

          {paletteType === "quantile" && <QuantileColorLegend />}

          {paletteType === "jenks" && <JenksColorLegend />}
        </Box>
      )}
      {showSymbolLayer && (
        <Box sx={{ p: 4 }}>
          {symbolMeasureLabel && (
            <Text as="div" variant="meta">
              {symbolMeasureLabel}
            </Text>
          )}
          <CircleLegend />
        </Box>
      )}
    </Flex>
  );
};

const CircleLegend = () => {
  const width = useWidth();
  const [
    {
      interaction: { d, visible },
    },
  ] = useInteraction();

  const { axisLabelColor, legendFontSize } = useChartTheme();
  const {
    data,
    areaLayer: { getLabel },
    symbolLayer: { getRadius, radiusScale, symbolColorScale },
  } = useChartState() as MapState;
  const formatNumber = useFormatInteger();

  const legendWidth = Math.min(width, WIDTH);
  const margins = {
    top: 6,
    right: 4,
    bottom: 4,
    left: 4,
  };
  const height = 60;

  const [, maxRadius] = radiusScale.domain();

  const hoveredRadius =
    d && typeof getRadius(d) === "number" ? getRadius(d) : undefined;

  const hoveredColor =
    d && typeof getRadius(d) === "number"
      ? symbolColorScale(getRadius(d) as number)
      : undefined;

  return (
    <svg
      width={legendWidth + margins.left + margins.right}
      height={height + margins.top + margins.bottom}
    >
      <g
        transform={`translate(${margins.left + radiusScale(maxRadius)}, ${
          margins.top + radiusScale(maxRadius)
        })`}
      >
        {radiusScale.domain().map((d) => {
          // FIXME: Potentially a performance problem if a lot of data
          const observation = data.find((x) => getRadius(x) === d);
          const thisFeatureLabel = observation ? getLabel(observation) : "";

          return (
            observation && (
              <>
                {
                  <g
                    transform={`translate(0, ${
                      radiusScale(maxRadius) - radiusScale(d)
                    })`}
                  >
                    <circle
                      cx={0}
                      cy={0}
                      r={radiusScale(d)}
                      fill="none"
                      stroke={axisLabelColor}
                    />
                    {!visible && (
                      <>
                        <line
                          x1={0}
                          y1={-radiusScale(d)}
                          x2={radiusScale(maxRadius) + 4}
                          y2={-radiusScale(d)}
                          stroke={axisLabelColor}
                        />
                        <text
                          x={radiusScale(maxRadius) + 6}
                          y={-radiusScale(d)}
                          dy={5}
                          fill={axisLabelColor}
                          textAnchor="start"
                          fontSize={legendFontSize}
                        >
                          {formatNumber(d)} ({thisFeatureLabel})
                        </text>
                      </>
                    )}
                  </g>
                }
              </>
            )
          );
        })}
        {/* Hovered data point indicator */}
        {d && visible && hoveredRadius && (
          <g
            transform={`translate(0, ${
              radiusScale(maxRadius) - radiusScale(hoveredRadius)
            })`}
          >
            <circle
              cx={0}
              cy={0}
              r={radiusScale(hoveredRadius)}
              fill={hoveredColor}
              stroke={hoveredColor}
              fillOpacity={0.1}
            />
            <line
              x1={0}
              y1={-radiusScale(hoveredRadius)}
              x2={radiusScale(maxRadius) + 4}
              y2={-radiusScale(hoveredRadius)}
              stroke={hoveredColor}
            />
            <text
              x={radiusScale(maxRadius) + 6}
              y={-radiusScale(hoveredRadius)}
              dy={5}
              fill={hoveredColor}
              textAnchor="start"
              fontSize={legendFontSize}
            >
              {formatNumber(getRadius(d) ?? NaN)} ({getLabel(d)})
            </text>
          </g>
        )}
      </g>
    </svg>
  );
};

const JenksColorLegend = () => {
  const legendAxisRef = useRef<SVGGElement>(null);
  const { axisLabelColor, labelColor, fontFamily, legendFontSize } =
    useChartTheme();
  const {
    areaLayer: { dataDomain, colorScale },
  } = useChartState() as MapState;
  const formatNumber = useFormatInteger();
  const width = useWidth();

  const legendWidth = Math.min(width, WIDTH);
  const margins = {
    top: 6,
    right: 4,
    bottom: 64,
    left: 4,
  };

  const thresholds = colorScale.domain ? colorScale.domain() : [];

  // From color index to threshold value
  const thresholdsScale = scaleLinear()
    .domain(range(colorScale.range().length + 1))
    .range([
      min(dataDomain, (d) => d) || 0,
      ...thresholds,
      max(dataDomain, (d) => d) || 100,
    ]);

  // From threshold value to pixel value
  const scale = scaleLinear()
    .domain([
      min(dataDomain, (d) => d) || 0,
      max(dataDomain, (d) => d) || 10000,
    ])
    .range([0, legendWidth]);

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const tickValues = thresholds.splice(0, thresholds.length - 1);

    g.call(
      axisBottom(scale)
        .tickValues(tickValues)
        .tickSizeInner(-COLOR_RAMP_HEIGHT - 2)
        .tickFormat(formatNumber)
    );
    g.select("path.domain").remove();
    g.selectAll(".tick line").attr("stroke", axisLabelColor);
    g.selectAll(".tick text")
      .attr("font-size", legendFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("transform", "rotate(45)")
      .attr("text-anchor", "start");
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
        {(colorScale as ScaleThreshold<number, string>).range().map((c, i) => {
          return (
            <rect
              key={i}
              x={scale(thresholdsScale(i))}
              y={0}
              width={scale(thresholdsScale(i + 1)) - scale(thresholdsScale(i))}
              height={COLOR_RAMP_HEIGHT}
              fill={`${c}`}
            />
          );
        })}
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
const QuantileColorLegend = () => {
  const legendAxisRef = useRef<SVGGElement>(null);
  const { axisLabelColor, labelColor, fontFamily, legendFontSize } =
    useChartTheme();
  const {
    areaLayer: { dataDomain, colorScale },
  } = useChartState() as MapState;
  const formatNumber = useFormatInteger();
  const width = useWidth();

  const legendWidth = Math.min(width, WIDTH);
  const margins = {
    top: 6,
    right: 4,
    bottom: 64,
    left: 4,
  };
  // @ts-ignore
  const thresholds = colorScale.quantiles ? colorScale.quantiles() : [];

  // From color index to threshold value
  const thresholdsScale = scaleLinear()
    .domain(range(colorScale.range().length + 1))
    .range([
      min(dataDomain, (d) => d),
      ...thresholds,
      max(dataDomain, (d) => d),
    ]);

  // From threshold value to pixel value
  const scale = scaleLinear()
    .domain([
      min(dataDomain, (d) => d) || 0,
      max(dataDomain, (d) => d) || 10000,
    ])
    .range([0, legendWidth]);

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
      .attr("font-size", legendFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("transform", "rotate(45)")
      .attr("text-anchor", "start");
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
        {(colorScale as ScaleQuantile<string>).range().map((c, i) => {
          return (
            <rect
              key={i}
              x={scale(thresholdsScale(i))}
              y={0}
              width={scale(thresholdsScale(i + 1)) - scale(thresholdsScale(i))}
              height={COLOR_RAMP_HEIGHT}
              fill={`${c}`}
            />
          );
        })}
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

const QuantizeColorLegend = () => {
  const legendAxisRef = useRef<SVGGElement>(null);
  const { axisLabelColor, labelColor, fontFamily, legendFontSize } =
    useChartTheme();
  const {
    areaLayer: { dataDomain, colorScale },
  } = useChartState() as MapState;
  const formatNumber = useFormatInteger();
  const width = useWidth();

  const legendWidth = Math.min(width, WIDTH);
  const margins = {
    top: 6,
    right: 4,
    bottom: 64,
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
      .attr("font-size", legendFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("transform", "rotate(45)")
      .attr("text-anchor", "start");
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
        {(colorScale as ScaleQuantize<string>).range().map((c, i) => (
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
  const {
    areaLayer: { palette, dataDomain },
  } = useChartState() as MapState;
  const { legendLabelColor, labelFontSize, fontFamily } = useChartTheme();
  const formatNumber = useFormatNumber();
  const width = useWidth();

  const legendWidth = Math.min(width, WIDTH);
  const margins = {
    top: 0,
    right: 4,
    bottom: 14,
    left: 0,
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
            nbClass={legendWidth}
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
  const {
    areaLayer: { getValue },
  } = useChartState() as MapState;
  const { labelColor } = useChartTheme();
  return (
    <>
      {state.interaction.d &&
        state.interaction.visible &&
        !isNaN(getValue(state.interaction.d) ?? NaN) && (
          <polygon
            fill={labelColor}
            points="-4,0 4,0 0,5"
            transform={`translate(${scale(
              getValue(state.interaction.d) ?? 0
            )}, 0)`}
          />
        )}
    </>
  );
};
const ColorRamp = ({
  colorInterpolator = interpolateOranges,
  nbClass,
  width,
  height,
}: {
  colorInterpolator: (t: number) => string;
  nbClass: number;
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

      for (let i = 0; i < nbClass; ++i) {
        context.fillStyle = colorInterpolator(i / (nbClass - 1));
        context.fillRect(i, 0, 1, height);
      }
    }
  });

  return <canvas ref={canvasRef} />;
};
