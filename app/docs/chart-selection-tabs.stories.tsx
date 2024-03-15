import { Meta, StoryObj } from "@storybook/react";

import { ChartSelectionTabs } from "@/components/chart-selection-tabs";
import { ConfiguratorState, ConfiguratorStateProvider } from "@/configurator";
import palmerPenguinsFixture from "@/test/__fixtures/config/int/scatterplot-palmer-penguins.json";

type Story = StoryObj<typeof ChartSelectionTabs>;
const meta: Meta<typeof ChartSelectionTabs> = {
  component: ChartSelectionTabs,
  title: "components / Selection tabs",
  decorators: [
    (Story, ctx) => {
      return (
        <ConfiguratorStateProvider
          chartId={palmerPenguinsFixture.key}
          initialState={ctx.parameters.state as ConfiguratorState}
          allowDefaultRedirect={false}
        >
          <Story />
        </ConfiguratorStateProvider>
      );
    },
  ],
};

export const Editable: Story = {
  args: {},
  parameters: {
    state: {
      ...palmerPenguinsFixture.data,
      state: "CONFIGURING_CHART",
    },
  },
};

export const NonEditable: Story = {
  args: {},
  parameters: {
    state: {
      ...palmerPenguinsFixture.data,
      state: "PUBLISHING",
    },
  },
};

export default meta;
