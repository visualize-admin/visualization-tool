import { Typography, TypographyProps, styled, BoxProps } from "@mui/material";
import React, { ReactNode } from "react";

import { DataCubeOrganization, DataCubeTheme } from "@/graphql/resolver-types";

type TagType =
  | "draft"
  | DataCubeTheme["__typename"]
  | DataCubeOrganization["__typename"];

const TagTypography = styled(Typography)(({ theme }) => ({
  borderRadius: (theme.shape.borderRadius as number) * 1.5,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  minHeight: 24,
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  color: "grey.700",
  boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
  transition: "box-shadow ease 0.125s",
  "&:hover": {
    boxShadow: theme.shadows[2],
  },
}));

const Tag = ({
  children,
  type,
  ...props
}: { children: ReactNode; type: TagType } & TypographyProps & {
    component?: BoxProps["component"];
  }) => {
  const { sx } = props;
  return (
    <TagTypography
      variant="caption"
      {...props}
      sx={{
        backgroundColor:
          type === "DataCubeTheme" ? "success.light" : "primary.light",
        ...sx,
      }}
    >
      {children}
    </TagTypography>
  );
};

export default Tag;
