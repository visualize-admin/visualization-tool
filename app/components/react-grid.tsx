import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import isEqual from "lodash/isEqual";
import map from "lodash/map";
import mapValues from "lodash/mapValues";
import range from "lodash/range";
import { ComponentProps, useEffect, useState } from "react";
import { Layout, Responsive, WidthProvider } from "react-grid-layout";
import { match } from "ts-pattern";

import { useStyles as useChartContainerStyles } from "@/charts/shared/containers";
import { getChartWrapperId } from "@/components/chart-panel";
import {
  hasChartConfigs,
  isLayouting,
  LayoutBlock,
  ReactGridLayoutType,
  useConfiguratorState,
} from "@/configurator";
import { useTimeout } from "@/hooks/use-timeout";
import { theme } from "@/themes/theme";
import { assert } from "@/utils/assert";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

type ResizeHandle = NonNullable<Layout["resizeHandles"]>[number];
export type GridLayout = "horizontal" | "vertical" | "wide" | "tall";

export const availableHandlesByBlockType: Record<
  LayoutBlock["type"],
  ResizeHandle[]
> = {
  chart: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
  text: ["w", "e"],
};

/** In grid unit */
const MAX_H = 10;

const INITIAL_H = 7;
export const MIN_H = 1;

/** In grid unit */
const MAX_W = 4;

export const COLS = { xl: 4, lg: 3, md: 2, sm: 1 };
export const FREE_CANVAS_BREAKPOINTS = {
  xl: theme.breakpoints.values.md,
  lg: theme.breakpoints.values.sm,
  md: 480,
  sm: 0,
};
export const ROW_HEIGHT = 100;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "relative",
    "& .react-grid-layout": {
      position: "relative",
      transition: "height 200ms ease",
      minHeight: "initial",

      // Customization
      background: "#eee",
      marginTop: "10px",
    },
    "& .react-grid-item": {
      transition: "all 200ms ease",
      transitionProperty: "none",

      // Customization
      boxSizing: "border-box",
    },
    "& .react-grid-item img": {
      pointerEvents: "none",
      userSelect: "none",
    },
    "& .react-grid-item.cssTransforms": {
      transitionProperty: "none",
    },
    "& .react-grid-item.resizing": {
      transition: "none",
      zIndex: 1,
      willChange: "width, height",

      // Customization
      opacity: 0.9,
    },
    "& .react-grid-item.react-draggable-dragging": {
      transition: "none",
      zIndex: 3,
      willChange: "transform",
    },
    "& .react-grid-item.dropping": {
      visibility: "hidden",
    },
    "& .react-grid-item.react-grid-placeholder": {
      background: theme.palette.primary.main,
      opacity: 0.2,
      transitionDuration: "100ms",
      zIndex: 2,
      "-webkit-user-select": "none",
      "-moz-user-select": "none",
      "-ms-user-select": "none",
      "-o-user-select": "none",
      userSelect: "none",
    },
    "& .react-grid-item.react-grid-placeholder.placeholder-resizing": {
      transition: "none",
    },
    "& .react-grid-item .react-resizable-handle": {
      position: "absolute",
      width: "20px",
      height: "20px",
    },
    "& .react-grid-item .react-resizable-handle::after": {
      content: '""',
      position: "absolute",
      right: "3px",
      bottom: "3px",
      width: "5px",
      height: "5px",
      borderRight: "2px solid rgba(0, 0, 0, 0.4)",
      borderBottom: "2px solid rgba(0, 0, 0, 0.4)",
    },
    "& .react-resizable-hide .react-resizable-handle": {
      display: "none",
    },
    "& .react-grid-item .react-resizable-handle.react-resizable-handle-sw": {
      bottom: "0",
      left: "0",
      cursor: "sw-resize",
      transform: "rotate(90deg)",
    },
    "& .react-grid-item .react-resizable-handle.react-resizable-handle-se": {
      bottom: "0",
      right: "0",
      cursor: "se-resize",
    },
    "& .react-grid-item .react-resizable-handle.react-resizable-handle-nw": {
      top: "0",
      left: "0",
      cursor: "nw-resize",
      transform: "rotate(180deg)",
    },
    "& .react-grid-item .react-resizable-handle.react-resizable-handle-ne": {
      top: "0",
      right: "0",
      cursor: "ne-resize",
      transform: "rotate(270deg)",
    },
    "& .react-grid-item .react-resizable-handle.react-resizable-handle-w, & .react-grid-item .react-resizable-handle.react-resizable-handle-e":
      {
        top: "50%",
        marginTop: "-10px",
        cursor: "ew-resize",
      },
    "& .react-grid-item .react-resizable-handle.react-resizable-handle-w": {
      left: "0",
      transform: "rotate(135deg)",
    },
    "& .react-grid-item .react-resizable-handle.react-resizable-handle-e": {
      right: "0",
      transform: "rotate(315deg)",
    },
    "& .react-grid-item .react-resizable-handle.react-resizable-handle-n, & .react-grid-item .react-resizable-handle.react-resizable-handle-s":
      {
        left: "50%",
        marginLeft: "-10px",
        cursor: "ns-resize",
      },
    "& .react-grid-item .react-resizable-handle.react-resizable-handle-n": {
      top: "0",
      transform: "rotate(225deg)",
    },
    "& .react-grid-item .react-resizable-handle.react-resizable-handle-s": {
      bottom: "0",
      transform: "rotate(45deg)",
    },
    "& .react-grid-item:not(.react-grid-placeholder)": {
      border: theme.palette.divider,
      boxShadow: theme.shadows[1],
    },
    "& .react-grid-item.static": {
      background: "#cce",
    },
    "& .react-grid-item .text": {
      fontSize: "24px",
      textAlign: "center",
      position: "absolute",
      top: "0",
      bottom: "0",
      left: "0",
      right: "0",
      margin: "auto",
      height: "24px",
    },
    "& .react-grid-item .minMax": {
      fontSize: "12px",
    },
    "& .react-grid-item .add": {
      cursor: "pointer",
    },
    "& .react-grid-dragHandleExample": {
      cursor: "move",
    },
  },
}));

