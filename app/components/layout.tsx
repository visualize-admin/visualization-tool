import { Flex } from "@theme-ui/components";
import { ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";

export const AppLayout = ({ children }: { children?: ReactNode }) => (
  <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
    <Header pageType="app" />
    <Flex
      as="main"
      role="main"
      sx={{ flex: 1, flexDirection: "column" }}
      bg="muted"
    >
      {children}
    </Flex>
  </Flex>
);

export const ContentLayout = ({
  isHome = false,
  children,
  contentId
}: {
  isHome?: boolean;
  children?: ReactNode;
  [k: string]: unknown;
}) => {
  return (
    <Flex
      sx={{
        minHeight: "100vh",
        flexDirection: "column",
        bg: "monochrome100"
      }}
    >
      <Header
        pageType="content"
        contentId={typeof contentId === "string" ? contentId : undefined}
      />
      <Flex
        as="main"
        role="main"
        sx={{
          flexDirection: "column",
          flex: 1,
          maxWidth: isHome ? undefined : 1024,
          mx: isHome ? undefined : [0, 0, "auto"],
          px: isHome ? undefined : 4
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
