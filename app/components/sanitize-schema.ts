import { defaultSchema, Schema } from "hast-util-sanitize";

/**
 * Allowlists used to sanitize HTML that we do not control, either because it
 * comes from remote cube metadata or because it is fetched at runtime from a
 * third-party endpoint configured in the chart.
 *
 * They all extend `defaultSchema`, which already restricts the protocols
 * allowed in `href`/`src` (so e.g. `javascript:` URLs are dropped) and prefixes
 * `id`/`name` attributes to avoid DOM clobbering.
 */

/** Formatting we allow in markdown-authored rich text (see `@/components/markdown`). */
export const richTextSchema: Schema = {
  ...defaultSchema,
  tagNames: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "strong",
    "em",
    "ins",
    "del",
    "s",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "br",
    "hr",
    "a",
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ["href", "title"],
    "*": defaultSchema.attributes?.["*"] ?? [],
  },
};

/**
 * Inline formatting, for short snippets rendered inside a single line or
 * tooltip (WMS/WMTS layer abstracts, `dcterms:publisher` literals).
 */
export const inlineTextSchema: Schema = {
  ...defaultSchema,
  tagNames: [
    "a",
    "b",
    "strong",
    "i",
    "em",
    "u",
    "s",
    "br",
    "p",
    "ul",
    "ol",
    "li",
    "code",
    "sub",
    "sup",
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ["href", "title"],
    "*": defaultSchema.attributes?.["*"] ?? [],
  },
};

/**
 * Search hit highlighting, where `<b>` is the only tag `highlight` emits (see
 * `@/rdf/query-search-score-utils`).
 */
export const boldOnlySchema: Schema = {
  ...defaultSchema,
  tagNames: ["b"],
  attributes: {},
};
