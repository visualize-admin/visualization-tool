import { Box, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { range } from "d3-array";
import { axisBottom } from "d3-axis";
import {
  NumberValue,
  ScaleLinear,
  scaleLinear,
  ScaleQuantile,
  ScaleQuantize,
  ScaleThreshold,
} from "d3-scale";
import { select, Selection } from "d3-selection";
import { useEffect, useMemo, useRef } from "react";

import { MapState } from "@/charts/map/map-state";
import { useChartState } from "@/charts/shared/chart-state";
import { rgbArrayToHex } from "@/charts/shared/colors";
import { MapLegendColor } from "@/charts/shared/legend-color";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { useInteraction } from "@/charts/shared/use-interaction";
import { useSize } from "@/charts/shared/use-size";
import Flex from "@/components/flex";
import { useLimits } from "@/config-utils";
import { MapConfig, PaletteType } from "@/configurator";
import { ColorRamp } from "@/configurator/components/chart-controls/color-ramp";
import { Observation } from "@/domain/data";
import { truthy } from "@/domain/types";
import {
  useDimensionFormatters,
  useFormatInteger,
  useFormatNumber,
} from "@/formatters";
import { getColorInterpolator } from "@/palettes";
import { getTextWidth } from "@/utils/get-text-width";

const MAX_WIDTH = 204;
const HEIGHT = 40;
const COLOR_RAMP_HEIGHT = 10;
const MARGIN = { top: 6, right: 4, bottom: 6, left: 4 };
const AXIS_TICK_ROTATE_ANGLE = 45;
const AXIS_LABEL_FONT_SIZE = 10;

const useLegendWidth = () => Math.min(useSize().width, MAX_WIDTH);

const makeAxis = (
  g: Selection<SVGGElement, unknown, null, undefined>,
  {
    axisLabelFontSize,
    fontFamily,
    formatNumber,
    labelColor,
    scale,
    thresholds,
  }: {
    axisLabelFontSize: number;
    fontFamily: string;
    formatNumber: (x: NumberValue | undefined | null) => string;
    labelColor: string;
    scale: ScaleLinear<number, number, number>;
    thresholds: number[];
  }
) => {
  g.call(
    axisBottom(scale)
      .tickValues(thresholds)
      .tickSizeInner(-COLOR_RAMP_HEIGHT)
      .tickFormat(formatNumber)
  );
  g.select("path.domain").remove();
  g.selectAll(".tick line").attr("stroke", labelColor);
  g.selectAll(".tick text")
    .attr("font-size", axisLabelFontSize)
    .attr("font-family", fontFamily)
    .attr("fill", labelColor)
    .attr("transform", `rotate(${AXIS_TICK_ROTATE_ANGLE})`)
    .attr("text-anchor", "start");
};

export const MapLegend = ({
  chartConfig,
  observations,
  limits,
}: {
  chartConfig: MapConfig;
  observations: Observation[];
  limits: ReturnType<typeof useLimits>["limits"];
}) => {
  const { areaLayer, symbolLayer } = useChartState() as MapState;
  const showAreaLegend =
    areaLayer &&
    areaLayer.data.length > 1 &&
    areaLayer.colors.type === "continuous" &&
    (areaLayer.colors.interpolationType === "linear" ||
      areaLayer.colors.scale.range().length > 1);
  const measureDimensions = [
    areaLayer?.colors.component,
    symbolLayer?.measureDimension,
    symbolLayer?.colors.type === "continuous"
      ? symbolLayer.colors.component
      : undefined,
  ].filter(truthy);
  const formatters = useDimensionFormatters(measureDimensions);
  const areaColorUnit = areaLayer?.colors.component.unit;
  const symbolUnit = symbolLayer?.measureDimension?.unit;
  const symbolColorUnit =
    symbolLayer?.colors.type === "continuous"
      ? symbolLayer?.colors.component.unit
      : undefined;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Flex sx={{ flexWrap: "wrap", gap: 4 }}>
        {areaLayer && showAreaLegend && (
          <Box>
            <Typography
              component="div"
              variant="caption"
              sx={{ marginLeft: `${MARGIN.left}px` }}
            >
              {areaLayer.colors.component.label}
              {areaColorUnit ? ` (${areaColorUnit})` : ""}
            </Typography>
            {areaLayer.colors.type === "continuous" ? (
              areaLayer.colors.interpolationType === "linear" ? (
                <ContinuousColorLegend
                  paletteId={areaLayer.colors.paletteId}
                  domain={areaLayer.colors.domain}
                  getValue={areaLayer.colors.getValue}
                  valueFormatter={formatters[areaLayer.colors.component.id]}
                />
              ) : areaLayer.colors.interpolationType === "quantize" ? (
                <QuantizeColorLegend
                  colorScale={areaLayer.colors.scale as ScaleQuantize<string>}
                  domain={areaLayer.colors.domain}
                  getValue={areaLayer.colors.getValue}
                />
              ) : areaLayer.colors.interpolationType === "quantile" ? (
                <QuantileColorLegend
                  colorScale={areaLayer.colors.scale as ScaleQuantile<string>}
                  domain={areaLayer.colors.domain}
                  getValue={areaLayer.colors.getValue}
                />
              ) : areaLayer.colors.interpolationType === "jenks" ? (
                <JenksColorLegend
                  colorScale={
                    areaLayer.colors.scale as ScaleThreshold<number, string>
                  }
                  domain={areaLayer.colors.domain}
                  getValue={areaLayer.colors.getValue}
                />
              ) : null
            ) : null}
          </Box>
        )}

        {symbolLayer && (
          <Flex sx={{ gap: 4 }}>
            {symbolLayer.colors.type === "continuous" && (
              <Box>
                <Typography component="div" variant="caption">
                  {symbolLayer.colors.component.label}
                  {symbolColorUnit ? ` (${symbolColorUnit})` : ""}
                </Typography>
                {symbolLayer.colors.interpolationType === "linear" ? (
                  <ContinuousColorLegend
                    paletteId={symbolLayer.colors.paletteId}
                    domain={symbolLayer.colors.domain}
                    getValue={(d: Observation) => {
                      // @ts-ignore
                      return d[symbolLayer.colors.component.iri] as number;
                    }}
                    valueFormatter={formatters[symbolLayer.colors.component.id]}
                  />
                ) : symbolLayer.colors.interpolationType === "quantize" ? (
                  <QuantizeColorLegend
                    colorScale={
                      symbolLayer.colors.scale as ScaleQuantize<string>
                    }
                    domain={symbolLayer.colors.domain}
                    getValue={symbolLayer.colors.getValue}
                  />
                ) : symbolLayer.colors.interpolationType === "quantile" ? (
                  <QuantileColorLegend
                    colorScale={
                      symbolLayer.colors.scale as ScaleQuantile<string>
                    }
                    domain={symbolLayer.colors.domain}
                    getValue={symbolLayer.colors.getValue}
                  />
                ) : symbolLayer.colors.interpolationType === "jenks" ? (
                  <JenksColorLegend
                    colorScale={
                      symbolLayer.colors.scale as ScaleThreshold<number, string>
                    }
                    domain={symbolLayer.colors.domain}
                    getValue={symbolLayer.colors.getValue}
                  />
                ) : null}
              </Box>
            )}

            {symbolLayer.measureDimension && (
              <Box>
                <Typography component="div" variant="caption">
                  {symbolLayer.measureLabel}
                  {symbolUnit ? ` (${symbolUnit})` : ""}
                </Typography>
                <CircleLegend
                  valueFormatter={formatters[symbolLayer.measureDimension.id]}
                />
              </Box>
            )}
          </Flex>
        )}

        {limits.map((limit) => {
          const { configLimit, measureLimit, limitUnit } = limit;

          switch (measureLimit.type) {
            case "single":
              return (
                <Box>
                  <Typography component="div" variant="caption">
                    {measureLimit.name}
                    {limitUnit ? ` (${limitUnit})` : ""}
                  </Typography>
                  <LimitLegend
                    maxValue={measureLimit.value}
                    color={configLimit.color}
                  />
                </Box>
              );
            case "range":
              return (
                <Box>
                  <Typography component="div" variant="caption">
                    {measureLimit.name}
                  </Typography>
                  <LimitLegend
                    minValue={measureLimit.min}
                    maxValue={measureLimit.max}
                    color={configLimit.color}
                  />
                </Box>
              );
            default:
              const _exhaustiveCheck: never = measureLimit;
              return _exhaustiveCheck;
          }
        })}
      </Flex>

      {areaLayer?.colors.type === "categorical" && (
        <MapLegendColor
          chartConfig={chartConfig}
          component={areaLayer.colors.component}
          getColor={areaLayer.colors.getColor}
          useAbbreviations={areaLayer.colors.useAbbreviations}
          observations={observations}
        />
      )}

      {symbolLayer?.colors.type === "categorical" &&
        symbolLayer.colors.component.id !== areaLayer?.colors.component.id && (
          <MapLegendColor
            chartConfig={chartConfig}
            component={symbolLayer.colors.component}
            getColor={symbolLayer.colors.getColor}
            useAbbreviations={symbolLayer.colors.useAbbreviations}
            observations={observations}
          />
        )}
    </Box>
  );
};

