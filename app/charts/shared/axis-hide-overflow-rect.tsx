import { useChartState } from "@/charts/shared/chart-state";

/** Use to hide chart content overflowing below the X axis.
 * Can happen when user defined a custom domain for the axis. */
export const AxisHideXOverflowRect = () => {
  const {
    bounds: {
      chartWidth,
      chartHeight,
      margins: { top, left, bottom },
    },
  } = useChartState();

  return (
    <rect
      x={left - 1}
      y={chartHeight + top}
      width={chartWidth + 2}
      height={bottom}
      fill="white"
    />
  );
};

/** Use to hide chart content overflowing below the X axis.
 * Can happen when user defined a custom domain for the axis. */
export const AxisHideYOverflowRect = () => {
  const {
    bounds: {
      chartHeight,
      margins: { top, left },
    },
  } = useChartState();

  return (
    <rect
      x={0}
      y={top - 1}
      width={left}
      height={chartHeight + 2}
      fill="white"
    />
  );
};
