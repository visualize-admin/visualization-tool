import React, { ReactNode } from "react";
import { Typography, TypographyProps } from "@mui/material";
import {
  DataCubeOrganization,
  DataCubeTheme,
} from "../../graphql/resolver-types";

type TagType =
  | "draft"
  | DataCubeTheme["__typename"]
  | DataCubeOrganization["__typename"];

const Tag = ({
  children,
  type,
  ...props
}: { children: ReactNode; type: TagType } & TypographyProps) => {
  const { sx } = props;
  return (
    <Typography
      variant="body2"
      {...props}
      sx={{
        backgroundColor: type === "DataCubeTheme" ? "successLight" : "primaryLight",
        px: 2,
        width: "fit-content",
        borderRadius: "default",
        color: "grey.700",
        textDecoration: "none",
        "&:hover": {
          boxShadow: "primary",
        },
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
};

export default Tag;
