import { Box } from "theme-ui";
import { hcl } from "d3-color";
import * as React from "react";
import { ReactNode } from "react";

export const Tag = ({
  tagColor,
  small = false,
  children,
}: {
  tagColor: string;
  small?: boolean;
  children: ReactNode;
}) => (
  <Box
    as="span"
    sx={{
      bg: tagColor,
      color: hcl(tagColor).l < 55 ? "#fff" : "#000",
      borderRadius: "15px",
      px: 2,
      py: small ? "0.125rem" : 1,
      my: small ? 0 : 1,
    }}
  >
    {children}
  </Box>
);
