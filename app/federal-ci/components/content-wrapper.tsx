import { Box, Breakpoint, SxProps } from "@mui/material";
import { PropsWithChildren } from "react";

import { makeStyles } from "@/federal-ci/utils/make-styles";

const useStyles = makeStyles()(({ breakpoints: b, spacing: s }) => ({
  root: {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    width: "100%",
    margin: "auto",
    [b.only("xxs" as Breakpoint)]: {
      paddingLeft: s(5),
      paddingRight: s(5),
    },
    [b.only("xs")]: {
      paddingLeft: s(7),
      paddingRight: s(7),
    },
    [b.only("sm")]: {
      paddingLeft: s(9),
      paddingRight: s(9),
    },
    [b.only("md")]: {
      paddingLeft: s(9),
      paddingRight: s(9),
    },
    [b.only("lg")]: {
      paddingLeft: s(10),
      paddingRight: s(10),
    },
    [b.only("xl")]: {
      paddingLeft: s(12),
      paddingRight: s(12),
    },
    [b.only("xxl" as Breakpoint)]: {
      maxWidth: 1448,
    },
    [b.only("xxxl" as Breakpoint)]: {
      maxWidth: 1548,
    },
  },
}));

type ContentWrapperProps = PropsWithChildren<{
  sx?: SxProps;
  className?: string;
}>;

/**
 * Aligns the content horizontally and controls the padding. Use in components
 * that should match the padding of built-in components.
 */
export const ContentWrapper = (props: ContentWrapperProps) => {
  const { classes, cx } = useStyles();
  const { sx, children, className } = props;
  return (
    <Box className={cx(classes.root, className)} sx={sx}>
      {children}
    </Box>
  );
};
