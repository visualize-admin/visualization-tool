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
      className={clsx(classes.wrapper, onClick && classes.clickable)}
      style={{ left: x, top: y, pointerEvents: onClick ? "auto" : "none" }}
      onClick={onClick}
    >
      <div className={clsx(classes.outerCircle, focused && classes.focused)}>
        <div
          className={classes.innerCircle}
          style={{ backgroundColor: color }}
        />
      </div>
    </ButtonBase>
  );
};

export const DEFAULT_ANNOTATION_CIRCLE_COLOR = "#1F2937";
const SIZE = 16;

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    transform: "translate3d(-50%, -50%, 0)",
    position: "absolute",
    padding: theme.spacing(1),
  },
  outerCircle: {
    width: SIZE,
    height: SIZE,
    borderRadius: "50%",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
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
  clickable: {
    cursor: "pointer",
  },
  focused: {
    outline: `${ANNOTATION_FOCUS_WIDTH}px solid ${ANNOTATION_FOCUS_COLOR}`,
  },
}));
