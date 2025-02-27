import { Box } from "@mui/material";
import throttle from "lodash/throttle";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";

import { Margins, useSize } from "@/charts/shared/use-size";
import { useIsMobile } from "@/utils/use-is-mobile";
import { useResizeObserver } from "@/utils/use-resize-observer";

import { useChartBounds } from "../chart-dimensions";

const TRIANGLE_SIZE = 8;
const TOOLTIP_OFFSET = 4;
export const MOBILE_TOOLTIP_PLACEMENT: TooltipPlacement = {
  x: "center",
  y: "bottom",
};

type XPlacement = "left" | "center" | "right";
type YPlacement = "top" | "middle" | "bottom";
export type TooltipPlacement = {
  x: XPlacement;
  y: YPlacement;
};

type TooltipBoxProps = {
  x: number | undefined;
  y: number | undefined;
  placement: TooltipPlacement;
  withTriangle?: boolean;
  margins: Margins;
  children: ReactNode;
};

const Portal = ({ children }: { children: ReactNode }) => {
  return ReactDOM.createPortal(children, document.body);
};

const useScroll = () => {
  const [state, setState] = useState([0, 0]);
  useEffect(() => {
    const handleScroll = throttle(() => {
      setState([window.scrollX, window.scrollY]);
    }, 16);

    document.scrollingElement?.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      document.scrollingElement?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return state;
};

const usePosition = (yKey?: number) => {
  const yKeyRef = useRef<number>();
  const [rect, rectRect] = useState<[number, number]>();
  const [x, y] = rect ?? [0, 0];
  const setRef = useMemo(() => {
    return (node: HTMLDivElement) => {
      if (yKey === yKeyRef.current || !node) {
        return;
      }

      const { left, top } = node.getBoundingClientRect();
      rectRect([left, top]);
      yKeyRef.current = yKey;
    };
  }, [yKey]);
  const [scrollX, scrollY] = useScroll();
  const bbox = useMemo(() => {
    return {
      left: x + scrollX,
      top: y + scrollY,
    };
  }, [x, y, scrollX, scrollY]);

  return [bbox, setRef] as const;
};

/**
 * Responsible for folding the container size into a single value based on breakpoints.
 * After accepting the container width, it accepts functions each breakpoint to return the generic value.
 */
const foldContainerSize =
  <T,>(containerWidth: number) =>
  ({
    xs,
    md,
    lg,
  }: {
    xs: (width: number) => T;
    md?: (width: number) => T;
    lg?: (width: number) => T;
  }) => {
    if (lg && containerWidth >= 900) {
      return lg(containerWidth);
    }

    if (md && containerWidth >= 600) {
      return md(containerWidth);
    }

    return xs(containerWidth);
  };

export const getCenteredTooltipPlacement = (props: {
  chartWidth: number;
  xAnchor: number;
  topAnchor: boolean;
}): TooltipPlacement => {
  const { chartWidth, xAnchor, topAnchor } = props;

  return topAnchor
    ? {
        x: "center",
        y: "top",
      }
    : {
        x: foldContainerSize<XPlacement>(chartWidth)({
          xs: (w) => (xAnchor < w * 0.5 ? "right" : "left"),
          md: (w) => (xAnchor < w * 0.25 ? "right" : "left"),
        }),
        y: "middle",
      };
};

export const TooltipBox = ({
  x,
  y,
  placement,
  margins,
  children,
  withTriangle = true,
}: TooltipBoxProps) => {
  const triangle = withTriangle ? mkTriangle(placement) : null;
  const [position, positionRef] = usePosition(y);
  const [tooltipRef, tooltipWidth] = useResizeObserver<HTMLDivElement>();
  const isMobile = useIsMobile();
  const { width, height } = useSize();
  const { chartWidth } = useChartBounds(width, margins, height);
  const tooltipXBoundary = isMobile
    ? getTooltipXBoundary(x!, tooltipWidth, chartWidth)
    : x!;
  const mobileTriangleXPosition = getTriangleXPos(x!, tooltipWidth, chartWidth);
  const desktopTriangleXPosition = {
    left: triangle?.left,
    right: triangle?.right,
  };
  const triangleXPosition = isMobile
    ? { left: mobileTriangleXPosition }
    : desktopTriangleXPosition;

  return (
    <>
      <div ref={positionRef} />
      <Portal>
        <Box
          ref={tooltipRef}
          data-testid="chart-tooltip"
          style={{
            zIndex: 1301,
            position: "absolute",
            left: tooltipXBoundary! + margins.left + position.left,
            top: mxYOffset(y!, placement) + margins.top + position.top,
            transform: mkTranslation(placement),
            maxWidth: "100%",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: "fit-content",
              padding: 3,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              backgroundColor: "grey.100",
              borderRadius: 1,
              filter: `drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25))`,

              "&::before": {
                content: "''",
                display: withTriangle ? "block" : "none",
                position: "absolute",
                pointerEvents: "none",
                zIndex: -1,
                width: 0,
                height: 0,
                borderStyle: "solid",
                top: triangle?.top,
                bottom: triangle?.bottom,
                ...triangleXPosition,
                borderWidth: triangle?.borderWidth,
                borderTopColor: triangle?.borderTopColor,
                borderRightColor: triangle?.borderRightColor,
                borderBottomColor: triangle?.borderBottomColor,
                borderLeftColor: triangle?.borderLeftColor,
              },
            }}
          >
            {children}
          </Box>
        </Box>
      </Portal>
    </>
  );
};

const mxYOffset = (yAnchor: number, p: TooltipPlacement) =>
  p.y === "top"
    ? yAnchor - TRIANGLE_SIZE - TOOLTIP_OFFSET
    : p.y === "bottom"
      ? yAnchor + TRIANGLE_SIZE + TOOLTIP_OFFSET
      : yAnchor;

const mkTranslation = (p: TooltipPlacement) =>
  `translate3d(${mkXTranslation(p.x, p.y)}, ${mkYTranslation(p.y)}, 0)`;

type XTranslation = "-100%" | "-50%" | 0 | string;

type YTranslation = "-100%" | "-50%" | 0;

const mkXTranslation = (xP: XPlacement, yP: YPlacement): XTranslation => {
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

const mkYTranslation = (yP: YPlacement): YTranslation =>
  yP === "top" ? "-100%" : yP === "middle" ? "-50%" : 0;

const mkTriangle = (p: TooltipPlacement) => {
  switch (true) {
    case p.x === "right" && p.y === "bottom":
      return {
        left: 0,
        right: "unset",
        bottom: "unset",
        top: `-${TRIANGLE_SIZE}px`,
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderTopColor: `transparent`,
        borderRightColor: `transparent`,
        borderBottomColor: `grey.100`,
        borderLeftColor: `grey.100`,
      };
    case p.x === "center" && p.y === "bottom":
      return {
        left: `calc(50% - ${TRIANGLE_SIZE}px)`,
        right: "unset",
        bottom: "unset",
        top: `-${TRIANGLE_SIZE}px`,
        borderWidth: `0 ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderTopColor: `transparent`,
        borderRightColor: `transparent`,
        borderBottomColor: `grey.100`,
        borderLeftColor: `transparent`,
      };
    case p.x === "left" && p.y === "bottom":
      return {
        left: `calc(100% - ${TRIANGLE_SIZE * 2}px)`,
        right: "unset",
        bottom: "unset",
        top: `-${TRIANGLE_SIZE}px`,
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderTopColor: `transparent`,
        borderRightColor: `grey.100`,
        borderBottomColor: `grey.100`,
        borderLeftColor: `transparent`,
      };
    // triangle position downwards pointing (placement "top")
    case p.x === "right" && p.y === "top":
      return {
        left: 0,
        right: "unset",
        bottom: `-${TRIANGLE_SIZE}px`,
        top: "unset",
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderTopColor: `grey.100`,
        borderRightColor: `transparent`,
        borderBottomColor: `transparent`,
        borderLeftColor: `grey.100`,
      };
    case p.x === "center" && p.y === "top":
      return {
        left: `calc(50% - ${TRIANGLE_SIZE}px)`,
        right: "unset",
        bottom: `-${TRIANGLE_SIZE}px`,
        top: "unset",
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px 0 ${TRIANGLE_SIZE}px`,
        borderTopColor: `grey.100`,
        borderRightColor: `transparent`,
        borderBottomColor: `transparent`,
        borderLeftColor: `transparent`,
      };
    case p.x === "left" && p.y === "top":
      return {
        left: `calc(100% - ${TRIANGLE_SIZE * 2}px)`,
        right: "unset",
        bottom: `-${TRIANGLE_SIZE}px`,
        top: "unset",
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderTopColor: `grey.100`,
        borderRightColor: `grey.100`,
        borderBottomColor: `transparent`,
        borderLeftColor: `transparent`,
      };
    // triangle pointing towards the side (left /right) (placement "middle")
    case p.x === "left" && p.y === "middle":
      return {
        left: "100%",
        right: "unset", // -TRIANGLE_SIZE, //`calc(100% + ${TRIANGLE_SIZE * 2}px)`,
        bottom: "unset",
        top: `calc(50% - ${TRIANGLE_SIZE}px)`,
        borderWidth: `${TRIANGLE_SIZE}px 0 ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderTopColor: `transparent`,
        borderRightColor: `transparent`,
        borderBottomColor: `transparent`,
        borderLeftColor: `grey.100`,
      };
    case p.x === "right" && p.y === "middle":
      return {
        left: `${-TRIANGLE_SIZE}px`, //`calc(100% + ${TRIANGLE_SIZE * 2}px)`,
        right: "unset",
        bottom: "unset",
        top: `calc(50% - ${TRIANGLE_SIZE}px)`,
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px 0`,
        borderTopColor: `transparent`,
        borderRightColor: `grey.100`,
        borderBottomColor: `transparent`,
        borderLeftColor: `transparent`,
      };
    case p.x === "center" && p.y === "middle":
      return {
        left: `${-TRIANGLE_SIZE}px`, //`calc(100% + ${TRIANGLE_SIZE * 2}px)`,
        right: "unset",
        bottom: "unset",
        top: `calc(50% - ${TRIANGLE_SIZE}px)`,
        borderWidth: 0,
        borderTopColor: `transparent`,
        borderRightColor: `transparent`,
        borderBottomColor: `transparent`,
        borderLeftColor: `transparent`,
      };

    default:
      return {
        left: `calc(100% - ${TRIANGLE_SIZE * 2}px)`,
        right: "unset",
        bottom: `-${TRIANGLE_SIZE}px`,
        top: "unset",
        borderWidth: `${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px ${TRIANGLE_SIZE}px`,
        borderTopColor: `grey.100`,
        borderRightColor: `grey.100`,
        borderBottomColor: `transparent`,
        borderLeftColor: `transparent`,
      };
  }
};

const getTooltipXBoundary = (
  x: number,
  tooltipWidth: number,
  chartWidth: number
) => {
  return Math.max(
    tooltipWidth / 2 - TRIANGLE_SIZE,
    Math.min(chartWidth - tooltipWidth / 2 + TRIANGLE_SIZE, x)
  );
};

const getTriangleXPos = (
  x: number,
  tooltipWidth: number,
  chartWidth: number
): number => {
  if (chartWidth < tooltipWidth) {
    const xMax = chartWidth + TRIANGLE_SIZE;

    return Math.min(
      Math.max(
        x,
        Math.min(
          tooltipWidth / 2 - TRIANGLE_SIZE,
          Math.min(chartWidth - tooltipWidth / 2 + TRIANGLE_SIZE, x)
        )
      ),
      xMax
    );
  }

  const hasReachedMax = chartWidth - tooltipWidth / 2 + TRIANGLE_SIZE < x;

  if (hasReachedMax) {
    const overflow = x - (chartWidth - tooltipWidth / 2 + TRIANGLE_SIZE);
    const maxOverflow = tooltipWidth / 2 - TRIANGLE_SIZE;

    const proportion = Math.min(overflow / maxOverflow, 1);

    return (
      tooltipWidth / 2 + proportion * (tooltipWidth / 2) - TRIANGLE_SIZE * 2
    );
  } else {
    return Math.min(
      tooltipWidth / 2 - TRIANGLE_SIZE,
      Math.min(chartWidth - tooltipWidth / 2 + TRIANGLE_SIZE, x)
    );
  }
};