const Circle = ({
  value,
  label,
  fill,
  stroke,
  radius,
  maxRadius,
  fontSize,
  showLine = true,
  dashed,
  center,
}: {
  value: string;
  label: string;
  fill?: string;
  stroke: string;
  radius: number;
  maxRadius: number;
  fontSize: number;
  showLine?: boolean;
  dashed?: boolean;
  center?: boolean;
}) => {
  const cy = center ? -maxRadius + radius : 0;

  return (
    <g transform={`translate(0, ${maxRadius - radius})`}>
      <circle
        cx={0}
        cy={cy}
        r={radius}
        fill={fill}
        stroke={stroke}
        strokeDasharray={dashed ? "4 4" : 0}
        fillOpacity={0.1}
      />
      {showLine && (
        <>
          <line
            x1={0}
            y1={cy - radius}
            x2={maxRadius + 4}
            y2={cy - radius}
            stroke="black"
          />
          <text
            x={maxRadius + 6}
            y={cy - radius}
            dy={5}
            textAnchor="start"
            fontSize={fontSize}
            paintOrder="stroke"
            stroke="white"
            strokeWidth={2}
          >
            {value} {label}
          </text>
        </>
      )}
    </g>
  );
};

const CircleLegend = ({
  valueFormatter,
}: {
  valueFormatter: (d: Observation[string]) => string;
}) => {
  const width = useLegendWidth();

  const [{ interaction }] = useInteraction();
  const { labelColor } = useChartTheme();
  const { symbolLayer } = useChartState() as MapState;
  const {
    data,
    dataDomain,
    getLabel,
    getValue,
    colors: { getColor },
    radiusScale,
  } = symbolLayer as NonNullable<MapState["symbolLayer"]>;

  const maybeValue = interaction.d && getValue(interaction.d);
  const value = typeof maybeValue === "number" ? maybeValue : undefined;

  // @ts-ignore - value can be undefined, D3 types are wrong here
  const radius = radiusScale(value);
  const maxRadius = radiusScale.range()[1];

  const color = interaction.d
    ? rgbArrayToHex(getColor(interaction.d))
    : undefined;

  const domainObservations = useMemo(
    () => dataDomain.map((d) => data.find((x) => getValue(x) === d)),
    [data, dataDomain, getValue]
  ) as [Observation | undefined, Observation | undefined];

  return (
    <svg width={width} height={60}>
      <g
        transform={`translate(${MARGIN.left + maxRadius}, ${
          MARGIN.top + maxRadius
        })`}
      >
        {dataDomain.map((d, i) => {
          const observation = domainObservations[i];

          if (observation) {
            const label = getLabel(observation);
            const radius = radiusScale(d);

            return (
              <Circle
                key={i}
                value={valueFormatter(d)}
                label={label}
                fill="none"
                stroke={labelColor}
                radius={radius}
                maxRadius={maxRadius}
                fontSize={AXIS_LABEL_FONT_SIZE}
                showLine={!interaction.visible}
              />
            );
          }
        })}

        {/* Hovered data point indicator */}
        {interaction.d &&
          interaction.visible &&
          value !== undefined &&
          radius !== undefined &&
          color !== undefined && (
            <Circle
              value={valueFormatter(value)}
              label={getLabel(interaction.d)}
              fill={color}
              stroke={labelColor}
              radius={radius}
              maxRadius={maxRadius}
              fontSize={AXIS_LABEL_FONT_SIZE}
            />
          )}
      </g>
    </svg>
  );
};

