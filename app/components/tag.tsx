import { BoxProps, styled, Typography, TypographyProps } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import React, { forwardRef, ReactNode } from "react";

type TagType =
  | "draft"
  | "theme"
  | "organization"
  | "termset"
  | "dimension"
  | "unknown";

const TagTypography = styled(Typography)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  minHeight: 24,
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  borderRadius: 999,
  transition: "box-shadow 0.2s ease",
}));

const useStyles = makeStyles((theme: Theme) => ({
  themeType: {
    backgroundColor: theme.palette.green[100],
  },
  organizationType: {
    backgroundColor: theme.palette.blue[100],
  },
  termsetType: {
    backgroundColor: theme.palette.cobalt[50],
  },
  unknownType: {
    backgroundColor: theme.palette.cobalt[50],
  },
  dimensionType: {
    backgroundColor: theme.palette.yellow[100],
  },
  draftType: {},
  clickable: {
    cursor: "pointer",
    "&:hover": {
      boxShadow: theme.shadows[2],
    },
  },
}));

const Tag = forwardRef<
  HTMLParagraphElement,
  {
    children: ReactNode;
    type?: TagType;
  } & TypographyProps & {
      component?: BoxProps["component"];
    }
>(({ children, type = "unknown", ...props }, ref) => {
  const classes = useStyles();

  return (
    <TagTypography
      ref={ref}
      variant="caption"
      {...props}
      className={clsx(
        props.className,
        classes[`${type}Type` as const],
        props.onClick ? classes.clickable : null
      )}
    >
      {children}
    </TagTypography>
  );
});

export default Tag;
