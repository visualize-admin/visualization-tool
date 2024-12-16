import { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

const components: ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: ({ children }) => <h1 style={{ marginTop: 0 }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ marginTop: 0 }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ marginTop: 0 }}>{children}</h3>,
  h4: ({ children }) => <h4 style={{ marginTop: 0 }}>{children}</h4>,
  h5: ({ children }) => <h5 style={{ marginTop: 0 }}>{children}</h5>,
  h6: ({ children }) => <h6 style={{ marginTop: 0 }}>{children}</h6>,
  p: ({ children }) => <p style={{ marginTop: 0 }}>{children}</p>,
  a: ({ children }) => <a style={{ marginTop: 0 }}>{children}</a>,
};

export const Markdown = (
  props: Omit<ComponentProps<typeof ReactMarkdown>, "components">
) => {
  return (
    <ReactMarkdown
      components={components}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      {...props}
    />
  );
};
