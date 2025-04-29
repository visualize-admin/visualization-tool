import clsx from "clsx";
import { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import classes from "@/components/markdown.module.css";
import { palette } from "@/themes/palette";

const components: ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: ({ children, className, ...props }) => (
    <h1 className={clsx(className, classes.common)} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }) => (
    <h2 className={clsx(className, classes.common)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }) => (
    <h3 className={clsx(className, classes.common)} {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, className, ...props }) => (
    <h4 className={clsx(className, classes.common)} {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, className, ...props }) => (
    <h5 className={clsx(className, classes.common)} {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, className, ...props }) => (
    <h6 className={clsx(className, classes.common)} {...props}>
      {children}
    </h6>
  ),
  p: ({ children, className, ...props }) => (
    <p className={clsx(className, classes.common)} {...props}>
      {children}
    </p>
  ),
  a: ({ children, className, style, ...props }) => (
    <a
      target="_blank"
      className={clsx(className, classes.common)}
      style={{ ...style, color: palette.primary.main }}
      {...props}
    >
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
  h1: ({ children, className, ...props }) => (
    <h1
      className={clsx(className, classes.common, classes.inheritFonts)}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }) => (
    <h2
      className={clsx(className, classes.common, classes.inheritFonts)}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }) => (
    <h3
      className={clsx(className, classes.common, classes.inheritFonts)}
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, className, ...props }) => (
    <h4
      className={clsx(className, classes.common, classes.inheritFonts)}
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, className, ...props }) => (
    <h5
      className={clsx(className, classes.common, classes.inheritFonts)}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, className, ...props }) => (
    <h6
      className={clsx(className, classes.common, classes.inheritFonts)}
      {...props}
    >
      {children}
    </h6>
  ),
  p: ({ children, className, ...props }) => (
    <p
      className={clsx(className, classes.common, classes.inheritFonts)}
      {...props}
    >
      {children}
    </p>
  ),
  a: ({ children, className, style, ...props }) => (
    <a
      className={clsx(className, classes.common, classes.inheritFonts)}
      target="_blank"
      style={{ ...style, color: palette.primary.main }}
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
