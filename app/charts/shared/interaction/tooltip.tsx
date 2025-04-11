import { PieArcDatum } from "d3-shape";
import { ReactNode } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { GroupedBarsState } from "@/charts/bar/bars-grouped-state";
import { StackedBarsState } from "@/charts/bar/bars-stacked-state";
import { BarsState } from "@/charts/bar/bars-state";
import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { ComboLineDualState } from "@/charts/combo/combo-line-dual-state";
import { ComboLineSingleState } from "@/charts/combo/combo-line-single-state";
import { LinesState } from "@/charts/line/lines-state";
import { PieState } from "@/charts/pie/pie-state";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/chart-state";
import {
  TooltipBox,
  TooltipPlacement,
} from "@/charts/shared/interaction/tooltip-box";
import {
  TooltipMultiple,
  TooltipSingle,
} from "@/charts/shared/interaction/tooltip-content";
import { LegendSymbol } from "@/charts/shared/legend-color";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";

export const Tooltip = ({ type = "single" }: { type: TooltipType }) => {
  const [state] = useInteraction();
  const { visible, d } = state.interaction;

  return visible && d ? <TooltipInner d={d} type={type} /> : null;
};
export type { TooltipPlacement };

type TooltipType = "single" | "multiple";

export type TooltipValue = {
  hide?: boolean;
  label?: string;
  value: string;
  error?: string;
  color: string;
  yPos?: number;
  symbol?: LegendSymbol;
};

export type TooltipInfo = {
  xAnchor: number;
  yAnchor: number | undefined;
  placement: TooltipPlacement;
  value: string;
  tooltipContent?: ReactNode;
  datum: TooltipValue;
  values: TooltipValue[] | undefined;
  withTriangle?: boolean;
};

const TooltipInner = ({ d, type }: { d: Observation; type: TooltipType }) => {
  const { bounds, getAnnotationInfo } = useChartState() as
    | AreasState
    | BarsState
    | GroupedBarsState
    | StackedBarsState
    | ComboLineDualState
    | ComboLineSingleState
    | ComboLineColumnState
    | LinesState
    | PieState
    | ScatterplotState;
  const { margins } = bounds;
  const {
    xAnchor,
    yAnchor,
    placement,
    value,
    tooltipContent,
    datum,
    values,
    withTriangle,
  } = getAnnotationInfo(d as Observation & PieArcDatum<Observation>, []);

  if (Number.isNaN(yAnchor) || yAnchor === undefined) {
    return null;
  }

  return (
    <TooltipBox
      x={xAnchor}
      y={yAnchor}
      placement={placement}
      withTriangle={withTriangle}
      margins={margins}
    >
      {tooltipContent ? (
        tooltipContent
      ) : type === "multiple" && values ? (
        <TooltipMultiple xValue={value} segmentValues={values} />
      ) : (
        <TooltipSingle
          xValue={value}
          segment={datum.label}
          yValue={datum.value}
          yError={datum.error}
        />
      )}
    </TooltipBox>
  );
};
