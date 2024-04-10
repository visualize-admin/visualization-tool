import { Meta, StoryObj } from "@storybook/react";
import { interpolateBrBG, interpolateOranges } from "d3-scale-chromatic";

import { ColorRamp } from "@/configurator/components/chart-controls/color-ramp";

const meta: Meta<typeof ColorRamp> = {
  component: ColorRamp,
  title: "components / ColorRamp",
};

export default meta;
type Story = StoryObj<typeof ColorRamp>;

export const Continuous: Story = {
  args: {
    colorInterpolator: interpolateOranges,
  },
};

export const Discrete: Story = {
  args: {
    colorInterpolator: interpolateOranges,
    nSteps: 5,
  },
};

export const Custom: Story = {
  args: {
    colorInterpolator: interpolateBrBG,
    width: 100,
    height: 100,
  },
};

export const Disabled: Story = {
  args: {
    colorInterpolator: interpolateBrBG,
    width: 100,
    height: 100,
    disabled: true,
  },
};
