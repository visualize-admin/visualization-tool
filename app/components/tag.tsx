import { BoxProps, styled, Typography, TypographyProps } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import React, { forwardRef } from "react";

type TagType = "draft" | "theme" | "organization" | "termset" | "dimension";

const TagTypography = styled(Typography)(({ theme }) => ({
  borderRadius: (theme.shape.borderRadius as number) * 1.5,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  minHeight: 24,
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  color: "grey.700",
  transition: "box-shadow ease 0.125s",
}));

const useStyles = makeStyles((theme: Theme) => ({
  themeType: {
    backgroundColor: theme.palette.success.light,
  },
  dimensionType: {
    backgroundColor: theme.palette.warning.light,
  },
  termsetType: {
    backgroundColor: theme.palette.grey[200],
  },
  organizationType: {
    backgroundColor: theme.palette.primary.light,
  },
  draftType: {},
  clickable: {
    "&:hover": {
      boxShadow: theme.shadows[2],
    },
  },
}));

const Tag = forwardRef<
  unknown,
  {
    children: React.ReactNode;
    type: TagType;
  } & TypographyProps & {
      component?: BoxProps["component"];
    }
>(({ children, type, ...props }, ref) => {
  const classes = useStyles();
  const { sx } = props;
  return (
    <TagTypography
      // @ts-ignore
      ref={ref}
      variant="caption"
      {...props}
      className={clsx(
        props.className,
        classes[`${type}Type` as const],
        props.onClick ? classes.clickable : null
      )}
      sx={sx}
    >
      {children}
    </TagTypography>
  );
});

export default Tag;
