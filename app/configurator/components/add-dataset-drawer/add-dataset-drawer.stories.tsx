import { Meta } from "@storybook/react";

import { photovoltaikChartStateMock } from "@/configurator/components/add-dataset-drawer.mock";
import { ConfiguratorStateProvider } from "@/src";

import { AddDatasetDrawer as AddDatasetDrawer_ } from "./add-dataset-drawer";

export const AddDatasetDrawer = () => {
  return (
    <ConfiguratorStateProvider
      chartId="testing"
      initialState={photovoltaikChartStateMock}
    >
      <AddDatasetDrawer_ open state={photovoltaikChartStateMock} />
    </ConfiguratorStateProvider>
  );
};

const meta: Meta = {
  component: AddDatasetDrawer_,
  title: "Organisms / AddDatasetDrawer",
};

export default meta;
