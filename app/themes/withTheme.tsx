import { ThemeProvider } from "theme-ui";
import { theme } from "./federal";

interface Props {}
const withTheme =
  <T extends Props>(Component: React.ComponentType<Props>) =>
  (props: T) => {
    return (
      <ThemeProvider theme={theme}>
        <Component {...props} />
      </ThemeProvider>
    );
  };

export default withTheme;
