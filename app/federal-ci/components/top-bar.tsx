import { Box, Breakpoint, SxProps } from "@mui/material";

import { ContentWrapper } from "@/federal-ci/components/content-wrapper";
import { makeStyles } from "@/federal-ci/utils/make-styles";

const useStyles = makeStyles()(
  ({ breakpoints: b, palette: p, spacing: s }) => ({
    root: {
      display: "flex",
      alignItems: "center",
      height: s(10),
      minHeight: s(10),
      backgroundColor: p.cobalt[600],
      [b.between("xxs" as Breakpoint, "xs")]: {
        height: s(11),
        minHeight: s(11),
      },
      [b.between("xs", "xxl" as Breakpoint)]: {
        height: s(10),
        minHeight: s(10),
      },
      [b.only("xxxl" as Breakpoint)]: {
        height: s(15),
        minHeight: s(15),
      },
    },
    contentWrapper: {
      display: "flex",
      alignItems: "center",
    },
  })
);

type TopBarProps = {
  ContentWrapperProps?: {
    sx?: SxProps;
  };
  sx?: SxProps;
  children?: React.ReactNode;
};

export const TopBar = (props: TopBarProps) => {
  const { ContentWrapperProps, children, sx } = props;
  const { classes } = useStyles();
  return (
    <Box className={classes.root} sx={sx}>
      <ContentWrapper
        className={classes.contentWrapper}
        sx={ContentWrapperProps?.sx}
      >
        {children}
      </ContentWrapper>
    </Box>
  );
};
