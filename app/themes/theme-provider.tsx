import { Theme, ThemeProvider as MUIThemeProvider } from "@mui/material";
import { createContext, FC, useCallback, useContext, useState } from "react";

const ThemeContext = createContext<{
  name: string;
  options: Record<string, Theme>;
  setTheme: (name: string) => void;
} | null>(null);

export const ThemeProvider: FC<{
  themes: Record<string, Theme>;
  children: React.ReactNode;
}> = ({ themes, children }) => {
  const [current, setTheme] = useState<{
    name: string;
    theme: Theme;
  }>({
    name: Object.keys(themes)[0],
    theme: Object.values(themes)[0],
  });

  const handleSetTheme = useCallback(
    (name: string) => {
      if (!themes[name]) {
        throw new Error(`Theme '${name}' not found`);
      }
      setTheme({
        name,
        theme: themes[name],
      });
    },
    [themes]
  );
  return (
    <ThemeContext.Provider
      value={{
        name: current.name,
        options: themes,
        setTheme: handleSetTheme,
      }}
    >
      <MUIThemeProvider theme={current.theme}>{children}</MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeSetter must be used within a ThemeProvider");
  }
  return context;
};
