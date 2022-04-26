import {
  Box,
  BoxProps,
  Skeleton,
  Typography,
  TypographyProps,
} from "@mui/material";
import { ElementType, forwardRef, ReactNode } from "react";

import { Icon, IconName } from "@/icons";
import { useTheme } from "@/themes";

export const ControlSection = forwardRef<
  HTMLDivElement,
  {
    role?: string;
    children: ReactNode;
    isHighlighted?: boolean;
    sx?: BoxProps["sx"];
  }
>(({ role, children, isHighlighted, sx }, ref) => {
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
    >
      {children}
    </Box>
  );
});

export const ControlSectionContent = ({
  side,
  component,
  role,
  ariaLabelledBy,
  children,
  sx,
}: {
  side: "left" | "right";
  component?: ElementType;
  role?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
  sx?: BoxProps["sx"];
}) => {
  return (
    <Box
      component={component}
      role={role}
      aria-labelledby={ariaLabelledBy}
      sx={{ px: side === "left" ? 2 : 4, pb: 4, ...sx }}
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
        padding: `${theme.spacing(4)} ${theme.spacing(4)} ${theme.spacing(
          2
        )} ${theme.spacing(4)}`,
        display: "flex",
        alignItems: "center",
        width: "100%",
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
  <ControlSection sx={{ mt: 2, px: 2, ...sx }}>
    <ControlSectionContent side="left">
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
