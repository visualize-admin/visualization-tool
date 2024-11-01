import { Button, Typography } from "@mui/material";

import Flex from "@/components/flex";
import { useThemeMode } from "@/themes/theme-provider";

export const ThemeMenu = () => {
  const { name, setTheme, options } = useThemeMode();

  return (
    <Flex sx={{ alignItems: "center", gap: 1 }}>
      <Typography>Theme:</Typography>
      {Object.keys(options).map((themeName) => (
        <Button
          key={themeName}
          size="xsmall"
          variant={themeName === name ? "contained" : "outlined"}
          onClick={() => setTheme(themeName)}
        >
          {themeName}
        </Button>
      ))}
    </Flex>
  );
};
