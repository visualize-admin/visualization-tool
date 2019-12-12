import { MDXProvider } from "@mdx-js/react";
import { AppLayout } from "./layout";

const defaultMDXComponents = {
  wrapper: AppLayout,
  p: (props: $FixMe) => <p {...props} style={{ color: "red" }} />
};

export const ContentMDXProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <MDXProvider components={defaultMDXComponents}>{children}</MDXProvider>
  );
};
