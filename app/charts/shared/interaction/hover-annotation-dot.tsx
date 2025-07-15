import { AreasState } from "@/charts/area/areas-state";
import { StackedBarsState } from "@/charts/bar/bars-stacked-state";
import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { LinesState } from "@/charts/line/lines-state";
import { PieState } from "@/charts/pie/pie-state";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/chart-state";
import { AnnotationCircle } from "@/charts/shared/interaction/annotation-circle";
import { TooltipValue } from "@/charts/shared/interaction/tooltip";
import { useInteraction } from "@/charts/shared/use-interaction";

export const HoverAnnotationDot = () => {
  const [interaction] = useInteraction();
  const {
    chartType,
    segments,
    getTooltipInfo,
    bounds: { margins },
    getSegmentLabel,
  } = useChartState() as
    | AreasState
    | LinesState
    | PieState
    | ScatterplotState
    | StackedBarsState
    | ColumnsState
    | StackedColumnsState;

  if (
    interaction.type !== "focus" ||
    !interaction.visible ||
    !interaction.observation
  ) {
    return null;
  }

  const segmentLabel = getSegmentLabel(interaction.segment ?? "");
  const { xAnchor, yAnchor, datum, values } = getTooltipInfo(
    interaction.observation
  );

  if (!values && !xAnchor && !yAnchor) {
    return null;
  }

  const value = values?.find((v) => v.label === segmentLabel) ?? datum;
  const { x, y } = getPosition({
    chartType,
    multipleSegments: segments.length > 1,
    xAnchor,
    yAnchor,
    value,
  });

  if (!value || value.hide || x === undefined || y === undefined) {
    return null;
  }

  return (
    <AnnotationCircle
      x={x + margins.left}
      y={y + margins.top}
      color={value.color || "#6B7280"}
      focused
    />
  );
};

const getPosition = ({
  chartType,
  multipleSegments,
  xAnchor,
  yAnchor,
  value,
}: {
  chartType: "area" | "bar" | "column" | "line" | "pie" | "scatterplot";
  multipleSegments: boolean;
  xAnchor: number;
  yAnchor: number | undefined;
  value: TooltipValue | undefined;
}) => {
  const axisOffset = multipleSegments ? 0 : -16;

  switch (chartType) {
    case "area":
    case "line": {
      const y = value?.axisOffset ?? yAnchor;

      return {
        x: xAnchor,
        y,
      };
    }
    case "bar":
      return {
        x: (value?.axisOffset ?? xAnchor) + axisOffset,
        y: yAnchor,
      };
    case "column": {
      const y = value?.axisOffset ?? yAnchor;

      return {
        x: xAnchor,
        y: y !== undefined ? y + axisOffset : y,
      };
    }
    case "pie":
    case "scatterplot":
      return {
        x: xAnchor,
        y: yAnchor,
      };
    default:
      const _exhaustiveCheck: never = chartType;
      return _exhaustiveCheck;
  }
};
