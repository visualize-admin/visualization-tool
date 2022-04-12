import { Typography } from "@mui/material";
import { ReactNode } from "react";

export const HomepageSection = ({ children }: { children: ReactNode }) => (
  <Typography
    variant="h2"
    sx={{
      color: "grey.800",
      mb: 6,
      textAlign: "center",
    }}
  >
    {children}
  </Typography>
);
