import * as React from "react";
import { Flex, Text, Box } from "@theme-ui/components";
import { Trans } from "@lingui/macro";
import { Icon, IconName } from "../icons";
import { keyframes } from "@emotion/core";

export const Error = ({ children }: { children: React.ReactNode }) => (
  <Flex
    sx={{
      justifyContent: "center",
      alignItems: "center",
      color: "error",
      borderColor: "error"
    }}
  >
    {children}
  </Flex>
);

export const Hint = ({ children }: { children: React.ReactNode }) => (
  <Flex
    sx={{
      width: "100%",
      height: "100%",
      color: "hint",
      margin: "auto",
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1
    }}
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
  <Flex
    sx={{
      width: "100%",
      height: "100%",
      color: "hint",
      margin: "auto",
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1,
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
  </Flex>
);
export const DataSetHint = () => (
  <Flex
    sx={{
      width: "100%",
      height: "100%",
      color: "hint",
      margin: "auto",
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1
    }}
  >
    <Icon name="dataset" size={56} />
    <Text variant="heading2" sx={{ my: 3 }}>
      <Trans id="hint.select.dataset">Select a dataset</Trans>
    </Text>
    <Text variant="paragraph2" sx={{ maxWidth: "40rem" }}>
      <Trans id="hint.select.dataset.to.preview">
        Click on a dataset in the left column to preview its structure and
        content.
      </Trans>
    </Text>
  </Flex>
);
export const NoDataHint = () => (
  <Flex
    sx={{
      width: "100%",
      height: "100%",
      color: "hint",
      margin: "auto",
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1
    }}
  >
    <Icon name="warning" size={56} />
    <Text variant="heading2" sx={{ my: 3 }}>
      <Trans id="hint.nodata.title">No data</Trans>
    </Text>
    <Text variant="paragraph2" sx={{ maxWidth: "40rem" }}>
      <Trans id="hint.nodata.message">
        No data was returned with the current filters.
      </Trans>
    </Text>
  </Flex>
);

export const Success = () => (
  <Flex
    sx={{
      width: "auto",
      height: "auto",
      mb: 4,
      p: 4,
      bg: "successLight",
      color: "success",
      justifyContent: "flex-start",
      alignItems: "center"
    }}
  >
    <Icon name="published" size={80} />
    <Text
      variant="heading3"
      sx={{ textAlign: "left", fontSize: 4, fontWeight: "regular", ml: 4 }}
    >
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
    sx={{
      width: "auto",
      height: "auto",
      mb: 4,
      mx: 6,
      p: 5,
      bg: "primaryLight",
      color: "primary",
      textAlign: "center",
      justifyContent: "flex-start",
      alignItems: ["flex-start", "center"]
    }}
  >
    <Box sx={{ width: 24, pr: 4 }}>
      <Icon name={iconName} size={24} />
    </Box>
    <Text variant="paragraph1" sx={{ textAlign: "left", ml: 4 }}>
      {children}
    </Text>
  </Flex>
);
export const HintRed = ({
  iconName,
  children
}: {
  iconName: IconName;
  children: React.ReactNode;
}) => (
  <Flex
    sx={{
      width: "auto",
      height: "auto",
      borderRadius: "4px",
      margin: "auto",
      p: 5,
      bg: "alertLight",
      color: "alert",
      textAlign: "center",
      justifyContent: "flex-start",
      alignItems: ["flex-start", "center"]
    }}
  >
    <Box sx={{ width: 24, pr: 4 }}>
      <Icon name={iconName} size={24} />
    </Box>
    <Text variant="paragraph1" sx={{ textAlign: "left", ml: 4 }}>
      {children}
    </Text>
  </Flex>
);
