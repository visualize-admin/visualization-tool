import type { Result, TagValue } from "axe-core";

export const WCAG_TAGS: TagValue[] = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
];

export const formatViolation = (violation: Result) => {
  const targets = violation.nodes.map((node) => node.target.join(" "));

  return `${violation.id}: ${violation.help} (${targets.join(", ")})`;
};
