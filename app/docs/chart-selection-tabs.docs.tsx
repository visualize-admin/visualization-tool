/* eslint-disable import/no-anonymous-default-export */
import { markdown, ReactSpecimen } from "catalog";

import { ChartSelectionTabs } from "@/components/chart-selection-tabs";
import {
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateProvider,
} from "@/configurator";
import palmerPenguinsFixture from "@/test/__fixtures/config/int/scatterplot-palmer-penguins.json";

export default () => markdown`
> Chart Selection Tabs are used in ChartPreview and ChartPublished to enable selecting a chart type in any stage of creating a chart.

They can be either _editable_, to display a button to show ChartTypeSelector (used when creating a chart) or not, to disable that functionality (used in published charts).

## Editable

${(
  <ReactSpecimen span={6}>
    <ConfiguratorStateProvider
      chartId={palmerPenguinsFixture.key}
      initialState={
        palmerPenguinsFixture.data as unknown as ConfiguratorStateConfiguringChart
      }
      allowDefaultRedirect={false}
    >
      <ChartSelectionTabs editable />
    </ConfiguratorStateProvider>
  </ReactSpecimen>
)}

## Non-editable

  ${(
    <ReactSpecimen span={6}>
      <ConfiguratorStateProvider
        chartId={palmerPenguinsFixture.key}
        initialState={
          palmerPenguinsFixture.data as unknown as ConfiguratorStateConfiguringChart
        }
        allowDefaultRedirect={false}
      >
        <ChartSelectionTabs editable={false} />
      </ConfiguratorStateProvider>
    </ReactSpecimen>
  )}

## For developers

This component is based on MUI's Tabs & Tab components, styled in the federal theme.

Currently it does not support multiple tabs, as this will be implemented together with chart composition.
`;
