import { keyframes } from "@emotion/core";
import { Trans } from "@lingui/macro";
import { Box, Flex, Text } from "@theme-ui/components";
import { ReactNode } from "react";
import { Icon, IconName } from "../icons";

export const Error = ({ children }: { children: ReactNode }) => (
  <Flex
    sx={{
      justifyContent: "center",
      alignItems: "center",
      color: "error",
      borderColor: "error",
    }}
  >
    {children}
  </Flex>
);

export const Hint = ({ children }: { children: ReactNode }) => (
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
  0% { transform: rotate(-360deg) },
  100% { transform: rotate(0deg) }
`;

export const Loading = ({ delayMs = 1000 }: { delayMs?: number }) => (
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
      animation: `0s linear ${delayMs}ms forwards ${delayedShow}`,
    }}
  >
    <Box
      sx={{
        animation: `1s linear infinite ${spin}`,
      }}
    >
      <Icon name="loading" size={48} />
    </Box>
    <Text variant="heading4">
      <Trans id="hint.loading.data">Loading data…</Trans>
    </Text>
  </Flex>
);

export const LoadingOverlay = () => (
  <Box
    sx={{
      position: "absolute",
      bg: "monochrome100",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    }}
  >
    <Loading delayMs={0} />
  </Box>
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
      flexGrow: 1,
    }}
  >
    <Icon name="dataset" size={64} />
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
      flexGrow: 1,
    }}
  >
    <Icon name="warning" size={64} />
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
export const OnlyNegativeDataHint = () => (
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
    }}
  >
    <Icon name="datasetWarning" size={64} />
    <Text variant="heading2" sx={{ my: 3 }}>
      <Trans id="hint.only.negative.data.title">Negative Values</Trans>
    </Text>
    <Text variant="paragraph2" sx={{ maxWidth: "40rem" }}>
      <Trans id="hint.only.negative.data.message">
        Negative data values cannot be displayed with this chart type.
      </Trans>
    </Text>
  </Flex>
);

export const Success = () => (
  <Flex
    sx={{
      width: "auto",
      height: "auto",
      borderRadius: "bigger",
      mb: 4,
      p: 4,
      bg: "successLight",
      color: "success",
      justifyContent: "flex-start",
      alignItems: "center",
    }}
  >
    <Box sx={{ width: 64, pr: 4, flexShrink: 0 }}>
      <Icon name="published" size={64} />
    </Box>
    <Text variant="paragraph1" sx={{ textAlign: "left", ml: 4 }}>
      <Trans id="hint.publication.success">
        Your visualization is now published. You can share and embed it using
        the URL or the options below.
      </Trans>
    </Text>
  </Flex>
);
export const HintBlue = ({
  iconName,
  children,
}: {
  iconName: IconName;
  children: ReactNode;
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
      alignItems: ["flex-start", "center"],
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
  children,
}: {
  iconName: IconName;
  children: ReactNode;
}) => (
  <Flex
    sx={{
      width: "auto",
      height: "auto",
      borderRadius: "bigger",
      margin: "auto",
      p: 5,
      bg: "alertLight",
      color: "alert",
      textAlign: "center",
      justifyContent: "flex-start",
      alignItems: ["flex-start", "center"],
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
