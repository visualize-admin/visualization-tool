import { SelectDatasetStep } from "@/browser/select-dataset-step";
import { AppLayout } from "@/components/layout";
import { ConfiguratorStateProvider } from "@/configurator/configurator-state";
import { SearchCubeResultOrder } from "@/graphql/query-hooks";

export type BrowseParams = {
  type?: "theme" | "organization" | "dataset" | "termset";
  subtype?: "theme" | "organization" | "termset";
  subsubtype?: "theme" | "organization" | "termset";
  iri?: string;
  subiri?: string;
  subsubiri?: string;
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
        <SelectDatasetStep variant="page" />
      </ConfiguratorStateProvider>
    </AppLayout>
  );
}

export default DatasetBrowser;
