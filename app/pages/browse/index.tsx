import { mapValues, pickBy } from "lodash";
import { useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";
import { AppLayout } from "../../components/layout";
import { SelectDatasetStepV2 } from "../../configurator/components/select-dataset-step";
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
        <SelectDatasetStepV2 />
      </ConfiguratorStateProvider>
    </AppLayout>
  );
};

const IndexBrowse = () => {
  return <GenericBrowse />;
};

export default IndexBrowse;
