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
}: { children: ReactNode; type: TagType } & TextProps) => {
  const { sx } = props;
  return (
    <Typography
      variant="paragraph2"
      {...props}
      sx={{
        bg: type === "DataCubeTheme" ? "successLight" : "primaryLight",
        px: 2,
        width: "fit-content",
        borderRadius: "default",
        color: "monochrome700",
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
