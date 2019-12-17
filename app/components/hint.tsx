import * as React from "react";
import { Flex, Text, Box, FlexProps } from "rebass";
import { Trans } from "@lingui/macro";
import { Icon, IconName } from "../icons";
import { keyframes } from "@emotion/core";

export const Error = ({ children }: { children: React.ReactNode }) => (
  <Flex justifyContent="center" alignItems="center" variant={"error"}>
    {children}
  </Flex>
);

export const Hint = ({ children, sx }: FlexProps) => (
  <Flex
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    variant={"hint"}
    sx={sx}
  >
    {children}
  </Flex>
);

const delayedShow = keyframes`
  0% { opacity: 0 }
  100% { opacity: 1 }
`;

const spin = keyframes`
  0% { transform: rotate(360deg) },
  100% { transform: rotate(0deg) }
`;

export const Loading = () => (
  <Hint
    sx={{
      padding: 2,
      opacity: 0,
      animation: `0s linear 1s forwards ${delayedShow}`
    }}
  >
    <Box
      sx={{
        animation: `2s linear infinite ${spin}`
      }}
    >
      <Icon name="loading" size={48} />
    </Box>
    <Text variant="heading4">
      <Trans id="hint.loading.data">Loading data…</Trans>
    </Text>
  </Hint>
);
export const DataSetHint = () => (
  <Hint>
    <Icon name="dataset" size={56} />
    <Text variant="heading2" my={3}>
      <Trans id="hint.select.dataset">Select a dataset</Trans>
    </Text>
    <Text variant="paragraph2" sx={{ maxWidth: "40rem" }}>
      <Trans id="hint.select.dataset.to.preview">
        Click on a dataset in the left column to preview its structure and
        content.
      </Trans>
    </Text>
  </Hint>
);

export const Success = () => (
  <Flex variant="success" justifyContent="flex-start" alignItems="center">
    <Icon name="published" size={56} />
    <Text variant="heading3" ml={4} sx={{ textAlign: "left" }}>
      <Trans id="hint.publication.success">
        Your visualization is now published. You can share and embed it using
        the URL or the options below.
      </Trans>
    </Text>
  </Flex>
);
export const HintBlue = ({
  iconName,
  children
}: {
  iconName: IconName;
  children: React.ReactNode;
}) => (
  <Flex
    variant="info"
    justifyContent="flex-start"
    alignItems={["flex-start", "center"]}
  >
    <Box width={24} pr={4}>
      <Icon name={iconName} size={24} />
    </Box>
    <Text variant="paragraph1" ml={4} sx={{ textAlign: "left" }}>
      {children}
    </Text>
  </Flex>
);
