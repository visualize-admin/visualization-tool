import { mapValues, pickBy } from "lodash";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { AppLayout } from "../../components/layout";
import { SelectDatasetStepV2 } from "../../configurator/components/SelectDatasetStep";
import { ConfiguratorStateProvider } from "../../src";

export type BrowseParams = {
  type?: "theme" | "organization";
  subtype?: "theme" | "organization";
  iri?: string;
  subiri?: string;
};

// Generic component for all browse subpages
export const GenericBrowse = () => {
  const router = useRouter();
  const params = useMemo(() => {
    const { type, iri, subtype, subiri } = router.query;

    return pickBy(
      mapValues({ type, iri, subtype, subiri }, (v) =>
        Array.isArray(v) ? v[0] : v
      ),
      Boolean
    );
  }, [router.query]);
  return (
    <AppLayout>
      <ConfiguratorStateProvider chartId="new" allowDefaultRedirect={false}>
        <SelectDatasetStepV2 params={params} />
      </ConfiguratorStateProvider>
    </AppLayout>
  );
};

const IndexBrowse = () => {
  return <GenericBrowse />;
};

export default IndexBrowse;
