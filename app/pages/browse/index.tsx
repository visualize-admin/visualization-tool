import { useRouter } from "next/router";
import React from "react";
import { AppLayout } from "../../components/layout";
import { SelectDatasetStep } from "../../configurator/components/select-dataset-step";
import { ConfiguratorStateProvider } from "../../src";

export type BrowseParams = {
  type?: "theme" | "organization" | "dataset";
  subtype?: "theme" | "organization";
  iri?: string;
  subiri?: string;
};

// Generic component for all browse subpages
export const GenericBrowse = () => {
  const router = useRouter();
  return (
    <AppLayout>
      <ConfiguratorStateProvider chartId="new" allowDefaultRedirect={false}>
        <SelectDatasetStep />
      </ConfiguratorStateProvider>
    </AppLayout>
  );
};

const IndexBrowse = () => {
  return <GenericBrowse />;
};

export default IndexBrowse;
