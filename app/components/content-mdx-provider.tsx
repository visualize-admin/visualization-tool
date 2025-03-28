import { MDXProvider } from "@mdx-js/react";
import { ReactNode } from "react";

import { ContentLayout, StaticContentLayout } from "@/components/layout";
import { Actions, Examples, Intro, Tutorial } from "@/homepage";

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
  Actions,
  Intro,
  Tutorial,
  Examples,
};

export const ContentMDXProvider = ({ children }: { children: ReactNode }) => {
  return (
    <MDXProvider components={defaultMDXComponents}>{children}</MDXProvider>
  );
};
