import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode } from "react";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    height: "fit-content",
    marginTop: "-0.33rem",
  },
}));

export const ActionElementsContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  const classes = useStyles();

  return <div className={classes.root}>{children}</div>;
};
