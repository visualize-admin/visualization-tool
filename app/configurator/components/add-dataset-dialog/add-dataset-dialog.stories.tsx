import { Meta } from "@storybook/react";

import { photovoltaikChartStateMock } from "@/configurator/components/add-dataset-drawer.mock";
import { ConfiguratorStateProvider } from "@/src";

<<<<<<<< HEAD:app/configurator/components/add-dataset-drawer.stories.tsx
import { AddDatasetDrawer as _AddDatasetDrawer } from "./add-dataset-drawer";
========
import { DatasetDialog as AddDatasetDialogComponent } from "./add-dataset-dialog/add-dataset-dialog";
>>>>>>>> c9e8d39f1 (refactor: Put inside a folder):app/configurator/components/add-dataset-dialog/add-dataset-dialog.stories.tsx

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
