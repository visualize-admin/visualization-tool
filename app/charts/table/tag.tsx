import { Box } from "@mui/material";
import { hcl } from "d3";
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
    component="span"
    sx={{
      backgroundColor: tagColor,
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
