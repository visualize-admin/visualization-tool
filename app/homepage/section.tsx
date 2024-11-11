import { Box } from "@mui/material";

import Flex from "@/components/flex";

export const Section = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{ backgroundColor: "primary.main", color: "grey.100", width: "100%" }}
    >
      <Box sx={{ maxWidth: 1024, margin: "0 auto", width: "100%" }}>
        <Flex
          sx={{
            flexDirection: ["column", "row", "row"],
            gap: 6,
            px: 4,
            py: [6, 6, 7],
            width: "100%",
          }}
        >
          {children}
        </Flex>
      </Box>
    </Box>
  );
};
