import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import map from "lodash/map";
import mapValues from "lodash/mapValues";
import range from "lodash/range";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import { Layout, Responsive, WidthProvider } from "react-grid-layout";
import { match } from "ts-pattern";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export type ResizeHandle = NonNullable<Layout["resizeHandles"]>[number];
export type GridLayout = "horizontal" | "vertical" | "wide" | "tall";

export const availableHandles: ResizeHandle[] = [
  "s",
  "w",
  "e",
  "n",
  "sw",
  "nw",
  "se",
  "ne",
];

/** In grid unit */
const MAX_H = 10;
const MIN_H = 5;

/** In grid unit */
const MAX_W = 4;

const COLS = { lg: 4, md: 2, sm: 1, xs: 1, xxs: 1 };
const ROW_HEIGHT = 100;

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
      transitionProperty: "left, top, width, height",

      // Customization
      boxSizing: "border-box",
      overflow: "hidden",
    },
    "& .react-grid-item img": {
      pointerEvents: "none",
      userSelect: "none",
    },
    "& .react-grid-item.cssTransforms": {
      transitionProperty: "transform, width, height",
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
      background: "#eee",
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

type ChartGridLayoutProps = {
  className: string;
  onLayoutChange: Function;
  resize?: boolean;
} & ComponentProps<typeof ResponsiveReactGridLayout>;

export const ChartGridLayout = (props: ChartGridLayoutProps) => {
  const { children, layouts, resize } = props;
  const [mounted, setMounted] = useState(false);

  const enhancedLayouts = useMemo(() => {
    return mapValues(layouts, (layouts) => {
      return layouts.map((x) => ({
        ...x,
        minH: MIN_H,
        maxH: MAX_H,
        maxW: MAX_W,
        resizeHandles: resize ? availableHandles : [],
      }));
    });
  }, [layouts, resize]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const classes = useStyles();
  return (
    <ResponsiveReactGridLayout
      {...props}
      layouts={enhancedLayouts}
      className={clsx(classes.root, props.className)}
      cols={COLS}
      rowHeight={ROW_HEIGHT}
      measureBeforeMount={false}
      useCSSTransforms={mounted}
      compactType="vertical"
      preventCollision={false}
    >
      {children}
    </ResponsiveReactGridLayout>
  );
};

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
}) {
  return map(range(0, count), (_item, i) => {
    return match(layout)
      .with("horizontal", () => {
        const h = Math.ceil(maxHeight / count);
        return {
          x: 0,
          y: i * h,
          w: maxWidth,
          h,
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
          i: i.toString(),
          resizeHandles,
        };
      })
      .with("tiles", () => {
        return {
          x: i % 3,
          y: Math.floor(i / 3),
          w: 4,
          h: 4,
          i: i.toString(),
          resizeHandles,
        };
      })
      .with("wide", () => {
        const w = Math.ceil(maxWidth / (count - 1));
        return {
          x: i === 0 ? maxWidth : w * (i - 1),
          y: i === 0 ? 0 : maxHeight / 2,
          w: i === 0 ? maxWidth : w,
          h: maxHeight / 2,
          i: i.toString(),
          resizeHandles,
        };
      })
      .exhaustive();
  });
};

export default ChartGridLayout;
