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
        bg: contentId === "home" ? "monochrome100" : "muted",
      }}
    >
      <Header pageType="content" contentId={contentId} />
      <Flex
        as="main"
        role="main"
        sx={{
          flexDirection: "column",
          flex: 1,
          width: "100%",
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
  contentId?: string;
}) => {
  return (
    <Flex
      sx={{
        minHeight: "100vh",
        flexDirection: "column",
        bg: "monochrome100",
      }}
    >
      <Header pageType="content" contentId={contentId} />
      <Flex
        as="main"
        role="main"
        sx={{
          flexDirection: "column",
          flex: 1,
          width: "100%",
          maxWidth: 1024,
          mx: [0, 0, "auto"],
          px: 4,
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
