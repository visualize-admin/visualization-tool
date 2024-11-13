import { MDXProvider } from "@mdx-js/react";
import { Box } from "@mui/material";
import { ReactNode } from "react";

import { ContentLayout, StaticContentLayout } from "@/components/layout";
import {
  BugReport,
  Contribute,
  Examples,
  Intro,
  Newsletter,
  Tutorial,
} from "@/homepage";
import { FeatureRequest } from "@/homepage/feature-request";
import { Section } from "@/homepage/section";

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
  Box,
  Intro,
  Tutorial,
  Examples,
  Contribute,
  Newsletter,
  BugReport,
  Section,
  FeatureRequest,
};

export const ContentMDXProvider = ({ children }: { children: ReactNode }) => {
  return (
    <MDXProvider components={defaultMDXComponents}>{children}</MDXProvider>
  );
};