export const CHART_GRID_MIN_HEIGHT = 150;

export const ChartGridLayout = ({
  children,
  className,
  layouts,
  resize,
  ...rest
}: {
  className: string;
  resize?: boolean;
} & ComponentProps<typeof ResponsiveReactGridLayout>) => {
  const classes = useStyles();

  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const layout = state.layout;
  assert(
    layout.type === "dashboard" && layout.layout === "canvas",
    "ChartGridLayout can only be used in a canvas layout!"
  );
  const allowHeightInitialization = isLayouting(state);
  const [mounted, setMounted] = useState(false);
  const mountedForSomeTime = useTimeout(500, mounted);
  const chartContainerClasses = useChartContainerStyles();
  const [enhancedLayouts, setEnhancedLayouts] = useState(() => {
    if (!layouts) {
      return {};
    }

    return mapValues(layouts, (chartLayouts) => {
      return chartLayouts.map((chartLayout) => {
        const block = layout.blocks.find(
          (block) => block.key === chartLayout.i
        );

        return {
          ...chartLayout,
          maxW: MAX_W,
          w: Math.min(MAX_W, chartLayout.w),
          resizeHandles:
            resize && block ? availableHandlesByBlockType[block.type] : [],
          minH: chartLayout.minH ?? MIN_H,
          h: Math.max(MIN_H, chartLayout.h),
        };
      });
    });
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mountedForSomeTime || !allowHeightInitialization) {
      return;
    }

    const newLayouts = Object.fromEntries(
      Object.entries(enhancedLayouts).map(([breakpoint, chartLayouts]) => {
        return [
          breakpoint,
          chartLayouts.map((chartLayout) => {
            const block = layout.blocks.find(
              (block) => block.key === chartLayout.i
            );

            if (block?.initialized) {
              return chartLayout;
            }

            let minH = MIN_H;

            const chartKey = chartLayout.i;
            const wrapper: HTMLDivElement | null = document.querySelector(
              `#${getChartWrapperId(chartKey)}`
            );

            if (wrapper) {
              const chartContainer: HTMLDivElement | null =
                wrapper.querySelector(
                  `.${chartContainerClasses.chartContainer}`
                );

              if (chartContainer) {
                const minWrapperHeight =
                  wrapper.scrollHeight -
                  chartContainer.clientHeight +
                  CHART_GRID_MIN_HEIGHT;
                minH = Math.max(
                  MIN_H,
                  Math.ceil(minWrapperHeight / ROW_HEIGHT)
                );
              }
            }

            return {
              ...chartLayout,
              maxW: MAX_W,
              w: Math.min(MAX_W, chartLayout.w),
              resizeHandles:
                resize && block ? availableHandlesByBlockType[block.type] : [],
              minH,
              h: minH,
            };
          }),
        ];
      })
    );

    if (!isEqual(newLayouts, enhancedLayouts)) {
      setEnhancedLayouts(newLayouts);
      dispatch({
        type: "LAYOUT_CHANGED",
        value: {
          ...layout,
          layouts: newLayouts,
          blocks: layout.blocks.map((block) => {
            return {
              ...block,
              initialized: true,
            };
          }),
        },
      });
    }
  }, [
    allowHeightInitialization,
    chartContainerClasses.chartContainer,
    dispatch,
    enhancedLayouts,
    mountedForSomeTime,
    resize,
    layout,
    state.chartConfigs,
  ]);

  return (
    <ResponsiveReactGridLayout
      {...rest}
      layouts={layouts}
      className={clsx(classes.root, className)}
      cols={COLS}
      rowHeight={ROW_HEIGHT}
      useCSSTransforms={false}
      compactType="vertical"
      preventCollision={false}
      isResizable={resize}
    >
      {children}
    </ResponsiveReactGridLayout>
  );
};

