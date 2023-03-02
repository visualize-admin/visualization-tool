import { ReactNode } from "react";

import Flex from "@/components/flex";
import { Footer } from "@/components/footer";
import { Header, HeaderProgressProvider } from "@/components/header";

export const AppLayout = ({ children }: { children?: ReactNode }) => (
  <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
    <HeaderProgressProvider>
      <Header pageType="app" contentId={undefined} />
      <Flex
        component="main"
        role="main"
        sx={{ flex: 1, flexDirection: "column" }}
      >
        {children}
      </Flex>
    </HeaderProgressProvider>
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
        backgroundColor: contentId === "home" ? "grey.100" : "muted.main",
      }}
    >
      <Header pageType="content" contentId={contentId} />
      <Flex
        component="main"
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

export const StaticContentLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <Flex
      sx={{
        minHeight: "100vh",
        flexDirection: "column",
        backgroundColor: "grey.100",
      }}
    >
      <Header pageType="content" />
      <Flex
        component="main"
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
