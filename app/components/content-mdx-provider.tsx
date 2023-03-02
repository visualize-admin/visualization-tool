import { MDXProvider } from "@mdx-js/react";
import { Box } from "@mui/material";
import { ReactNode } from "react";

import { ContentLayout, StaticContentLayout } from "@/components/layout";
import { Intro, Tutorial, Examples, Contribute } from "@/homepage";

const castContentId = (contentId: unknown) => {
  if (typeof contentId === "string") {
    return contentId;
  }
  return undefined;
};

const Wrapper = ({
  contentId,
  children,
}: {
  contentId: unknown;
  children: ReactNode;
}) => {
  return contentId === "home" ? (
    <ContentLayout contentId={contentId}>{children}</ContentLayout>
  ) : (
    <StaticContentLayout contentId={castContentId(contentId)}>
      {children}
    </StaticContentLayout>
  );
};

const defaultMDXComponents = {
  wrapper: Wrapper,
  // p: (props: $FixMe) => <p {...props} style={{ color: "red" }} />,
  Box,
  Intro,
  Tutorial,
  Examples,
  Contribute,
};

export const ContentMDXProvider = ({ children }: { children: ReactNode }) => {
  return (
    <MDXProvider components={defaultMDXComponents}>{children}</MDXProvider>
  );
};
