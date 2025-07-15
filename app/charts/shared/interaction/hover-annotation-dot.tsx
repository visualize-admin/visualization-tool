import { AreasState } from "@/charts/area/areas-state";
import { StackedBarsState } from "@/charts/bar/bars-stacked-state";
import { BarsState } from "@/charts/bar/bars-state";
import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { LinesState } from "@/charts/line/lines-state";
import { PieState } from "@/charts/pie/pie-state";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/chart-state";
import { AnnotationCircle } from "@/charts/shared/interaction/annotation-circle";
import { useInteraction } from "@/charts/shared/use-interaction";

export const HoverAnnotationDot = () => {
  const [{ type, visible, observation, segment }] = useInteraction();
  const {
    getAnnotationInfo,
    bounds: { margins },
  } = useChartState() as
    | AreasState
    | LinesState
    | PieState
    | ScatterplotState
    | BarsState
    | StackedBarsState
    | ColumnsState
    | StackedColumnsState;

  if (type !== "focus" || !visible || !observation) {
    return null;
  }

  const { x, y, color } = getAnnotationInfo(observation, segment ?? "");

  return (
    <AnnotationCircle
      x={x + margins.left}
      y={y + margins.top}
      color={color}
      focused
    />
  );
};
