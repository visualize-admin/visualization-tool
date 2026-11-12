import { CSSObject } from "@mui/material/styles";

import { FOCUS_OUTLINE_COLOR_VAR } from "@/federal-ci/components/common";
import { c } from "@/federal-ci/theme";

export const FOCUS_VISIBLE = "&:focus-visible, &:has(> input:focus-visible)";

export const FOCUS_VISIBLE_WITHIN_FIELD =
  "&:has(input:focus-visible, textarea:focus-visible, [role=combobox]:focus-visible)";

export const INSET_FOCUS_ROLE_SELECTOR = [
  "tab",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "treeitem",
]
  .map((role) => `[role="${role}"]`)
  .join(", ");

export const FOCUS_OUTLINE_COLOR = c.purple[500];

export const FOCUS_OUTLINE_ROOM = 4;

// For SVG foreignObject content, which theme overrides can't target.
export const INSET_FOCUS_OUTLINE_CLASS_NAME = "inset-focus-outline";

export const FOCUS_OUTLINE_ON_FILL_CLASS_NAME = "focus-outline-on-fill";

export const FORCED_COLORS_SELECTED = {
  forcedColorAdjust: "none",
  backgroundColor: "Highlight",
  color: "HighlightText",
} satisfies CSSObject;

export const FOCUS_OUTLINE = {
  outline: `2px solid var(${FOCUS_OUTLINE_COLOR_VAR}, ${FOCUS_OUTLINE_COLOR})`,
  outlineOffset: 2,
} satisfies CSSObject;

// For containers that clip overflow to truncate text.
export const UNCLIP_FOCUS_OUTLINE = {
  "&:has(:focus-visible)": {
    overflow: "visible",
  },
} satisfies CSSObject;

export const FOCUS_OUTLINE_INSET = {
  ...FOCUS_OUTLINE,
  outlineOffset: -2,
} satisfies CSSObject;
