import * as React from "react";
import { Flex, Text, Box } from "rebass";
import { Trans } from "@lingui/macro";
import { Icon } from "../icons";

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

export const Loading = () => (
  <Hint>
    <Box
      sx={{
        animation: "spin 2s linear infinite",

        "@keyframes spin": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" }
        }
      }}
    >
      <Icon name="loading" size={56} />
    </Box>
    <Text variant="heading2">
      <Trans>Loading data…</Trans>
    </Text>
  </Hint>
);
export const DataSetHint = () => (
  <Hint>
    <Icon name="dataset" size={56} />
    <Text variant="heading2" my={3}>
      <Trans>Select a dataset</Trans>
    </Text>
    <Text variant="paragraph2" sx={{ maxWidth: "40rem" }}>
      <Trans>
        Click on a dataset in the left column to preview its structure and
        content.
      </Trans>
    </Text>
  </Hint>
);

export const Success = () => (
  <Flex variant={"success"} justifyContent="flex-start" alignItems="center">
    <Icon name="published" size={56} />
    <Text variant="heading3" ml={4} sx={{ textAlign: "left" }}>
      <Trans>
        Congratulations! Your visualization can now be shared and embedded.
      </Trans>
    </Text>
  </Flex>
);