export const getInitialTileWidth = () => MAX_W / 4;
export const getInitialTileHeight = () => INITIAL_H;

export const generateLayout = function ({
  count,
  maxWidth = MAX_W,
  maxHeight = MAX_H,
  layout,
  resizeHandles,
}: {
  count: number;
  maxWidth?: number;
  maxHeight?: number;
  layout: "horizontal" | "vertical" | "wide" | "tall" | "tiles";
  resizeHandles?: ResizeHandle[];
}): ReactGridLayoutType[] {
  return map(range(0, count), (_item, i) => {
    return match(layout)
      .with("horizontal", () => {
        const h = Math.ceil(maxHeight / count);
        return {
          x: 0,
          y: i * h,
          w: maxWidth,
          h,
          minH: MIN_H,
          i: i.toString(),
          resizeHandles,
        };
      })
      .with("vertical", () => {
        const w = Math.ceil(maxWidth / count);
        return {
          x: i * w,
          y: 0,
          w: w,
          h: maxHeight,
          minH: MIN_H,
          i: i.toString(),
          resizeHandles,
        };
      })
      .with("tall", () => {
        const h = Math.ceil(maxHeight / (count - 1));
        return {
          x: i === 0 ? 0 : maxWidth / 2,
          y: i === 0 ? 0 : h * (i - 1),
          w: maxWidth / 2,
          h: i === 0 ? maxHeight : h,
          minH: MIN_H,
          i: i.toString(),
          resizeHandles,
        };
      })
      .with("tiles", () => {
        return {
          x: ((i % 4) * MAX_W) / 4,
          y: Math.floor(i / 2) * INITIAL_H,
          w: getInitialTileWidth(),
          h: getInitialTileHeight(),
          minH: MIN_H,
          i: i.toString(),
          resizeHandles: [],
        };
      })
      .with("wide", () => {
        const w = Math.ceil(maxWidth / (count - 1));
        return {
          x: i === 0 ? maxWidth : w * (i - 1),
          y: i === 0 ? 0 : maxHeight / 2,
          w: i === 0 ? maxWidth : w,
          h: maxHeight / 2,
          minH: MIN_H,
          i: i.toString(),
          resizeHandles,
        };
      })
      .exhaustive();
  });
};
