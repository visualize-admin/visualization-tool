import { Button, ButtonProps } from "@mui/material";

import { makeStyles } from "tss-react/mui";

type FederalButtonColor = "cobalt";

const useStyles = makeStyles<{ color?: FederalButtonColor }>()((
  { palette: c },
  { color }
) => {
  switch (color) {
    case "cobalt":
      return {
        root: {
          color: c.cobalt[500],
          borderColor: c.cobalt[500],

          "&:hover": {
            borderColor: c.cobalt[500],
            backgroundColor: c.cobalt[50],
          },
        },
      };
    case undefined:
      return {
        root: {},
      };
  }
});

export const FederalButton = ({
  className,
  color,
  ...rest
}: Omit<ButtonProps, "color"> & { color?: FederalButtonColor }) => {
  const { cx, classes } = useStyles({ color });

  return <Button {...rest} className={cx(className, classes.root)} />;
};
