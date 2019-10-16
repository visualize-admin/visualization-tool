import * as React from "react";
import { Flex, Text, Box } from "rebass";
import { Trans } from "@lingui/macro";

export const Error = ({ children }: { children: React.ReactNode }) => (
  <Flex justifyContent="center" alignItems="center" variant={"error"}>
    {children}
  </Flex>
);

export const Hint = ({ children }: { children: React.ReactNode }) => (
  <Flex
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    variant={"hint"}
  >
    {children}
  </Flex>
);

export const Loading = ({ children }: { children: React.ReactNode }) => (
  <Flex justifyContent="center" alignItems="center" variant={"loading"}>
    {children}
  </Flex>
);

export const DataSetHint = () => (
  <Hint>
    <Box m={[5, 7, 7]}>
      <Text variant="heading2" my={3}>
        <Trans>Datensatz Auswählen</Trans>
      </Text>
      <Text variant="paragraph2">
        <Trans>
          Klicken Sie auf einen Datensatz in der linken Spalte, um eine
          Übersicht über die Struktur und Komposition des jeweiligen Datensatz
          zu erhalten.
        </Trans>
      </Text>
    </Box>
  </Hint>
);
