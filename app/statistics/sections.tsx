import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

export const SectionTitleWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 850,
        mx: "auto",
        py: 4,
        textWrap: "balance",
        textAlign: "center",
      }}
    >
      {children}
    </Box>
  );
};

export const SectionTitle = ({ title }: { title: string }) => {
  return (
    <Typography
      variant="h1"
      component="h2"
      sx={{ lineHeight: "1 !important", mb: 2 }}
    >
      {title}
    </Typography>
  );
};
