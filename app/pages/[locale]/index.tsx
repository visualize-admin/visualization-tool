import { Trans } from "@lingui/macro";
import React from "react";
import { Button } from "rebass";
import { AppLayout, Center } from "../../components/layout";
import { LocalizedLink } from "../../components/links";

const Page = () => {
  return (
    <AppLayout>
      <Center>
        <LocalizedLink
          pathname="/[locale]/chart/[chartId]"
          query={{ chartId: "new" }}
          passHref
        >
          <Button as="a" variant="primary">
            <Trans>Create a new visualization</Trans>
          </Button>
        </LocalizedLink>
      </Center>
    </AppLayout>
  );
};

export default Page;
