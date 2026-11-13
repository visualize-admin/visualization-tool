import { ReactNode } from "react";

import { Flex } from "@/components/flex";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MAIN_CONTENT_ID } from "@/components/skip-link";

const MAIN_PROPS = { id: MAIN_CONTENT_ID, tabIndex: -1 };

const MAIN_SX = { "&:focus": { outline: "none" } };

export const AppLayout = ({
  children,
  hideHeader,
  editing,
}: {
  children?: ReactNode;
  hideHeader?: boolean;
  editing?: boolean;
}) => {
  return (
    <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
      {hideHeader ? null : <Header hideLogo={editing} extendTopBar={editing} />}
      <Flex
        component="main"
        role="main"
        {...MAIN_PROPS}
        sx={{ flex: 1, flexDirection: "column", ...MAIN_SX }}
      >
        {children}
      </Flex>
    </Flex>
  );
};

export const ContentLayout = ({
  children,
  contentId,
}: {
  children?: ReactNode;
  contentId?: string;
}) => {
  return (
    <Flex
      sx={{
        minHeight: "100vh",
        flexDirection: "column",
        backgroundColor: "monochrome.100",
      }}
    >
      <Header contentId={contentId} />
      <Flex
        component="main"
        role="main"
        {...MAIN_PROPS}
        sx={{
          flexDirection: "column",
          flex: 1,
          width: "100%",
          ...MAIN_SX,
        }}
      >
        {children}
      </Flex>
      <Footer />
    </Flex>
  );
};

export const StaticContentLayout = ({
  children,
  contentId,
}: {
  children?: ReactNode;
  contentId: string | undefined;
}) => {
  return (
    <Flex
      sx={{
        minHeight: "100vh",
        flexDirection: "column",
        backgroundColor: "monochrome.100",
      }}
    >
      <Header contentId={contentId} />
      <Flex
        component="main"
        role="main"
        {...MAIN_PROPS}
        sx={{
          ...MAIN_SX,
          flexDirection: "column",
          flex: 1,
          width: "100%",
          maxWidth: 1024,
          my: [4, 6],
          mx: [0, 0, "auto"],
          px: 4,

          "& h2": {
            mb: 1,
          },
        }}
      >
        {children}
      </Flex>
      <Footer />
    </Flex>
  );
};

export const Center = ({ children }: { children?: ReactNode }) => (
  <Flex sx={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
    {children}
  </Flex>
);
