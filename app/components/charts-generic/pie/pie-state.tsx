import { ScaleOrdinal, scaleOrdinal } from "d3-scale";
import { arc, PieArcDatum } from "d3-shape";
import * as React from "react";
import { ReactNode } from "react";
import { Observation, PieFields } from "../../../domain";
import { formatNumber, getPalette } from "../../../domain/helpers";
import { Tooltip } from "../annotations/tooltip";
import { Bounds, Margins, Observer, useBounds } from "../use-bounds";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";

export interface PieState {
  data: Observation[];
  bounds: Bounds;
  getY: (d: Observation) => number;
  getX: (d: Observation) => string;
  colors: ScaleOrdinal<string, string>;
  getAnnotationInfo: (d: PieArcDatum<Observation>) => Tooltip;
}

const usePieState = ({
  data,
  fields,
  measures,
  bounds
}: Pick<ChartProps, "data" | "measures"> & {
  bounds: Bounds;
  fields: PieFields;
}): PieState => {
  const { chartWidth, chartHeight } = bounds;
  const getY = (d: Observation): number =>
    +d[fields.value.componentIri] as number;
  const getX = (d: Observation): string =>
    d[fields.segment.componentIri] as string;

  const colors = scaleOrdinal(getPalette(fields.segment?.palette)).domain(
    data.map(getX)
  );

  const maxSide = Math.min(chartWidth, chartHeight) / 2;

  const innerRadius = 0;
  const outerRadius = Math.min(maxSide, 100);

  const arcGenerator = arc<Observation, PieArcDatum<Observation>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  // Tooltip
  const getAnnotationInfo = (arcDatum: PieArcDatum<Observation>): Tooltip => {
    const [x, y] = arcGenerator.centroid(arcDatum);
    const datum = arcDatum.data;

    const xTranslate = chartWidth / 2;
    const yTranslate = chartHeight / 2;

    const xAnchor = x + xTranslate;
    const yAnchor = y + yTranslate;

    const xPlacement = xAnchor < chartWidth * 0.5 ? "right" : "left";

    const yPlacement =
      yAnchor > chartHeight * 0.2
        ? "top"
        : yAnchor < chartHeight * 0.8
        ? "bottom"
        : "middle";

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: getX(datum),
      datum: {
        value: formatNumber(getY(datum)),
        color: colors(getX(datum)) as string
      },
      values: undefined
    };
  };
  return {
    data,
    bounds,
    getY,
    getX,
    colors,
    getAnnotationInfo
  };
};

const PieChartProvider = ({
  data,
  fields,
  measures,
  children
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: PieFields;
}) => {
  const bounds = useBounds();

  const state = usePieState({
    data,
    fields,
    measures,
    bounds
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const PieChart = ({
  data,
  fields,
  measures,
  aspectRatio,
  margins,
  children
}: Pick<ChartProps, "data" | "measures"> & {
  aspectRatio: number;
  fields: PieFields;
  margins?: Margins;
  children: ReactNode;
}) => {
  return (
    <Observer aspectRatio={aspectRatio} margins={margins}>
      <InteractionProvider>
        <PieChartProvider data={data} fields={fields} measures={measures}>
          {children}
        </PieChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
