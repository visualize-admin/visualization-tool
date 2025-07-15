import { AreasState } from "@/charts/area/areas-state";
import { StackedBarsState } from "@/charts/bar/bars-stacked-state";
import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { LinesState } from "@/charts/line/lines-state";
import { PieState } from "@/charts/pie/pie-state";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { getAnnotationPosition } from "@/charts/shared/annotations";
import { useChartState } from "@/charts/shared/chart-state";
import { AnnotationCircle } from "@/charts/shared/interaction/annotation-circle";
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
  const { x, y } = getAnnotationPosition({
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
