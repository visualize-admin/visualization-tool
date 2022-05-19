import { ReactNode } from "react";

import { LinesState } from "@/charts/line/lines-state";
import { TooltipBox } from "@/charts/shared/interaction/tooltip-box";
import {
  TooltipMultiple,
  TooltipSingle,
} from "@/charts/shared/interaction/tooltip-content";
import { useChartState } from "@/charts/shared/use-chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";

export const TRIANGLE_SIZE = 8;
export const TOOLTIP_OFFSET = 4;

export const Tooltip = ({ type = "single" }: { type: TooltipType }) => {
  const [state] = useInteraction();
  const { visible, d } = state.interaction;
  return <>{visible && d && <TooltipInner d={d} type={type} />}</>;
};

export type Xplacement = "left" | "center" | "right";
export type Yplacement = "top" | "middle" | "bottom";
export type TooltipPlacement = { x: Xplacement; y: Yplacement };

export type TooltipType = "single" | "multiple";
export interface TooltipValue {
  hide?: boolean;
  label?: string;
  value: string;
  error?: string;
  color: string;
  yPos?: number;
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

const TooltipInner = ({ d, type }: { d: Observation; type: TooltipType }) => {
  const { bounds, getAnnotationInfo } = useChartState() as LinesState;
  const { margins } = bounds;
  const { xAnchor, yAnchor, placement, xValue, tooltipContent, datum, values } =
    getAnnotationInfo(d);
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
