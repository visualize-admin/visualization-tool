import { ReactNode } from "react";
import { Footer } from "./footer";
import { Header, HeaderProgressProvider } from "./header";
import Flex from "./flex";
export const AppLayout = ({ children }: { children?: ReactNode }) => (
  <Flex sx={{ minHeight: "100vh", flexDirection: "column" }}>
    <HeaderProgressProvider>
      <Flex
        component="main"
        role="main"
        sx={{ flex: 1, flexDirection: "column", backgroundColor: "muted.main" }}
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
        backgroundColor: contentId === "home" ? "grey.100" : "muted",
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
        backgroundColor: "grey.100",
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
