import React, { ReactNode } from "react";
import { Text, TextProps } from "theme-ui";
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
    <Text
      variant="paragraph2"
      {...props}
      sx={{
        bg:
          type === "DataCubeTheme" || type == "draft"
            ? "successLight"
            : "primaryLight",
        mt: 2,
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
    </Text>
  );
};

export default Tag;
