import { ReactNode } from "react";
import { Flex } from "rebass";
import { Header } from "./header";
import { Footer } from "./footer";

export const AppLayout = ({ children }: { children?: ReactNode }) => (
  <Flex flexDirection="column" sx={{ minHeight: "100vh" }}>
    <Header pageType="app" />
    <Flex as="main" role="main" flex={1} flexDirection="column" bg="muted">
      {children}
    </Flex>
  </Flex>
);
export const ContentLayout = ({
  homepage = true,
  children
}: {
  homepage?: boolean;
  children?: ReactNode;
}) => (
  <Flex
    flexDirection="column"
    sx={{ minHeight: "100vh", bg: homepage ? "monochrome.100" : "muted" }}
  >
    <Header pageType="content" />
    <Flex as="main" role="main" flex={1} flexDirection="column">
      {children}
    </Flex>
    <Footer />
  </Flex>
);

export const Center = ({ children }: { children?: ReactNode }) => (
  <Flex flex={1} justifyContent="center" alignItems="center">
    {children}
  </Flex>
);
