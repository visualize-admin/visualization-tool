import {
  Box,
  BoxProps,
  Skeleton,
  Theme,
  Typography,
  TypographyProps,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { ElementType, forwardRef, HTMLProps, ReactNode } from "react";

import { Icon, IconName } from "@/icons";
import { useTheme } from "@/themes";

const useControlSectionStyles = makeStyles<Theme>((theme) => ({
  controlSection: {
    borderTopColor: theme.palette.grey[500],
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    overflowX: "hidden",
    overflowY: "auto",
    flexShrink: 0,
    "&:first-of-type": {
      borderTopWidth: 0,
    },
  },
}));

export const ControlSection = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    isHighlighted?: boolean;
    sx?: BoxProps["sx"];
  } & Omit<HTMLProps<HTMLDivElement>, "ref">
>(({ role, children, isHighlighted, sx, ...props }, ref) => {
  const classes = useControlSectionStyles();
  return (
    <Box
      ref={ref}
      role={role}
      data-testid="controlSection"
      sx={{
        backgroundColor: isHighlighted ? "primaryLight" : "grey.100",
        ...sx,
      }}
      {...props}
      className={clsx(classes.controlSection, props.className)}
    >
      {children}
    </Box>
  );
});

type ControlSectionContentProps = {
  component?: ElementType;
  role?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
  // large for specific purposes, e.g. base layer map options
  // default for right panel options
  // none for left panel options
  gap?: "large" | "default" | "none";
  px?: "small" | "default";
  sx?: BoxProps["sx"];
} & BoxProps;

const useControlSectionContentStyles = makeStyles<
  Theme,
  Pick<ControlSectionContentProps, "gap" | "px">
>((theme) => ({
  controlSectionContent: {
    display: "flex",
    flexDirection: "column",
    gap: ({ gap }) =>
      theme.spacing(gap === "large" ? 3 : gap === "default" ? 2 : 0),
    padding: ({ px }) =>
      `0 ${theme.spacing(px === "small" ? 2 : 4)} ${theme.spacing(4)}`,
  },
}));

export const ControlSectionContent = ({
  component,
  role,
  ariaLabelledBy,
  children,
  gap = "default",
  px,
  sx,
  ...props
}: ControlSectionContentProps) => {
  const classes = useControlSectionContentStyles({ gap, px });
  return (
    <Box
      component={component}
      role={role}
      aria-labelledby={ariaLabelledBy}
      {...props}
      className={classes.controlSectionContent}
      sx={sx}
    >
      {children}
    </Box>
  );
};

export const SectionTitle = ({
  color,
  iconName,
  titleId,
  disabled,
  children,
  sx,
}: {
  color?: string;
  iconName?: IconName;
  titleId?: string;
  disabled?: boolean;
  children: ReactNode;
  sx?: TypographyProps["sx"];
}) => {
  const theme = useTheme();
  return (
    <Typography
      variant="h5"
      id={titleId}
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        p: 4,
        pb: 2,
        border: "none",
        justifyContent: "flex-start",
        color: disabled ? "grey.600" : color ?? "grey.800",
        "& > svg:first-of-type": {
          marginRight: theme.spacing(2),
        },
        ...sx,
      }}
    >
      {iconName ? <Icon name={iconName} /> : null}
      {children}
    </Typography>
  );
};

export const ControlSectionSkeleton = ({
  sx,
}: {
  sx?: React.ComponentProps<typeof ControlSection>["sx"];
}) => (
  <ControlSection sx={{ mt: 2, ...sx }}>
    <ControlSectionContent px="small" gap="none">
      <Typography variant="h1">
        <Skeleton sx={{ bgcolor: "grey.300" }} />
      </Typography>{" "}
      <Skeleton
        sx={{ bgcolor: "grey.300" }}
        variant="rectangular"
        width="100%"
        height={118}
      />
    </ControlSectionContent>
  </ControlSection>
);
