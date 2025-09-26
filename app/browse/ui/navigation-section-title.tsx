import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

export const NavigationSectionTitle = ({
  label,
  backgroundColor,
}: {
  label: ReactNode;
  backgroundColor: string;
}) => {
  return (
    <Box sx={{ mb: 2, px: 2, py: 3, borderRadius: "6px", backgroundColor }}>
      <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
    </Box>
  );
};
