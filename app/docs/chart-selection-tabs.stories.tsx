import { Meta, StoryObj } from "@storybook/react";
import { SessionProvider } from "next-auth/react";

import { ChartSelectionTabs } from "@/components/chart-selection-tabs";
import { ConfiguratorState, ConfiguratorStateProvider } from "@/configurator";
import palmerPenguinsFixture from "@/test/__fixtures/config/int/scatterplot-palmer-penguins.json";

type Story = StoryObj<typeof ChartSelectionTabs>;
const meta: Meta<typeof ChartSelectionTabs> = {
  component: ChartSelectionTabs,
  title: "components / Selection tabs",
  decorators: [
    (Story) => {
      return (
        <SessionProvider>
          <ConfiguratorStateProvider
            chartId={palmerPenguinsFixture.key}
            initialState={
              {
                ...palmerPenguinsFixture.data,
                state: "CONFIGURING_CHART",
              } as unknown as ConfiguratorState
            }
            allowDefaultRedirect={false}
          >
            <Story />
          </ConfiguratorStateProvider>
        </SessionProvider>
      );
    },
  ],
};

export const Editable: Story = {
  args: {},
};

export default meta;
