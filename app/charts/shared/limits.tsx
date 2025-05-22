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
    const limitHeight = yScale.bandwidth();

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
          relatedAxisDimensionValueLabel,
        }) => {
          const key = related.map((d) => d.dimensionId + d.value).join();
          const height =
            y1 === undefined
              ? chartHeight
              : type === "time-range"
                ? 0
                : limitHeight;

          const hasValidAxis = y1 !== undefined && y2 !== undefined;
          const hasNoAxis = relatedAxisDimensionValueLabel === undefined;

          const datum: RenderHorizontalLimitDatum = {
            key,
            x1: xScale(x1),
            x2: xScale(x2),
            y1: y1 ?? 0,
            y2: y2 ?? chartHeight,
            height,
            fill: color,
            lineType,
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
            <rect
              className="left"
              x={limit.x1 - LIMIT_SIZE / 2}
              y={limit.y1}
              width={LIMIT_SIZE}
              height={limit.height}
              fill={limit.fill}
              stroke="none"
            />
            <line
              className="middle"
              x1={limit.x1 - LIMIT_SIZE / 2}
              x2={limit.x2 - LIMIT_SIZE / 2}
              y1={limit.y1 + limit.height / 2}
              y2={limit.y2 + limit.height / 2}
              stroke={limit.fill}
              strokeWidth={LIMIT_SIZE}
              strokeDasharray={limit.lineType === "dashed" ? "3 3" : "none"}
            />
            <rect
              className="right"
              x={limit.x2 - LIMIT_SIZE / 2}
              y={limit.y1}
              width={LIMIT_SIZE}
              height={limit.height}
              fill={limit.fill}
              stroke="none"
            />
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
  height: number;
  fill: string;
  lineType: Limit["lineType"];
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
          const width =
            x1 === undefined
              ? chartWidth
              : type === "time-range"
                ? 0
                : limitWidth;
          const xOffset = isBandScale ? width / 2 : 0;
          const hasValidAxis = x1 !== undefined && x2 !== undefined;
          const hasNoAxis = relatedAxisDimensionValueLabel === undefined;
          const datum: RenderVerticalLimitDatum = {
            key,
            x1: x1 ? x1 + xOffset : 0,
            x2: x2 ? x2 + xOffset : bounds.chartWidth,
            y1,
            y2,
            width,
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
  width: number;
  fill: string;
  lineType: Limit["lineType"];
  symbolType?: Limit["symbolType"];
};

const LIMIT_SIZE = 3;

type SymbolProps = {
  limit: RenderVerticalLimitDatum;
};

const LimitSymbol = ({ limit }: SymbolProps) => {
  if (!limit.symbolType) {
    return null;
  }

  switch (limit.symbolType) {
    case "circle":
      return <CircleSymbol limit={limit} />;
    case "cross":
      return <CrossSymbol limit={limit} />;
    case "triangle":
      return <TriangleSymbol limit={limit} />;
    default:
      const _exhaustiveCheck: never = limit.symbolType;
      return _exhaustiveCheck;
  }
};

const CircleSymbol = ({ limit }: SymbolProps) => {
  const cx = (limit.x1 + limit.x2) / 2;
  const cy = (limit.y1 + limit.y2) / 2;

  return <circle cx={cx} cy={cy} r={LIMIT_SIZE * 1.5} fill={limit.fill} />;
};

const CrossSymbol = ({ limit }: SymbolProps) => {
  return (
    <>
      <CrossSymbolArm limit={limit} rotation={45} />
      <CrossSymbolArm limit={limit} rotation={-45} />
    </>
  );
};

const CrossSymbolArm = ({
  limit,
  rotation,
}: {
  limit: RenderVerticalLimitDatum;
  rotation: number;
}) => {
  return (
    <rect
      x={(limit.x1 + limit.x2) / 2 - limit.width / 2}
      y={limit.y2 - LIMIT_SIZE / 2}
      width={limit.width}
      height={LIMIT_SIZE}
      fill={limit.fill}
      style={{
        transform: `rotate(${rotation}deg)`,
        transformBox: "fill-box",
        transformOrigin: "center",
      }}
    />
  );
};

const TriangleSymbol = ({ limit }: SymbolProps) => {
  const cx = (limit.x1 + limit.x2) / 2;
  const cy = (limit.y1 + limit.y2) / 2;

  return (
    <path
      d="M0,-2.5L2.2,2.5L-2.2,2.5Z"
      fill={limit.fill}
      transform={`translate(${cx}, ${cy}) scale(2)`}
    />
  );
};

const LimitLines = ({ limit }: SymbolProps) => {
  return (
    <>
      <LimitLine type="top" limit={limit} />
      <LimitLine type="bottom" limit={limit} />
    </>
  );
};

const LimitLine = ({
  type,
  limit,
}: {
  type: "top" | "bottom";
  limit: RenderVerticalLimitDatum;
}) => {
  const isRange = limit.y1 !== limit.y2;
  const y = type === "top" ? limit.y2 : limit.y1;

  return (
    <line
      className={`${type}-line`}
      x1={limit.x1 + limit.width / 2}
      x2={limit.x2 - limit.width / 2}
      y1={y}
      y2={y}
      stroke={limit.fill}
      strokeWidth={LIMIT_SIZE}
      strokeDasharray={isRange || limit.lineType === "solid" ? "none" : "3 3"}
    />
  );
};
