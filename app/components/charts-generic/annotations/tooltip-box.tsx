import React, { ReactNode } from "react";
import { Box } from "theme-ui";
import { Margins } from "../use-bounds";
import {
  TRIANGLE_SIZE,
  TOOLTIP_OFFSET,
  TooltipPlacement,
  Xplacement,
  Yplacement
} from "./tooltip";

export interface TooltipBoxProps {
  x: number | undefined;
  y: number | undefined;
  placement: TooltipPlacement;
  margins: Margins;
  children: ReactNode;
}

export const TooltipBox = ({
  x,
  y,
  placement,
  margins,
  children
}: TooltipBoxProps) => {
  const triangle = mkTriangle(placement);

  return (
    <Box
      style={{
        position: "absolute",
        left: x! + margins.left,
        top: mxYOffset(y!, placement) + margins.top,
        pointerEvents: "none"
      }}
    >
      <Box
        style={{
          transform: mkTranslation(placement)
        }}
        sx={{
          width: "fit-content",
          padding: 1,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          backgroundColor: "white",
          filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25))",

          "&::before": {
            content: "''",
            display: "block",
            position: "absolute",
            pointerEvents: "none",
            zIndex: -1,
            width: 0,
            height: 0,
            borderStyle: "solid",
            top: triangle.top,
            right: triangle.right,
            bottom: triangle.bottom,
            left: triangle.left,
            borderWidth: triangle.borderWidth,
            borderColor: triangle.borderColor
          }
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

// PLACEMENT ---------------------------------------------------------------------------------------------------
export interface TooltipAnchorAndPlacementProps {
  xRef: number;
  xOffset: number;
  yRef: number;
  chartWidth: number;
  chartHeight: number;
}
export interface TooltipAnchorAndPlacement {
  xAnchor: number;
  yAnchor: number;
  xPlacement: Xplacement;
  yPlacement: Yplacement;
}

// tooltip anchor position
const mxYOffset = (yAnchor: number, p: TooltipPlacement) =>
  p.y === "top"
    ? yAnchor - TRIANGLE_SIZE - TOOLTIP_OFFSET
    : p.y === "bottom"
    ? yAnchor + TRIANGLE_SIZE + TOOLTIP_OFFSET
    : yAnchor;

// tooltip translation
const mkTranslation = (p: TooltipPlacement) =>
  `translate3d(${mkXTranslation(p.x, p.y)}, ${mkYTranslation(p.y)}, 0)`;

type Xtranslation = "-100%" | "-50%" | 0 | string;
type YTranslation = "-100%" | "-50%" | 0;
const mkXTranslation = (xP: Xplacement, yP: Yplacement): Xtranslation => {
  if (yP !== "middle") {
    return xP === "left" ? "-100%" : xP === "center" ? "-50%" : 0;
  } else {
    return xP === "left"
      ? `calc(-100% - ${TRIANGLE_SIZE + TOOLTIP_OFFSET}px)`
      : xP === "center"
      ? "-50%"
      : `${TRIANGLE_SIZE + TOOLTIP_OFFSET}px`;
  }
};
const mkYTranslation = (yP: Yplacement): YTranslation =>
  yP === "top" ? "-100%" : yP === "middle" ? "-50%" : 0;

// triangle position
const mkTriangle = (p: TooltipPlacement) => {
  switch (true) {
    case p.x === "right" && p.y === "bottom":
      return {
        left: 0,
        right: "unset",
        bottom: "unset",
        top: `-${TRIANGLE_SIZE}px`,
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderColor: `transparent transparent white white`
      };
    case p.x === "center" && p.y === "bottom":
      return {
        left: `calc(50% - ${TRIANGLE_SIZE}px)`,
        right: "unset",
        bottom: "unset",
        top: `-${TRIANGLE_SIZE}px`,
        borderWidth: `0 ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderColor: `transparent transparent white transparent`
      };
    case p.x === "left" && p.y === "bottom":
      return {
        left: `calc(100% - ${TRIANGLE_SIZE * 2}px)`,
        right: "unset",
        bottom: "unset",
        top: `-${TRIANGLE_SIZE}px`,
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderColor: `transparent white white transparent`
      };
    // triangle position downwards pointing (placement "top")
    case p.x === "right" && p.y === "top":
      return {
        left: 0,
        right: "unset",
        bottom: `-${TRIANGLE_SIZE}px`,
        top: "unset",
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderColor: `white transparent transparent white`
      };
    case p.x === "center" && p.y === "top":
      return {
        left: `calc(50% - ${TRIANGLE_SIZE}px)`,
        right: "unset",
        bottom: `-${TRIANGLE_SIZE}px`,
        top: "unset",
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px 0 ${TRIANGLE_SIZE}px`,
        borderColor: `white transparent transparent transparent`
      };
    case p.x === "left" && p.y === "top":
      return {
        left: `calc(100% - ${TRIANGLE_SIZE * 2}px)`,
        right: "unset",
        bottom: `-${TRIANGLE_SIZE}px`,
        top: "unset",
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderColor: `white white transparent transparent`
      };
    // triangle pointing towards the side (left /right) (placement "middle")
    case p.x === "left" && p.y === "middle":
      return {
        left: "100%",
        right: "unset", // -TRIANGLE_SIZE, //`calc(100% + ${TRIANGLE_SIZE * 2}px)`,
        bottom: "unset",
        top: `calc(50% - ${TRIANGLE_SIZE}px)`,
        borderWidth: `${TRIANGLE_SIZE}px 0 ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderColor: `transparent transparent transparent white`
      };
    case p.x === "right" && p.y === "middle":
      return {
        left: `${-TRIANGLE_SIZE}px`, //`calc(100% + ${TRIANGLE_SIZE * 2}px)`,
        right: "unset",
        bottom: "unset",
        top: `calc(50% - ${TRIANGLE_SIZE}px)`,
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px 0`,
        borderColor: `transparent white transparent transparent`
      };
    case p.x === "center" && p.y === "middle":
      return {
        left: `${-TRIANGLE_SIZE}px`, //`calc(100% + ${TRIANGLE_SIZE * 2}px)`,
        right: "unset",
        bottom: "unset",
        top: `calc(50% - ${TRIANGLE_SIZE}px)`,
        borderWidth: 0,
        borderColor: `transparent`
      };

    default:
      return {
        left: `calc(100% - ${TRIANGLE_SIZE * 2}px)`,
        right: "unset",
        bottom: `-${TRIANGLE_SIZE}px`,
        top: "unset",
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderColor: `white white transparent transparent`
      };
  }
};
