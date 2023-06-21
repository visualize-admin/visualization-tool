import { SelectDatasetStep } from "@/browser/select-dataset-step";
import { AppLayout } from "@/components/layout";
import { EditorConfiguratorStateProvider } from "@/configurator/configurator-state";
import { DataCubeResultOrder } from "@/graphql/query-hooks";

export type BrowseParams = {
  type?: "theme" | "organization" | "dataset";
  subtype?: "theme" | "organization";
  iri?: string;
  subiri?: string;
  topic?: string;
  search?: string;
  order?: DataCubeResultOrder;
  includeDrafts?: boolean;
  dataset?: string;
};

export function DatasetBrowser() {
  return (
    <AppLayout>
      <EditorConfiguratorStateProvider
        chartId="new"
        allowDefaultRedirect={false}
      >
        <SelectDatasetStep />
      </EditorConfiguratorStateProvider>
    </AppLayout>
  );
}

export default DatasetBrowser;
