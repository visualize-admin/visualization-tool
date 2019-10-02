import { Trans } from "@lingui/macro";
import React from "react";
import { Button } from "rebass";
import { AppLayout, Center } from "../../components/layout";
import { LocalizedLink } from "../../components/links";

const Page = () => {
  return (
    <AppLayout>
      <Center>
        <LocalizedLink href={"/[locale]/chart/new"} passHref>
          <Button as="a" variant="primary">
            <Trans>Neue Grafik erstellen</Trans>
          </Button>
        </LocalizedLink>
      </Center>
    </AppLayout>
  );
};

export default Page;
