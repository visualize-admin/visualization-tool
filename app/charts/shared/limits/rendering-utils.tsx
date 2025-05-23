import { Bounds } from "@/charts/shared/use-size";
import { type Limit } from "@/config-types";

export type RenderLimitDatum = {
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

export const Limits = ({
  renderData,
  margins,
  isHorizontal,
}: {
  renderData: RenderLimitDatum[];
  margins: Bounds["margins"];
  isHorizontal?: boolean;
}) => {
  return (
    <g
      id={isHorizontal ? "horizontal-limits" : "vertical-limits"}
      transform={`translate(${margins.left}, ${margins.top})`}
    >
      <g>
        {renderData.map((limit) => (
          <g key={limit.key}>
            <MiddleLine limit={limit} />
            {limit.symbolType ? (
              <g className="symbol">
                <LimitSymbol limit={limit} />
              </g>
            ) : (
              <LimitLines limit={limit} isHorizontal={isHorizontal} />
            )}
          </g>
        ))}
      </g>
    </g>
  );
};

const LIMIT_SIZE = 3;

const MiddleLine = ({ limit }: { limit: RenderLimitDatum }) => {
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

const LimitSymbol = ({ limit }: { limit: RenderLimitDatum }) => {
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
  limit: RenderLimitDatum;
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
  limit: RenderLimitDatum;
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
