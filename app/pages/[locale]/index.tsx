import { Trans } from "@lingui/macro";
import React from "react";
import { Button } from "rebass";
import { AppLayout, Center } from "../../components/layout";
import { LocalizedLink } from "../../components/links";
import { DataCubeProvider } from "../../domain/data-cube";

const Page = () => {
  return (
    <div>
      <DataCubeProvider endpoint="https://trifid-lindas.test.cluster.ldbar.ch/query">
        <AppLayout>
          <Center>
            <LocalizedLink href={"/[locale]/chart/new"} passHref>
              <Button as="a" variant="primary">
                <Trans>Neue Grafik erstellen</Trans>
              </Button>
            </LocalizedLink>
          </Center>
        </AppLayout>
      </DataCubeProvider>
    </div>
  );
};

export default Page;
