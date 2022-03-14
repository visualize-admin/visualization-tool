import { Typography } from "@mui/material";
import { ReactNode } from "react";

export const HomepageSection = ({ children }: { children: ReactNode }) => (
  <Typography
    component="h2"
    sx={{
      fontFamily: "body",
      lineHeight: [7, 8, 8],
      fontWeight: "light",
      fontSize: [6, 7, 7],
      color: "monochrome800",
      mb: 6,
      textAlign: "center",
    }}
  >
    {children}
  </Typography>
);
