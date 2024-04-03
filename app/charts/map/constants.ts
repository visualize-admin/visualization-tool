import { schemeCategory10 } from "d3-scale-chromatic";

import { FixedColorField } from "@/config-types";

export const DEFAULT_FIXED_COLOR_FIELD: FixedColorField = {
  type: "fixed",
  value: schemeCategory10[0],
  opacity: 80,
};

export const DEFAULT_COLOR = [222, 222, 222, 125];

export const FLY_TO_DURATION = 500;

export const RESET_DURATION = 1500;
