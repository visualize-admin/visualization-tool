import clsx from "clsx";
import { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import classes from "@/components/markdown.module.css";

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
  h1: ({ children, className, style, ...props }) => (
    <h1
      className={clsx(className, classes.inheritFonts)}
      style={{ ...style, marginTop: 0 }}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, className, style, ...props }) => (
    <h2
      className={clsx(className, classes.inheritFonts)}
      style={{ ...style, marginTop: 0 }}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, className, style, ...props }) => (
    <h3
      className={clsx(className, classes.inheritFonts)}
      style={{ ...style, marginTop: 0 }}
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, className, style, ...props }) => (
    <h4
      className={clsx(className, classes.inheritFonts)}
      style={{ ...style, marginTop: 0 }}
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, className, style, ...props }) => (
    <h5
      className={clsx(className, classes.inheritFonts)}
      style={{ ...style, marginTop: 0 }}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, className, style, ...props }) => (
    <h6
      className={clsx(className, classes.inheritFonts)}
      style={{ ...style, marginTop: 0 }}
      {...props}
    >
      {children}
    </h6>
  ),
  p: ({ children, className, style, ...props }) => (
    <p
      className={clsx(className, classes.inheritFonts)}
      style={{ ...style, marginTop: 0 }}
      {...props}
    >
      {children}
    </p>
  ),
  a: ({ children, className, style, ...props }) => (
    <a
      className={clsx(className, classes.inheritFonts)}
      target="_blank"
      style={{ ...style, marginTop: 0 }}
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
