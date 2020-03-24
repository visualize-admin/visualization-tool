import { ReactNode } from "react";
import { Flex } from "@theme-ui/components";
import { Header } from "./header";
import { Footer } from "./footer";

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
  homepage = true,
  children,
  ...extraProps
}: {
  homepage?: boolean;
  children?: ReactNode;
  [k: string]: $IntentionalAny;
}) => {
  return (
    <Flex
      sx={{
        minHeight: "100vh",
        flexDirection: "column",
        bg: homepage ? "monochrome100" : "muted"
      }}
    >
      <Header pageType="content" alternates={extraProps?.meta?.alternates} />
      <Flex as="main" role="main" sx={{ flexDirection: "column", flex: 1 }}>
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
