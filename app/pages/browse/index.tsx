import { SelectDatasetStepPage } from "@/browser/select-dataset-step";
import { AppLayout } from "@/components/layout";
import { ConfiguratorStateProvider } from "@/configurator/configurator-state";
import { SearchCubeResultOrder } from "@/graphql/query-hooks";

export type BrowseParams = {
  type?: "theme" | "organization" | "dataset";
  subtype?: "theme" | "organization";
  iri?: string;
  subiri?: string;
  topic?: string;
  search?: string;
  order?: SearchCubeResultOrder;
  includeDrafts?: boolean;
  dataset?: string;
};

export function DatasetBrowser() {
  return (
    <AppLayout>
      <ConfiguratorStateProvider chartId="new" allowDefaultRedirect={false}>
        <SelectDatasetStepPage />
      </ConfiguratorStateProvider>
    </AppLayout>
  );
}

export default DatasetBrowser;
