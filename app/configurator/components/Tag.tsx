import React, { ReactNode } from "react";
import { Typography, TypographyProps, styled } from "@mui/material";
import {
  DataCubeOrganization,
  DataCubeTheme,
} from "../../graphql/resolver-types";

type TagType =
  | "draft"
  | DataCubeTheme["__typename"]
  | DataCubeOrganization["__typename"];

const TagTypography = styled(Typography)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
}));

const Tag = ({
  children,
  type,
  ...props
}: { children: ReactNode; type: TagType } & TypographyProps) => {
  const { sx } = props;
  return (
    <TagTypography
      variant="body2"
      {...props}
      sx={{
        backgroundColor:
          type === "DataCubeTheme" ? "success.light" : "primary.light",
        px: 2,
        width: "fit-content",
        borderRadius: 1.5,
        color: "grey.700",
        "&:hover": {
          boxShadow: "primary",
        },
        ...sx,
      }}
    >
      {children}
    </TagTypography>
  );
};

export default Tag;
