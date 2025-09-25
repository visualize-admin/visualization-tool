import { Meta } from "@storybook/react";

import { DatasetResult } from "@/browser/ui/dataset-browse";
import { ConfiguratorStateProvider } from "@/configurator";
import { waldDatacubeResult } from "@/docs/dataset-result.mock";
import { states } from "@/docs/fixtures";

const meta: Meta = {
  title: "components / Dataset Result",
  decorators: [
    (Story) => (
      <ConfiguratorStateProvider
        chartId={states[0].state}
        initialState={states[0]}
        allowDefaultRedirect={false}
      >
        <Story />
      </ConfiguratorStateProvider>
    ),
  ],
};

export default meta;

const DatasetResultStory = {
  render: () => <DatasetResult dataCube={waldDatacubeResult} />,
};

export { DatasetResultStory as DatasetResult };
