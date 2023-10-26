import { BoxProps, Typography, TypographyProps, styled } from "@mui/material";
import React from "react";

type TagType = "draft" | "theme" | "organization";

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
  "&:hover": {
    boxShadow: theme.shadows[2],
  },
}));

const Tag = React.forwardRef<
  unknown,
  {
    children: React.ReactNode;
    type: TagType;
  } & TypographyProps & {
      component?: BoxProps["component"];
    }
>(({ children, type, ...props }, ref) => {
  const { sx } = props;

  return (
    <TagTypography
      // @ts-ignore
      ref={ref}
      variant="caption"
      {...props}
      sx={{
        backgroundColor: type === "theme" ? "success.light" : "primary.light",
        ...sx,
      }}
    >
      {children}
    </TagTypography>
  );
});

export default Tag;
