import { Box, Flex, Heading } from "rebass";
import { ReactNode } from "react";
import { ThemeProvider } from "emotion-theming";
import { Global, css } from "@emotion/core";
import preset from "@rebass/preset";

import { LanguageMenu } from "./language-menu";

const globalCss = css`
  @font-face {
    font-family: "FrutigerNeueBold";
    font-style: normal;
    font-weight: 700;
    src: url("../../static/fonts/FrutigerNeueW02-Bd.woff2") format("woff2"),
      url("../../static/fonts/FrutigerNeueW02-Bd.woff") format("woff");
  }
  @font-face {
    font-family: "FrutigerNeueRegular";
    font-style: normal;
    font-weight: 400;
    src: url("../../static/fonts/FrutigerNeueW02-Regular.woff2") format("woff2"),
      url("../../static/fonts/FrutigerNeueW02-Regular.woff") format("woff");
  }
  @font-face {
    font-family: "FrutigerNeueLight";
    font-style: normal;
    font-weight: 300;
    src: url("../../static/fonts/FrutigerNeueW02-Light.woff2") format("woff2"),
      url("../../static/fonts/FrutigerNeueW02-Light.woff") format("woff");
  }
  @font-face {
    font-family: "FrutigerNeueItalic";
    font-style: italic;
    font-weight: 400;
    src: url("../../static/fonts/FrutigerNeueW02-It.woff2") format("woff2"),
      url("../../static/fonts/FrutigerNeueW02-It.woff") format("woff");
  }
  body {
    margin: 0;
    padding: 0;
    font-family: FrutigerNeueRegular, -apple-system, BlinkMacSystemFont,
      Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji,
      Segoe UI Symbol;
  }
`;

export const AppLayout = ({ children }: { children?: ReactNode }) => (
  <ThemeProvider theme={preset}>
    <Global styles={globalCss} />
    <Box p={2} bg="muted" color="secondary">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading fontSize={3}>Visualize</Heading>
        <LanguageMenu />
      </Flex>
    </Box>
    <Box p={2}>{children}</Box>
  </ThemeProvider>
);
