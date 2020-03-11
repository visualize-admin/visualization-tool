import React from "react";
import { Observation } from "../../../domain";
import { LinesState } from "../lines/lines-state";
import { useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";
import { TooltipBox } from "./tooltip-box";
import { TooltipMultiple, TooltipSingle } from "./tooltip-content";

export const TRIANGLE_SIZE = 8;
export const TOOLTIP_OFFSET = 4;

export const Tooltip = ({ type = "single" }: { type: TooltipType }) => {
  const [state] = useInteraction();
  const { visible, d } = state.annotation;
  return <>{visible && d && <TooltipInner d={d} type={type} />}</>;
};

export type Xplacement = "left" | "center" | "right";
export type Yplacement = "top" | "middle" | "bottom";
export type TooltipPlacement = { x: Xplacement; y: Yplacement };

export type TooltipType = "single" | "multiple";
export interface TooltipValue {
  label?: string;
  value: string;
  color: string;
  yPos?: number;
}
export interface Tooltip {
  xAnchor: number;
  yAnchor: number;
  placement: TooltipPlacement;
  xValue: string;
  datum: TooltipValue;
  values: TooltipValue[] | undefined;
}

const TooltipInner = ({ d, type }: { d: Observation; type: TooltipType }) => {
  const { bounds, getAnnotationInfo } = useChartState() as LinesState;
  const { margins } = bounds;
  const {
    xAnchor,
    yAnchor,
    placement,
    xValue,
    datum,
    values
  } = getAnnotationInfo(d);

  return (
    <TooltipBox x={xAnchor} y={yAnchor} placement={placement} margins={margins}>
      {type === "multiple" && values ? (
        <TooltipMultiple xValue={xValue} segmentValues={values} />
      ) : (
        <TooltipSingle
          xValue={xValue}
          segment={datum.label}
          yValue={datum.value}
        />
      )}
    </TooltipBox>
  );
};
