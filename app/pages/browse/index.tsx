import { GetServerSideProps } from "next";

import { SelectDatasetStep } from "@/browse/ui/select-dataset-step";
import { AppLayout } from "@/components/layout";
import { ConfiguratorStateProvider } from "@/configurator/configurator-state";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      hideHeader: query.odsiframe === "true",
    },
  };
};

export function DatasetBrowser({ hideHeader }: { hideHeader: boolean }) {
  return (
    <AppLayout hideHeader={hideHeader}>
      <ConfiguratorStateProvider chartId="new" allowDefaultRedirect={false}>
        <SelectDatasetStep variant="page" />
      </ConfiguratorStateProvider>
    </AppLayout>
  );
}

export default DatasetBrowser;
