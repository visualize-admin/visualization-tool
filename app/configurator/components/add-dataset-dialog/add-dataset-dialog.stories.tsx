import { Meta } from "@storybook/react";

import { photovoltaikChartStateMock } from "@/configurator/components/add-dataset-drawer.mock";
import { ConfiguratorStateProvider } from "@/src";

import { DatasetDialog as AddDatasetDialogComponent } from "./add-dataset-dialog";

export const AddDatasetDrawer = () => {
  return (
    <ConfiguratorStateProvider
      chartId="testing"
      initialState={photovoltaikChartStateMock}
    >
      <AddDatasetDialogComponent open state={photovoltaikChartStateMock} />
    </ConfiguratorStateProvider>
  );
};

const meta: Meta = {
  component: AddDatasetDialogComponent,
  title: "Organisms / AddDatasetDrawer",
};

export default meta;
