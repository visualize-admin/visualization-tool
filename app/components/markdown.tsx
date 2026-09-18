import clsx from "clsx";
import { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import classes from "@/components/markdown.module.css";
import { richTextSchema } from "@/components/sanitize-schema";
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
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(className, classes.common)}
      style={{ ...style, color: palette.primary.main }}
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
      {...props}
      components={components}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeSanitize, richTextSchema]]}
    />
  );
};

export const InlineMarkdown = ({
  children,
  ...rest
}: Omit<ComponentProps<typeof ReactMarkdown>, "components">) => {
  const inlineMarkdown = children?.replace(/\r?\n|\r/g, " ");

  return (
    <ReactMarkdown
      {...rest}
      components={{
        p: ({ children }) => <>{children}</>,
        strong: ({ children }) => <strong>{children}</strong>,
        em: ({ children }) => <em>{children}</em>,
        a: ({ children, href }) => {
          const safeHref =
            href && /^(https?|mailto|ircs?):/i.test(href) ? href : undefined;
          return <a href={safeHref}>{children}</a>;
        },
        h1: () => null,
        h2: () => null,
        h3: () => null,
        h4: () => null,
        h5: () => null,
        h6: () => null,
        ul: () => null,
        li: () => null,
        blockquote: () => null,
        code: ({ children }) => <code>{children}</code>,
        br: () => <> </>,
      }}
      rehypePlugins={[[rehypeSanitize, richTextSchema]]}
      skipHtml
    >
      {inlineMarkdown}
    </ReactMarkdown>
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
      {...props}
      className={clsx(className, classes.common, classes.inheritFonts)}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...style, color: palette.primary.main }}
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
      {...props}
      components={componentsInheritFonts}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeSanitize, richTextSchema]]}
    />
  );
};
