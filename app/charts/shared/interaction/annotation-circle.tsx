import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

export const AnnotationCircle = ({
  x,
  y,
  color,
  focused = false,
}: {
  x: number;
  y: number;
  color: string;
  focused?: boolean;
}) => {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.outerCircle, focused && classes.focused)}
      style={{ left: x, top: y }}
    >
      <div className={classes.innerCircle} style={{ backgroundColor: color }} />
    </div>
  );
};

const SIZE = 16;

const useStyles = makeStyles((theme: Theme) => ({
  outerCircle: {
    transform: "translate3d(-50%, -50%, 0)",
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: "50%",
    backgroundColor: "white",
    boxShadow: theme.shadows[2],
    pointerEvents: "none",
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
    outline: "4px solid #A332DE",
  },
}));