const LimitLegend = ({
  minValue,
  maxValue,
  color,
}: {
  minValue?: number;
  maxValue: number;
  color: string;
}) => {
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const width = useLegendWidth();

  const { symbolLayer } = useChartState() as MapState;
  const { radiusScale } = symbolLayer as NonNullable<MapState["symbolLayer"]>;

  const minRadius = radiusScale(minValue ?? 0);
  const maxRadius = radiusScale(maxValue);

  return (
    <svg width={width} height={maxRadius * 2 + MARGIN.top + MARGIN.bottom}>
      <g
        transform={`translate(${maxRadius + MARGIN.left}, ${maxRadius + MARGIN.top})`}
      >
        <Circle
          value={formatNumber(maxValue)}
          label=""
          fill="none"
          stroke={color}
          radius={maxRadius}
          maxRadius={maxRadius}
          fontSize={AXIS_LABEL_FONT_SIZE}
          showLine
          dashed
        />
        {minValue !== undefined ? (
          <Circle
            value={formatNumber(minValue)}
            label=""
            fill="none"
            stroke={color}
            radius={minRadius}
            maxRadius={maxRadius}
            fontSize={AXIS_LABEL_FONT_SIZE}
            showLine
            dashed
            center
          />
        ) : null}
      </g>
    </svg>
  );
};

