import { CSSObject } from "@mui/material/styles";

import { c } from "@/federal-ci/theme";

export const TRANSITION_DURATION = 350;

export const FOCUS_OUTLINE_COLOR_VAR = "--focus-outline-color";

export const FOCUS_OUTLINE_COLOR_ON_DARK_SURFACE = c.purple[300];

export const FOCUS_OUTLINE_ON_DARK_SURFACE = {
  [FOCUS_OUTLINE_COLOR_VAR]: FOCUS_OUTLINE_COLOR_ON_DARK_SURFACE,
} satisfies CSSObject;
