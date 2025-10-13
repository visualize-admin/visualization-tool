import { IconButton, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_ANNOTATION_CIRCLE_COLOR } from "@/charts/shared/annotation-circle";
import {
  AnnotationEnabledChartState,
  RenderAnnotation,
} from "@/charts/shared/annotations";
import { useChartState } from "@/charts/shared/chart-state";
import { MarkdownInheritFonts } from "@/components/markdown";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { useChartInteractiveFilters } from "@/stores/interactive-filters";
import { getTextSize } from "@/utils/get-text-size";

export const AnnotationTooltip = ({
  renderAnnotation: { annotation, x, y },
  closable,
}: {
  renderAnnotation: RenderAnnotation;
  closable: boolean;
}) => {
  const locale = useLocale();
  const classes = useStyles();
  const annotations = useChartInteractiveFilters((d) => d.annotations);
  const updateAnnotation = useChartInteractiveFilters(
    (d) => d.updateAnnotation
  );

  const open = annotations[annotation.key];
  const text = annotation.text[locale];

  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    minWidth: 0,
    height: 0,
  });

  useLayoutEffect(() => {
    const { width: minWidth } = getTextSize(text, {
      fontSize: 12,
      width: 240,
      fontWeight: 400,
    });

    if (ref.current && open) {
      const rect = ref.current.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        minWidth,
        height: rect.height,
      });
    }
  }, [open, text]);

  const {
    bounds: { width },
  } = useChartState() as AnnotationEnabledChartState;

  const { left, top } = useMemo(() => {
    return getAdjustedPosition({
      x,
      y,
      minWidth: dimensions.minWidth,
      chartWidth: width,
    });
  }, [x, y, dimensions, width]);

  const handleClose = useCallback(() => {
    updateAnnotation(annotation.key, false);
  }, [annotation.key, updateAnnotation]);

  return open && text ? (
    <>
      <Connector annotationX={x} annotationY={y} />
      <div
        ref={ref}
        className={classes.root}
        style={{ left, top, minWidth: dimensions.minWidth }}
      >
        <Typography className={classes.text} variant="caption">
          <MarkdownInheritFonts>{annotation.text[locale]}</MarkdownInheritFonts>
        </Typography>
        <IconButton
          className={classes.closeButton}
          onClick={handleClose}
          disabled={!closable}
        >
          <Icon name="close" size={14} />
        </IconButton>
      </div>
    </>
  ) : null;
};

const Y_OFFSET = 12;

const getAdjustedPosition = ({
  x,
  y,
  minWidth,
  chartWidth,
}: {
  x: number;
  y: number;
  minWidth: number;
  chartWidth: number;
}) => {
  const xOffset = -24;

  let adjustedX = x + xOffset;
  let adjustedY = y - Y_OFFSET;

  if (adjustedX + minWidth > chartWidth) {
    adjustedX = chartWidth - minWidth;
  }

  if (adjustedX < 0) {
    adjustedX = 0;
  }

  return {
    left: adjustedX,
    top: adjustedY,
  };
};

const Connector = ({
  annotationX,
  annotationY,
}: {
  annotationX: number;
  annotationY: number;
}) => {
  const classes = useStyles();
  const connectorHeight = Y_OFFSET;
  const connectorTop = annotationY - Y_OFFSET;

  return (
    <div
      className={classes.connector}
      style={{
        left: annotationX,
        top: connectorTop,
        height: connectorHeight,
      }}
    />
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    zIndex: 2,
    transform: "translate(0%, -100%)",
    position: "absolute",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    width: "fit-content",
    maxWidth: 240,
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    wordBreak: "break-word",
    boxShadow: theme.shadows[4],
  },
  text: {
    margin: "auto 0",
  },
  closeButton: {
    transform: "translate(25%, 0)",
    marginTop: `-${theme.spacing(2)}`,
    padding: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  connector: {
    zIndex: 1,
    transform: "translateX(-50%)",
    position: "absolute",
    width: 1,
    backgroundColor: DEFAULT_ANNOTATION_CIRCLE_COLOR,
    pointerEvents: "none",
  },
}));
