import { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

const components: ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: ({ children, style, ...props }) => (
    <h1 style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, style, ...props }) => (
    <h2 style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, style, ...props }) => (
    <h3 style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, style, ...props }) => (
    <h4 style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, style, ...props }) => (
    <h5 style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, style, ...props }) => (
    <h6 style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </h6>
  ),
  p: ({ children, style, ...props }) => (
    <p style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </p>
  ),
  a: ({ children, style, ...props }) => (
    <a target="_blank" style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </a>
  ),
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

const componentsInheritFonts: ComponentProps<
  typeof ReactMarkdown
>["components"] = {
  h1: ({ children, style, ...props }) => (
    <h1
      style={{
        ...style,
        marginTop: 0,
        fontSize: "inherit",
        fontWeight: "inherit",
      }}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, style, ...props }) => (
    <h2
      style={{
        ...style,
        marginTop: 0,
        fontSize: "inherit",
        fontWeight: "inherit",
      }}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, style, ...props }) => (
    <h3
      style={{
        ...style,
        marginTop: 0,
        fontSize: "inherit",
        fontWeight: "inherit",
      }}
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, style, ...props }) => (
    <h4
      style={{
        ...style,
        marginTop: 0,
        fontSize: "inherit",
        fontWeight: "inherit",
      }}
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, style, ...props }) => (
    <h5
      style={{
        ...style,
        marginTop: 0,
        fontSize: "inherit",
        fontWeight: "inherit",
      }}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, style, ...props }) => (
    <h6
      style={{
        ...style,
        marginTop: 0,
        fontSize: "inherit",
        fontWeight: "inherit",
      }}
      {...props}
    >
      {children}
    </h6>
  ),
  p: ({ children, style, ...props }) => (
    <p
      style={{
        ...style,
        marginTop: 0,
        fontSize: "inherit",
        fontWeight: "inherit",
      }}
      {...props}
    >
      {children}
    </p>
  ),
  a: ({ children, style, ...props }) => (
    <a
      target="_blank"
      style={{
        ...style,
        marginTop: 0,
        fontSize: "inherit",
        fontWeight: "inherit",
      }}
      {...props}
    >
      {children}
    </a>
  ),
};

export const MarkdownInheritFonts = (
  props: Omit<ComponentProps<typeof ReactMarkdown>, "components">
) => {
  return (
    <ReactMarkdown
      components={componentsInheritFonts}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      {...props}
    />
  );
};
