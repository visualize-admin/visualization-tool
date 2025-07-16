import { ButtonBase, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import {
  ANNOTATION_FOCUS_COLOR,
  ANNOTATION_FOCUS_WIDTH,
} from "@/charts/shared/rendering-utils";

export const AnnotationCircle = ({
  x,
  y,
  color = DEFAULT_ANNOTATION_CIRCLE_COLOR,
  focused = false,
  onClick,
}: {
  x: number;
  y: number;
  color?: string;
  focused?: boolean;
  onClick?: () => void;
}) => {
  const classes = useStyles();

  return (
    <ButtonBase
      className={clsx(classes.outerCircle, focused && classes.focused)}
      onClick={onClick}
      style={{ left: x, top: y, pointerEvents: onClick ? "auto" : "none" }}
    >
      <div className={classes.innerCircle} style={{ backgroundColor: color }} />
    </ButtonBase>
  );
};

export const DEFAULT_ANNOTATION_CIRCLE_COLOR = "#6B7280";
const SIZE = 16;

const useStyles = makeStyles((theme: Theme) => ({
  outerCircle: {
    transform: "translate3d(-50%, -50%, 0)",
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: "50%",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
    cursor: "pointer",
  },
  innerCircle: {
    transform: "translate3d(-50%, -50%, 0)",
    position: "absolute",
    left: "50%",
    top: "50%",
    width: SIZE / 2,
    height: SIZE / 2,
    borderRadius: "50%",
  },
  focused: {
    outline: `${ANNOTATION_FOCUS_WIDTH}px solid ${ANNOTATION_FOCUS_COLOR}`,
  },
}));
