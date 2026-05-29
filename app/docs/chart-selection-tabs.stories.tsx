import { Meta, StoryObj } from "@storybook/react";

import { ChartSelectionTabs } from "@/components/chart-selection-tabs";
import { ConfiguratorState, ConfiguratorStateProvider } from "@/configurator";
import scatterplotGreenhouseGasesFixture from "@/test/__fixtures/config/int/scatterplot-greenhouse-gases.json";

type Story = StoryObj<typeof ChartSelectionTabs>;
const meta: Meta<typeof ChartSelectionTabs> = {
  component: ChartSelectionTabs,
  title: "components / Selection tabs",
  decorators: [
    (Story, ctx) => {
      return (
        <ConfiguratorStateProvider
          chartId={scatterplotGreenhouseGasesFixture.key}
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
      ...scatterplotGreenhouseGasesFixture.data,
      state: "CONFIGURING_CHART",
    },
  },
};

export const NonEditable: Story = {
  args: {},
  parameters: {
    state: {
      ...scatterplotGreenhouseGasesFixture.data,
      state: "PUBLISHING",
    },
  },
};

export default meta;
