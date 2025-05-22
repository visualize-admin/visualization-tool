import { useMemo } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { BarsState } from "@/charts/bar/bars-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import { Limit } from "@/config-types";
import { useLimits } from "@/config-utils";
import { truthy } from "@/domain/types";

export const HorizontalLimits = ({
  axisDimension,
  limits,
}: ReturnType<typeof useLimits>) => {
  const { yScale, getY, xScale, bounds } = useChartState() as BarsState;
  const { width, height, chartHeight, margins } = bounds;
  const renderData: RenderHorizontalLimitDatum[] = useMemo(() => {
    const isBandScale = "bandwidth" in yScale;
    const limitHeight = isBandScale ? yScale.bandwidth() : 15;

    const preparedLimits = limits
      .map(({ configLimit, measureLimit, relatedAxisDimensionValueLabel }) => {
        const key = axisDimension?.id ?? "";
        const label = relatedAxisDimensionValueLabel ?? "";
        let y1: $IntentionalAny;
        let y2: $IntentionalAny;
        let x1: number;
        let x2: number;

        switch (measureLimit.type) {
          case "single": {
            y1 = y2 = getY({ [key]: label });
            x1 = x2 = measureLimit.value;
            break;
          }
          case "value-range": {
            y1 = y2 = getY({ [key]: label });
            x1 = measureLimit.min;
            x2 = measureLimit.max;
            break;
          }
          case "time-range": {
            const { related } = measureLimit;
            const axisId = axisDimension?.id;
            const timeFrom =
              related.find(
                (d) => d.type === "time-from" && d.dimensionId === axisId
              )?.label ?? "";
            const timeTo =
              related.find(
                (d) => d.type === "time-to" && d.dimensionId === axisId
              )?.label ?? "";
            y1 = getY({ [key]: timeFrom });
            y2 = getY({ [key]: timeTo });
            x1 = x2 = measureLimit.value;
            break;
          }
          default:
            const _exhaustiveCheck: never = measureLimit;
            return _exhaustiveCheck;
        }

        return {
          type: measureLimit.type,
          y1: yScale(y1),
          y2: yScale(y2),
          x1,
          x2,
          ...configLimit,
          relatedAxisDimensionValueLabel,
        };
      })
      .filter(truthy);

    return preparedLimits
      .map(
        ({
          type,
          y1,
          y2,
          x1,
          x2,
          related,
          color,
          lineType,
          symbolType,
          relatedAxisDimensionValueLabel,
        }) => {
          const key = related.map((d) => d.dimensionId + d.value).join();
          const size =
            y1 === undefined
              ? chartHeight
              : type === "time-range"
                ? 0
                : limitHeight;
          const yOffset = isBandScale ? size / 2 : 0;
          const hasValidAxis = y1 !== undefined && y2 !== undefined;
          const hasNoAxis = relatedAxisDimensionValueLabel === undefined;
          const datum: RenderHorizontalLimitDatum = {
            key,
            x1: xScale(x1),
            x2: xScale(x2),
            y1: y1 ? y1 + yOffset : 0,
            y2: y2 ? y2 + yOffset : chartHeight,
            size,
            fill: color,
            lineType,
            symbolType,
          };

          return hasValidAxis || hasNoAxis ? datum : null;
        }
      )
      .filter(truthy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    xScale,
    limits,
    axisDimension?.values,
    axisDimension?.id,
    getY,
    yScale,
    width,
    height,
  ]);

  return (
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      <g id="horizontal-limits">
        {renderData.map((limit) => (
          <g key={limit.key}>
            <MiddleLine limit={limit} />
            {limit.symbolType ? (
              <g className="symbol">
                <LimitSymbol limit={limit} />
              </g>
            ) : (
              <LimitLines limit={limit} isHorizontal />
            )}
          </g>
        ))}
      </g>
    </g>
  );
};

type RenderHorizontalLimitDatum = {
  key: string;
  y1: number;
  y2: number;
  x1: number;
  x2: number;
  size: number;
  fill: string;
  lineType: Limit["lineType"];
  symbolType?: Limit["symbolType"];
};

export const VerticalLimits = ({
  axisDimension,
  limits,
}: ReturnType<typeof useLimits>) => {
  const { xScale, getX, yScale, bounds } = useChartState() as
    | AreasState
    | ColumnsState
    | LinesState;
  const { margins, chartWidth, width, height } = bounds;
  const renderData: RenderVerticalLimitDatum[] = useMemo(() => {
    const isBandScale = "bandwidth" in xScale;
    const limitWidth = isBandScale ? xScale.bandwidth() : 15;

    const preparedLimits = limits
      .map(({ configLimit, measureLimit, relatedAxisDimensionValueLabel }) => {
        const key = axisDimension?.id ?? "";
        const label = relatedAxisDimensionValueLabel ?? "";
        let x1: $IntentionalAny;
        let x2: $IntentionalAny;
        let y1: number;
        let y2: number;

        switch (measureLimit.type) {
          case "single": {
            x1 = x2 = getX({ [key]: label });
            y1 = y2 = measureLimit.value;
            break;
          }
          case "value-range": {
            x1 = x2 = getX({ [key]: label });
            y1 = measureLimit.min;
            y2 = measureLimit.max;
            break;
          }
          case "time-range": {
            const { related } = measureLimit;
            const axisId = axisDimension?.id;
            const timeFrom =
              related.find(
                (d) => d.type === "time-from" && d.dimensionId === axisId
              )?.label ?? "";
            const timeTo =
              related.find(
                (d) => d.type === "time-to" && d.dimensionId === axisId
              )?.label ?? "";
            x1 = getX({ [key]: timeFrom });
            x2 = getX({ [key]: timeTo });
            y1 = y2 = measureLimit.value;
            break;
          }
          default:
            const _exhaustiveCheck: never = measureLimit;
            return _exhaustiveCheck;
        }

        return {
          type: measureLimit.type,
          x1: xScale(x1),
          x2: xScale(x2),
          y1: yScale(y1),
          y2: yScale(y2),
          ...configLimit,
          relatedAxisDimensionValueLabel,
        };
      })
      .filter(truthy);

    return preparedLimits
      .map(
        ({
          type,
          x1,
          x2,
          y1,
          y2,
          related,
          color,
          lineType,
          symbolType,
          relatedAxisDimensionValueLabel,
        }) => {
          const key = related.map((d) => d.dimensionId + d.value).join();
          const size =
            x1 === undefined
              ? chartWidth
              : type === "time-range"
                ? 0
                : limitWidth;
          const xOffset = isBandScale ? size / 2 : 0;
          const hasValidAxis = x1 !== undefined && x2 !== undefined;
          const hasNoAxis = relatedAxisDimensionValueLabel === undefined;
          const datum: RenderVerticalLimitDatum = {
            key,
            x1: x1 ? x1 + xOffset : 0,
            x2: x2 ? x2 + xOffset : bounds.chartWidth,
            y1,
            y2,
            size,
            fill: color,
            lineType,
            symbolType,
          };

          return hasValidAxis || hasNoAxis ? datum : null;
        }
      )
      .filter(truthy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    xScale,
    limits,
    axisDimension?.values,
    axisDimension?.id,
    getX,
    yScale,
    width,
    height,
  ]);

  return (
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      <g id="vertical-limits">
        {renderData.map((limit) => (
          <g key={limit.key}>
            <MiddleLine limit={limit} />
            {limit.symbolType ? (
              <g className="symbol">
                <LimitSymbol limit={limit} />
              </g>
            ) : (
              <LimitLines limit={limit} />
            )}
          </g>
        ))}
      </g>
    </g>
  );
};

type RenderVerticalLimitDatum = {
  key: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  size: number;
  fill: string;
  lineType: Limit["lineType"];
  symbolType?: Limit["symbolType"];
};

const LIMIT_SIZE = 3;

type MiddleLineProps = {
  limit: RenderVerticalLimitDatum | RenderHorizontalLimitDatum;
};

const MiddleLine = ({ limit }: MiddleLineProps) => {
  return (
    <line
      className="middle-line"
      x1={limit.x1}
      x2={limit.x2}
      y1={limit.y1}
      y2={limit.y2}
      stroke={limit.fill}
      strokeWidth={LIMIT_SIZE}
      strokeDasharray={limit.lineType === "dashed" ? "3 3" : "none"}
    />
  );
};

type SymbolProps = {
  cx: number;
  cy: number;
  fill: string;
};

const LimitSymbol = ({
  limit,
}: {
  limit: RenderVerticalLimitDatum | RenderHorizontalLimitDatum;
}) => {
  if (!limit.symbolType) {
    return null;
  }

  const cx = (limit.x1 + limit.x2) / 2;
  const cy = (limit.y1 + limit.y2) / 2;

  const props: SymbolProps = {
    cx,
    cy,
    fill: limit.fill,
  };

  switch (limit.symbolType) {
    case "circle":
      return <CircleSymbol {...props} />;
    case "cross":
      return <CrossSymbol {...props} />;
    case "triangle":
      return <TriangleSymbol {...props} />;
    default:
      const _exhaustiveCheck: never = limit.symbolType;
      return _exhaustiveCheck;
  }
};

const CircleSymbol = ({ cx, cy, fill }: SymbolProps) => {
  return <circle cx={cx} cy={cy} r={LIMIT_SIZE * 1.5} fill={fill} />;
};

const CrossSymbol = ({ cx, cy, fill }: SymbolProps) => {
  return (
    <>
      <CrossSymbolArm cx={cx} cy={cy} fill={fill} rotation={45} />
      <CrossSymbolArm cx={cx} cy={cy} fill={fill} rotation={-45} />
    </>
  );
};

const CrossSymbolArm = ({
  cx,
  cy,
  fill,
  rotation,
}: SymbolProps & { rotation: number }) => {
  const armWidth = LIMIT_SIZE * 4;

  return (
    <rect
      x={cx - armWidth / 2}
      y={cy - LIMIT_SIZE / 2}
      width={armWidth}
      height={LIMIT_SIZE}
      fill={fill}
      style={{
        transform: `rotate(${rotation}deg)`,
        transformBox: "fill-box",
        transformOrigin: "center",
      }}
    />
  );
};

const TriangleSymbol = ({ cx, cy, fill }: SymbolProps) => {
  return (
    <path
      d="M0,-2.5L2.2,2.5L-2.2,2.5Z"
      fill={fill}
      transform={`translate(${cx}, ${cy}) scale(2)`}
    />
  );
};

const LimitLines = ({
  limit,
  isHorizontal,
}: {
  limit: RenderVerticalLimitDatum | RenderHorizontalLimitDatum;
  isHorizontal?: boolean;
}) => {
  return (
    <>
      <LimitLine type="top" limit={limit} isHorizontal={isHorizontal} />
      <LimitLine type="bottom" limit={limit} isHorizontal={isHorizontal} />
    </>
  );
};

const LimitLine = ({
  type,
  limit,
  isHorizontal,
}: {
  type: "top" | "bottom";
  limit: RenderVerticalLimitDatum | RenderHorizontalLimitDatum;
  isHorizontal?: boolean;
}) => {
  const isRange = isHorizontal ? limit.x1 !== limit.x2 : limit.y1 !== limit.y2;
  const props = isHorizontal
    ? {
        x1: type === "top" ? limit.x2 : limit.x1,
        x2: type === "top" ? limit.x2 : limit.x1,
        y1: limit.y1 + limit.size / 2,
        y2: limit.y2 - limit.size / 2,
      }
    : {
        y1: type === "top" ? limit.y2 : limit.y1,
        y2: type === "top" ? limit.y2 : limit.y1,
        x1: limit.x1 + limit.size / 2,
        x2: limit.x2 - limit.size / 2,
      };

  return (
    <line
      {...props}
      className={`${type}-line`}
      stroke={limit.fill}
      strokeWidth={LIMIT_SIZE}
      strokeDasharray={isRange || limit.lineType === "solid" ? "none" : "3 3"}
    />
  );
};
