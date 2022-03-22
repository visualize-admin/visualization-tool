import { MDXProvider } from "@mdx-js/react";
import { ContentLayout, StaticContentLayout } from "./layout";
import { Intro, Tutorial, Examples, Contribute } from "../homepage";
import { Box } from "@mui/material";
import { ReactNode } from "react";

const Wrapper = ({
  contentId,
  children,
}: {
  contentId: unknown;
  children: ReactNode;
}) => {
  if (typeof contentId !== "string") {
    return <StaticContentLayout>{children}</StaticContentLayout>;
  }
  return contentId === "home" ? (
    <ContentLayout contentId={contentId}>{children}</ContentLayout>
  ) : (
    <StaticContentLayout contentId={contentId}>{children}</StaticContentLayout>
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
