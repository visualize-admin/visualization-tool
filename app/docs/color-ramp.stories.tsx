import { Meta } from "@storybook/react";
import { interpolateBrBG, interpolateOranges } from "d3";

import { ColorRamp } from "@/configurator/components/chart-controls/color-ramp";

const meta: Meta = {
  component: ColorRamp,
  title: "components / ColorRamp",
};

export default meta;

export const Continuous = { args: { colorInterpolator: interpolateOranges } };
export const Discrete = {
  args: { colorInterpolator: interpolateOranges, nbClass: 5 },
};
export const Custom = {
  args: {
    colorInterpolator: interpolateBrBG,
    width: 100,
    height: 100,
  },
};

export const Disabled = {
  args: {
    colorInterpolator: interpolateBrBG,
    width: 100,
    height: 100,
    disabled: true,
  },
};