const getRotatedAxisLabelHeight = (
  d: number,
  options: { formatNumber: (d: number) => string; fontSize: number }
) => {
  const { formatNumber, fontSize } = options;
  const w = getTextWidth(formatNumber(d), { fontSize });
  const h = 12;
  const a = AXIS_TICK_ROTATE_ANGLE * (Math.PI / 180);

  return Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a));
};

const getMaxRotatedAxisLabelHeight = (
  values: number[],
  options: {
    formatNumber: (d: number) => string;
    fontSize: number;
  }
) => {
  const { formatNumber, fontSize } = options;

  return Math.max(
    ...values.map((d) => {
      return getRotatedAxisLabelHeight(d, {
        formatNumber,
        fontSize,
      });
    })
  );
};

const useLegendWithRotatedAxisLabelsHeight = (
  values: number[],
  options: {
    formatNumber: (d: number) => string;
    fontSize: number;
  }
) => {
  const { formatNumber, fontSize } = options;
  const maxLabelHeight = useMemo(() => {
    return getMaxRotatedAxisLabelHeight(values, {
      formatNumber,
      fontSize,
    });
  }, [values, formatNumber, fontSize]);

  return Math.max(HEIGHT, HEIGHT * 0.4 + maxLabelHeight);
};

const JenksColorLegend = ({
  colorScale,
  domain,
  getValue,
}: {
  colorScale: ScaleThreshold<number, string>;
  domain: [number, number];
  getValue: (d: Observation) => number | null;
}) => {
  const width = useLegendWidth();
  const legendAxisRef = useRef<SVGGElement>(null);
  const { axisLabelFontSize, labelColor, fontFamily } = useChartTheme();
  const formatNumber = useFormatInteger();
  const thresholds = colorScale.domain();
  const [min, max] = domain;

  // From color index to threshold value
  const thresholdsScale = scaleLinear()
    .domain(range(colorScale.range().length + 1))
    .range([min || 0, ...thresholds, max || 100]);

  // From threshold value to pixel value
  const scale = scaleLinear()
    .domain([min || 0, max || 10_000])
    .range([MARGIN.left, width - MARGIN.right]);

  const tickValues = thresholds.splice(0, thresholds.length - 1);

  useEffect(
    () =>
      makeAxis(select(legendAxisRef.current) as any, {
        axisLabelFontSize,
        fontFamily,
        formatNumber,
        labelColor,
        scale,
        thresholds: tickValues,
      }),
    [axisLabelFontSize, fontFamily, formatNumber, labelColor, scale, tickValues]
  );

  const height = useLegendWithRotatedAxisLabelsHeight(thresholdsScale.range(), {
    formatNumber,
    fontSize: axisLabelFontSize,
  });

  return (
    <svg width={width} height={height}>
      <g>
        <DataPointIndicator scale={scale} getValue={getValue} />
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

const QuantileColorLegend = ({
  colorScale,
  domain,
  getValue,
}: {
  colorScale: ScaleQuantile<string>;
  domain: [number, number];
  getValue: (d: Observation) => number | null;
}) => {
  const width = useLegendWidth();
  const legendAxisRef = useRef<SVGGElement>(null);

  const { axisLabelFontSize, labelColor, fontFamily } = useChartTheme();
  const formatNumber = useFormatInteger();
  const thresholds = colorScale.quantiles();

  const [min, max] = domain;

  // From color index to threshold value
  const thresholdsScale = scaleLinear()
    .domain(range(colorScale.range().length + 1))
    .range([min, ...thresholds, max]);

  // From threshold value to pixel value
  const scale = scaleLinear()
    .domain([min || 0, max || 10000])
    .range([MARGIN.left, width - MARGIN.right]);

  useEffect(
    () =>
      makeAxis(select(legendAxisRef.current) as any, {
        axisLabelFontSize,
        fontFamily,
        formatNumber,
        labelColor,
        scale,
        thresholds,
      }),
    [axisLabelFontSize, fontFamily, formatNumber, labelColor, scale, thresholds]
  );

  const height = useLegendWithRotatedAxisLabelsHeight(thresholdsScale.range(), {
    formatNumber,
    fontSize: axisLabelFontSize,
  });

  return (
    <svg width={width} height={height}>
      <g>
        <DataPointIndicator scale={scale} getValue={getValue} />
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

const QuantizeColorLegend = ({
  colorScale,
  domain,
  getValue,
}: {
  colorScale: ScaleQuantize<string>;
  domain: [number, number];
  getValue: (d: Observation) => number | null;
}) => {
  const width = useLegendWidth();
  const legendAxisRef = useRef<SVGGElement>(null);

  const { axisLabelFontSize, labelColor, fontFamily } = useChartTheme();
  const formatNumber = useFormatInteger();

  const classesScale = scaleLinear()
    .domain([0, colorScale.range().length])
    .range([MARGIN.left, width - MARGIN.right]);

  const scale = scaleLinear()
    .domain(domain)
    .range([MARGIN.left, width - MARGIN.right]);
  const thresholds = colorScale.thresholds();

  useEffect(
    () =>
      makeAxis(select(legendAxisRef.current) as any, {
        axisLabelFontSize,
        fontFamily,
        formatNumber,
        labelColor,
        scale,
        thresholds,
      }),
    [axisLabelFontSize, fontFamily, formatNumber, labelColor, scale, thresholds]
  );

  const height = useLegendWithRotatedAxisLabelsHeight(thresholds, {
    formatNumber,
    fontSize: axisLabelFontSize,
  });

  return (
    <svg width={width} height={height}>
      <g>
        <DataPointIndicator scale={scale} getValue={getValue} />
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

const ContinuousColorLegend = ({
  paletteId,
  domain,
  getValue,
  valueFormatter,
}: {
  paletteId: PaletteType["paletteId"];
  domain: [number, number];
  getValue: (d: Observation) => number | null;
  valueFormatter: (v: Observation[string]) => string;
}) => {
  const width = useLegendWidth();
  const { labelColor, fontFamily } = useChartTheme();
  const scale = scaleLinear()
    .domain(domain)
    .range([MARGIN.left, width - MARGIN.right]);
  const [min, max] = domain;

  return (
    <svg width={width} height={HEIGHT}>
      <g>
        <DataPointIndicator scale={scale} getValue={getValue} />
      </g>
      <foreignObject
        x={MARGIN.left}
        y={-1} // needed to align with other legends, not sure why
        width={width - MARGIN.left - MARGIN.right}
        height={COLOR_RAMP_HEIGHT}
        style={{ display: "flex" }}
      >
        <ColorRamp
          width={width - MARGIN.left - MARGIN.right}
          height={COLOR_RAMP_HEIGHT}
          colorInterpolator={getColorInterpolator(paletteId)}
          nSteps={width - MARGIN.left - MARGIN.right}
          rx={0}
        />
      </foreignObject>
      <g
        transform={`translate(${MARGIN.left}, ${
          MARGIN.top + COLOR_RAMP_HEIGHT + 14
        })`}
        fontFamily={fontFamily}
        fontSize={AXIS_LABEL_FONT_SIZE}
        fill={labelColor}
      >
        <text textAnchor="start" fontSize={AXIS_LABEL_FONT_SIZE}>
          {valueFormatter(min)}
        </text>
        <text x={width - MARGIN.right - MARGIN.left} textAnchor="end">
          {valueFormatter(max)}
        </text>
      </g>
    </svg>
  );
};

const useDataPointIndicatorStyles = makeStyles((theme: Theme) => ({
  root: {
    transition: `transform ${theme.transitions.duration.shorter}ms ease`,
  },
}));

const DataPointIndicator = ({
  scale,
  getValue,
}: {
  scale: ScaleLinear<number, number>;
  getValue: (d: Observation) => number | null;
}) => {
  const [state] = useInteraction();
  const { labelColor } = useChartTheme();
  const classes = useDataPointIndicatorStyles();
  return (
    <>
      {state.interaction.d &&
        state.interaction.visible &&
        !isNaN(getValue(state.interaction.d) ?? NaN) && (
          <polygon
            fill={labelColor}
            points="-4,0 4,0 0,4"
            className={classes.root}
            style={{
              transform: `translate(${scale(
                getValue(state.interaction.d) ?? 0
              )}px, 0)`,
            }}
          />
        )}
    </>
  );
};
