import { AppLayout } from "@/components/layout";
import { SelectDatasetStep } from "@/configurator/components/select-dataset-step";
import { EditorConfiguratorStateProvider } from "@/src";

export type BrowseParams = {
  type?: "theme" | "organization" | "dataset";
  subtype?: "theme" | "organization";
  iri?: string;
  subiri?: string;
  topic?: string;
  search?: string;
  order?: string;
  includeDrafts?: boolean;
  dataset?: string;
};

// Generic component for all browse subpages
export const DatasetBrowser = () => {
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
};

export default DatasetBrowser;
