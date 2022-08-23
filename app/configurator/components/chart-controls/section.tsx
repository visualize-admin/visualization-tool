import {
  Box,
  BoxProps,
  Skeleton,
  Typography,
  TypographyProps,
} from "@mui/material";
import { ElementType, forwardRef, HTMLProps, ReactNode } from "react";

import { Icon, IconName } from "@/icons";
import { useTheme } from "@/themes";

export const ControlSection = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    isHighlighted?: boolean;
    sx?: BoxProps["sx"];
  } & Omit<HTMLProps<HTMLDivElement>, "ref">
>(({ role, children, isHighlighted, sx, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      role={role}
      sx={{
        borderTopColor: "grey.500",
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        overflowX: "hidden",
        overflowY: "auto",
        backgroundColor: isHighlighted ? "primaryLight" : "grey.100",
        flexShrink: 0,
        "&:first-of-type": {
          borderTopWidth: 0,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
});

export const ControlSectionContent = ({
  component,
  role,
  ariaLabelledBy,
  children,
  gap = "default",
  px,
  sx,
}: {
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
}) => {
  return (
    <Box
      component={component}
      role={role}
      aria-labelledby={ariaLabelledBy}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: gap === "large" ? 3 : gap === "default" ? 2 : 0,
        px: px === "small" ? 2 : 4,
        pb: 4,
        ...sx,
      }}
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
