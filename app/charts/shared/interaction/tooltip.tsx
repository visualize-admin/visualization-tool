import { ReactNode } from "react";

import { BarsState } from "@/charts/bar/bars-state";
import { LinesState } from "@/charts/line/lines-state";
import { PieState } from "@/charts/pie/pie-state";
import { useChartState } from "@/charts/shared/chart-state";
import {
  TooltipBox,
  TooltipPlacement,
} from "@/charts/shared/interaction/tooltip-box";
import {
  TooltipMultiple,
  TooltipMultipleInverted,
  TooltipSingle,
  TooltipSingleInverted,
} from "@/charts/shared/interaction/tooltip-content";
import { LegendSymbol } from "@/charts/shared/legend-color";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";

export const Tooltip = ({
  type = "single",
  inverted = false,
}: {
  type: TooltipType;
  inverted?: boolean;
}) => {
  const [state] = useInteraction();
  const { visible, d } = state.interaction;

  return (
    <>
      {visible &&
        d &&
        (inverted ? (
          <TooltipInnerInverted d={d} type={type} />
        ) : (
          <TooltipInner d={d} type={type} />
        ))}
    </>
  );
};
export type { TooltipPlacement };

export type TooltipType = "single" | "multiple";
export interface TooltipValue {
  hide?: boolean;
  label?: string;
  value: string;
  error?: string;
  color: string;
  yPos?: number;
  symbol?: LegendSymbol;
}

export interface TooltipInfo {
  xAnchor: number;
  yAnchor: number | undefined;
  placement: TooltipPlacement;
  xValue: string;
  tooltipContent?: ReactNode;
  datum: TooltipValue;
  values: TooltipValue[] | undefined;
}

export interface TooltipInfoInverted {
  xAnchor: number;
  yAnchor: number | undefined;
  placement: TooltipPlacement;
  yValue: string;
  tooltipContent?: ReactNode;
  datum: TooltipValue;
  values: TooltipValue[] | undefined;
}

const TooltipInner = ({ d, type }: { d: Observation; type: TooltipType }) => {
  const { bounds, getAnnotationInfo } = useChartState() as
    | LinesState
    | PieState;
  const { margins } = bounds;
  const { xAnchor, yAnchor, placement, xValue, tooltipContent, datum, values } =
    getAnnotationInfo(d as any);

  if (Number.isNaN(yAnchor)) {
    return null;
  }

  return (
    <TooltipBox x={xAnchor} y={yAnchor} placement={placement} margins={margins}>
      {tooltipContent ? (
        tooltipContent
      ) : type === "multiple" && values ? (
        <TooltipMultiple xValue={xValue} segmentValues={values} />
      ) : (
        <TooltipSingle
          xValue={xValue}
          segment={datum.label}
          yValue={datum.value}
          yError={datum.error}
        />
      )}
    </TooltipBox>
  );
};

const TooltipInnerInverted = ({
  d,
  type,
}: {
  d: Observation;
  type: TooltipType;
}) => {
  const { bounds, getAnnotationInfo } = useChartState() as BarsState;
  const { margins } = bounds;
  const { xAnchor, yAnchor, placement, yValue, tooltipContent, datum, values } =
    getAnnotationInfo(d as any);

  if (Number.isNaN(yAnchor)) {
    return null;
  }

  return (
    <TooltipBox x={xAnchor} y={yAnchor} placement={placement} margins={margins}>
      {tooltipContent ? (
        tooltipContent
      ) : type === "multiple" && values ? (
        <TooltipMultipleInverted yValue={yValue} segmentValues={values} />
      ) : (
        <TooltipSingleInverted
          yValue={yValue}
          segment={datum.label}
          xValue={datum.value}
          xError={datum.error}
        />
      )}
    </TooltipBox>
  );
};
