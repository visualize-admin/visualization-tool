import { Typography } from "@mui/material";
import { ReactNode } from "react";

export const HomepageSection = ({ children }: { children: ReactNode }) => (
  <Typography
    component="h2"
    sx={{
      lineHeight: [7, 8, 8],
      fontWeight: "light",
      fontSize: ["1.5rem", "2rem", "2rem"],
      color: "grey.800",
      mb: 6,
      textAlign: "center",
    }}
  >
    {children}
  </Typography>
);
