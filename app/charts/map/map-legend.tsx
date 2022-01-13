import {
  axisBottom,
  interpolateOranges,
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

const MAX_WIDTH = 204;
const HEIGHT = 80;
const COLOR_RAMP_HEIGHT = 10;
const MARGIN = { top: 6, right: 4, bottom: 0, left: 4 };

const useLegendWidth = () => Math.min(useWidth(), MAX_WIDTH);

export const MapLegend = () => {
  const { areaLayer, symbolLayer } = useChartState() as MapState;

  return (
    <Flex
      sx={{
        minHeight: 100,
        borderTop: "1px solid",
        borderTopColor: "monochrome200",
        flexWrap: "wrap",
      }}
    >
      {areaLayer.show && (
        <Box sx={{ p: 4 }}>
          {areaLayer.measureLabel && (
            <Text
              as="div"
              variant="meta"
              sx={{ marginLeft: `${MARGIN.left}px` }}
            >
              {areaLayer.measureLabel}
            </Text>
          )}
          {areaLayer.paletteType === "continuous" && <ContinuousColorLegend />}
          {areaLayer.paletteType === "discrete" && <QuantizeColorLegend />}
          {areaLayer.paletteType === "quantile" && <QuantileColorLegend />}
          {areaLayer.paletteType === "jenks" && <JenksColorLegend />}
        </Box>
      )}

      {symbolLayer.show && (
        <Box sx={{ p: 4 }}>
          {symbolLayer.measureLabel && (
            <Text as="div" variant="meta">
              {symbolLayer.measureLabel}
            </Text>
          )}
          <CircleLegend />
        </Box>
      )}
    </Flex>
  );
};

const CircleLegend = () => {
  const width = useLegendWidth();

  const [{ interaction }] = useInteraction();
  const { axisLabelColor, legendFontSize } = useChartTheme();
  const {
    data,
    symbolLayer: {
      color: symbolColor,
      dataDomain,
      getLabel,
      getValue,
      radiusScale,
    },
  } = useChartState() as MapState;
  const formatNumber = useFormatInteger();

  const value =
    interaction.d && typeof getValue(interaction.d) === "number"
      ? getValue(interaction.d)
      : undefined;

  const radius = value ? radiusScale(value) : undefined;
  const maxRadius = radiusScale.range()[1];

  const color = value ? symbolColor : undefined;

  return (
    <svg width={width} height={HEIGHT}>
      <g
        transform={`translate(${MARGIN.left + maxRadius}, ${
          MARGIN.top + maxRadius
        })`}
      >
        {dataDomain.map((d, i) => {
          // FIXME: Potentially a performance problem if a lot of data
          const observation = data.find((x) => getValue(x) === d);
          const label = observation ? getLabel(observation) : "";
          const radius = radiusScale(d);

          return i == 0 && interaction.visible
            ? null
            : observation && (
                <>
                  {
                    <g transform={`translate(0, ${maxRadius - radius})`}>
                      <circle
                        cx={0}
                        cy={0}
                        r={radius}
                        fill="none"
                        stroke={axisLabelColor}
                      />
                      {!interaction.visible && (
                        <>
                          <line
                            x1={0}
                            y1={-radius}
                            x2={maxRadius + 4}
                            y2={-radius}
                            stroke={axisLabelColor}
                          />
                          <text
                            x={maxRadius + 6}
                            y={-radius}
                            dy={5}
                            fill={axisLabelColor}
                            textAnchor="start"
                            fontSize={legendFontSize}
                          >
                            {formatNumber(d)} ({label})
                          </text>
                        </>
                      )}
                    </g>
                  }
                </>
              );
        })}

        {/* Hovered data point indicator */}
        {interaction.d &&
          interaction.visible &&
          value !== undefined &&
          value !== null &&
          radius !== undefined && (
            <g transform={`translate(0, ${maxRadius - radius})`}>
              <circle
                cx={0}
                cy={0}
                r={radius}
                fill={color}
                stroke={color}
                fillOpacity={0.1}
              />
              <line
                x1={0}
                y1={-radius}
                x2={maxRadius + 4}
                y2={-radius}
                stroke={color}
              />
              <text
                x={maxRadius + 6}
                y={-radius}
                dy={5}
                fill={color}
                textAnchor="start"
                fontSize={legendFontSize}
              >
                {formatNumber(getValue(interaction.d) ?? NaN)} (
                {getLabel(interaction.d)})
              </text>
            </g>
          )}
      </g>
    </svg>
  );
};

const JenksColorLegend = () => {
  const width = useLegendWidth();
  const legendAxisRef = useRef<SVGGElement>(null);

  const { axisLabelColor, labelColor, fontFamily, legendFontSize } =
    useChartTheme();
  const {
    areaLayer: { dataDomain, colorScale },
  } = useChartState() as MapState;
  const formatNumber = useFormatInteger();
  const thresholds = colorScale.domain ? colorScale.domain() : [];

  const [min, max] = dataDomain;

  // From color index to threshold value
  const thresholdsScale = scaleLinear()
    .domain(range(colorScale.range().length + 1))
    .range([min || 0, ...thresholds, max || 100]);

  // From threshold value to pixel value
  const scale = scaleLinear()
    .domain([min || 0, max || 10000])
    .range([MARGIN.left, width - MARGIN.right]);

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const tickValues = thresholds.splice(0, thresholds.length - 1);

    g.call(
      axisBottom(scale)
        .tickValues(tickValues)
        .tickSizeInner(-COLOR_RAMP_HEIGHT)
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

  useEffect(() => (select(legendAxisRef.current) as any).call(mkAxis));

  return (
    <svg width={width} height={HEIGHT}>
      <g>
        <DataPointIndicator scale={scale} />
      </g>
      <g transform={`translate(0, ${MARGIN.top})`}>
        {(colorScale as ScaleThreshold<number, string>).range().map((c, i) => {
          return (
            <rect
              key={i}
              x={scale(thresholdsScale(i))}
              y={0}
              width={scale(thresholdsScale(i + 1)) - scale(thresholdsScale(i))}
              height={COLOR_RAMP_HEIGHT}
              fill={c}
            />
          );
        })}
      </g>
      <g
        ref={legendAxisRef}
        key="legend-axis"
        transform={`translate(0, ${COLOR_RAMP_HEIGHT + MARGIN.top})`}
      />
    </svg>
  );
};

const QuantileColorLegend = () => {
  const width = useLegendWidth();
  const legendAxisRef = useRef<SVGGElement>(null);

  const { axisLabelColor, labelColor, fontFamily, legendFontSize } =
    useChartTheme();
  const {
    areaLayer: { dataDomain, colorScale },
  } = useChartState() as MapState;
  const formatNumber = useFormatInteger();

  // @ts-ignore
  const thresholds = colorScale.quantiles ? colorScale.quantiles() : [];

  const [min, max] = dataDomain;

  // From color index to threshold value
  const thresholdsScale = scaleLinear()
    .domain(range(colorScale.range().length + 1))
    .range([min, ...thresholds, max]);

  // From threshold value to pixel value
  const scale = scaleLinear()
    .domain([min || 0, max || 10000])
    .range([MARGIN.left, width - MARGIN.right]);

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.call(
      axisBottom(scale)
        .tickValues(thresholds)
        .tickSizeInner(-COLOR_RAMP_HEIGHT)
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

  useEffect(() => (select(legendAxisRef.current) as any).call(mkAxis));

  return (
    <svg width={width} height={HEIGHT}>
      <g>
        <DataPointIndicator scale={scale} />
      </g>
      <g transform={`translate(0, ${MARGIN.top})`}>
        {(colorScale as ScaleQuantile<string>).range().map((c, i) => {
          return (
            <rect
              key={i}
              x={scale(thresholdsScale(i))}
              y={0}
              width={scale(thresholdsScale(i + 1)) - scale(thresholdsScale(i))}
              height={COLOR_RAMP_HEIGHT}
              fill={c}
            />
          );
        })}
      </g>
      <g
        ref={legendAxisRef}
        key="legend-axis"
        transform={`translate(0, ${COLOR_RAMP_HEIGHT + MARGIN.top})`}
      />
    </svg>
  );
};

const QuantizeColorLegend = () => {
  const width = useLegendWidth();
  const legendAxisRef = useRef<SVGGElement>(null);

  const { axisLabelColor, labelColor, fontFamily, legendFontSize } =
    useChartTheme();
  const {
    areaLayer: { dataDomain, colorScale },
  } = useChartState() as MapState;
  const formatNumber = useFormatInteger();

  const classesScale = scaleLinear()
    .domain([0, colorScale.range().length])
    .range([MARGIN.left, width - MARGIN.right]);

  const scale = scaleLinear()
    .domain(dataDomain)
    .range([MARGIN.left, width - MARGIN.right]);

  // @ts-ignore
  const thresholds = colorScale.thresholds ? colorScale.thresholds() : [];

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.call(
      axisBottom(scale)
        .tickValues(thresholds)
        .tickSizeInner(-COLOR_RAMP_HEIGHT)
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

  useEffect(() => (select(legendAxisRef.current) as any).call(mkAxis));

  return (
    <svg width={width} height={HEIGHT}>
      <g>
        <DataPointIndicator scale={scale} />
      </g>
      <g transform={`translate(0, ${MARGIN.top})`}>
        {(colorScale as ScaleQuantize<string>).range().map((c, i) => (
          <rect
            key={i}
            x={classesScale(i)}
            width={
              (width - MARGIN.left - MARGIN.right) / colorScale.range().length
            }
            height={COLOR_RAMP_HEIGHT}
            fill={c}
          />
        ))}
      </g>
      <g
        ref={legendAxisRef}
        key="legend-axis"
        transform={`translate(0, ${COLOR_RAMP_HEIGHT + MARGIN.top})`}
      />
    </svg>
  );
};

const ContinuousColorLegend = () => {
  const width = useLegendWidth();

  const {
    areaLayer: { palette, dataDomain },
  } = useChartState() as MapState;
  const { legendLabelColor, labelFontSize, fontFamily } = useChartTheme();
  const formatNumber = useFormatNumber();
  const scale = scaleLinear()
    .domain(dataDomain)
    .range([MARGIN.left, width - MARGIN.right]);

  return (
    <svg width={width} height={HEIGHT}>
      <g>
        <DataPointIndicator scale={scale} />
      </g>
      <foreignObject
        x={MARGIN.left}
        y={1} // needed to align with other legends, not sure why
        width={width - MARGIN.left - MARGIN.right}
        height={COLOR_RAMP_HEIGHT}
      >
        <ColorRamp
          width={width - MARGIN.left - MARGIN.right}
          height={COLOR_RAMP_HEIGHT}
          colorInterpolator={getColorInterpolator(palette)}
          nbClass={width}
        />
      </foreignObject>
      <g
        transform={`translate(${MARGIN.left}, ${
          MARGIN.top + COLOR_RAMP_HEIGHT + 14
        })`}
        fontFamily={fontFamily}
        fontSize={labelFontSize}
        fill={legendLabelColor}
      >
        <text textAnchor="start" fontSize={labelFontSize}>
          {formatNumber(dataDomain[0])}
        </text>
        <text x={width - MARGIN.right - MARGIN.left} textAnchor="end">
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
            points="-4,0 4,0 0,4"
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

  return <canvas ref={canvasRef} width={width} height={height} />;
};
