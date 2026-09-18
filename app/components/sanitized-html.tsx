import { sanitizeUrl } from "@braintree/sanitize-url";
import { Box, BoxProps } from "@mui/material";
import { fromHtml } from "hast-util-from-html";
import { sanitize, Schema } from "hast-util-sanitize";
import { Components, toJsxRuntime } from "hast-util-to-jsx-runtime";
import { useMemo } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

import { inlineTextSchema } from "@/components/sanitize-schema";

const components: Partial<Components> = {
  a: ({ children, href, ...props }) => {
    // The schema already restricts the allowed protocols; sanitizing the URL
    // again keeps the guarantee even if a caller passes a laxer schema.
    const safeHref = href ? sanitizeUrl(href) : undefined;

    return safeHref && safeHref !== "about:blank" ? (
      <a {...props} href={safeHref} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <>{children}</>
    );
  },
};

/**
 * Renders HTML that we do not control (remote cube metadata, capabilities
 * documents fetched from third-party endpoints) as React elements, keeping the
 * formatting but dropping everything that is not in `schema`.
 *
 * Prefer this over `dangerouslySetInnerHTML`, so that sanitization happens in a
 * single place. Remaining props are forwarded to the wrapping `Box`.
 */
export const SanitizedHtml = ({
  html,
  schema = inlineTextSchema,
  ...boxProps
}: {
  html: string;
  schema?: Schema;
} & BoxProps) => {
  const content = useMemo(() => {
    return toJsxRuntime(sanitize(fromHtml(html, { fragment: true }), schema), {
      Fragment,
      jsx,
      jsxs,
      components,
    });
  }, [html, schema]);

  return <Box {...boxProps}>{content}</Box>;
};
