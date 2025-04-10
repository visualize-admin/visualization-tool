import { Meta } from "@storybook/react";

import { photovoltaikChartStateMock } from "@/configurator/components/add-dataset-drawer.mock";
import { ConfiguratorStateProvider } from "@/src";

import { AddDatasetDrawer as _AddDatasetDrawer } from "./add-dataset-drawer";

export const AddDatasetDrawer = () => {
  return (
    <ConfiguratorStateProvider
      chartId="testing"
      initialState={photovoltaikChartStateMock}
    >
      <_AddDatasetDrawer open state={photovoltaikChartStateMock} />
    </ConfiguratorStateProvider>
  );
};

const meta: Meta = {
  component: _AddDatasetDrawer,
  title: "Organisms / AddDatasetDrawer",
};

export default meta;
