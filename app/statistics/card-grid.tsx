import { Box } from "@mui/material";
import { ReactNode } from "react";

export const CardGrid = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: ["1fr", "1fr", "1fr 1fr"],
        gap: 4,
        my: [4, 6],
      }}
    >
      {children}
    </Box>
  );
};
