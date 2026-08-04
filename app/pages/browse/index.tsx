import { GetServerSideProps } from "next";

import { SelectDatasetStep } from "@/browse/ui/select-dataset-step";
import { AppLayout } from "@/components/layout";
import { ConfiguratorStateProvider } from "@/configurator/configurator-state";
import { useIsEmbedded } from "@/hooks/useIsEmbedded";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      hideHeader: query.odsiframe === "true",
    },
  };
};

export function DatasetBrowser({ hideHeader }: { hideHeader: boolean }) {
  const isEmbedded = useIsEmbedded();
  return (
    <AppLayout hideHeader={hideHeader || isEmbedded}>
      <ConfiguratorStateProvider chartId="new" allowDefaultRedirect={false}>
        <SelectDatasetStep variant="page" />
      </ConfiguratorStateProvider>
    </AppLayout>
  );
}

export default DatasetBrowser;
