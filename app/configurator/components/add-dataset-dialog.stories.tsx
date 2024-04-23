import { Meta } from "@storybook/react";

import { photovoltaikChartStateMock } from "@/configurator/components/add-dataset-dialog.mock";
import { ConfiguratorStateProvider } from "@/src";

import { DatasetDialog as AddDatasetDialogComponent } from "./add-dataset-dialog";

export const AddDatasetDialog = () => {
  return (
    <ConfiguratorStateProvider
      chartId={"testing"}
      initialState={photovoltaikChartStateMock}
    >
      <AddDatasetDialogComponent open state={photovoltaikChartStateMock} />
    </ConfiguratorStateProvider>
  );
};

const meta: Meta = {
  component: AddDatasetDialogComponent,
  title: "Organisms / AddDatasetDialog",
};

export default meta;
