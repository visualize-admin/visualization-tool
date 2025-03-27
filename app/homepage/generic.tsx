import { Typography } from "@mui/material";
import { ReactNode } from "react";

export const HomepageSectionTitle = ({ children }: { children: ReactNode }) => (
  <Typography variant="h2" sx={{ mb: 8, fontWeight: "bold" }}>
    {children}
  </Typography>
);
