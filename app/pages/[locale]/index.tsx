import { Trans } from "@lingui/macro";
import React from "react";
import { Button, Flex } from "rebass";
import { AppLayout, Center } from "../../components/layout";
import { LocalizedLink } from "../../components/links";

const Page = () => {
  return (
    <AppLayout>
      <Center>
        <LocalizedLink href={"/[locale]/chart/new"} passHref>
          <Flex sx={{ m: 2, justifyContent: "center", alignItems: "center" }}>
            <Button as="a" variant="primary">
              <Trans>Neue Grafik erstellen</Trans>
            </Button>
          </Flex>
        </LocalizedLink>
      </Center>
    </AppLayout>
  );
};

export default Page;
