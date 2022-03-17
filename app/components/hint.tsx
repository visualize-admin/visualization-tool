import Flex from "./flex";
import { keyframes } from "@emotion/react";
import { Trans } from "@lingui/macro";
import { ReactNode } from "react";
import { Box, BoxProps, Typography } from "@mui/material";
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

const Spinner = ({ size = 48, ...props }: { size?: number } & BoxProps) => {
  return (
    <Flex
      {...props}
      sx={{
        animation: `1s linear infinite ${spin}`,
        ...props.sx,
      }}
    >
      <Icon name="loading" size={size} />
    </Flex>
  );
};

export const Loading = ({ delayMs = 1000 }: { delayMs?: number }) => (
  <Flex
    sx={{
      width: "100%",
      height: "100%",
      color: "hint.main",
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
    <Spinner />
    <Typography component="div" variant="body1">
      <Trans id="hint.loading.data">Loading data…</Trans>
    </Typography>
  </Flex>
);

export const LoadingOverlay = () => (
  <Box
    sx={{
      position: "absolute",
      backgroundColor: "grey.100",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    }}
  >
    <Loading delayMs={0} />
  </Box>
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
    <Typography component="h5" variant="h2" sx={{ my: 3 }}>
      <Trans id="hint.nodata.title">
        No data available for current filter selection
      </Trans>
    </Typography>
    <Typography component="p" variant="body2" sx={{ maxWidth: "40rem" }}>
      <Trans id="hint.nodata.message">
        Please try with another combination of filters.
      </Trans>
    </Typography>
  </Flex>
);
export const LoadingDataError = ({ message }: { message?: string }) => (
  <Flex
    sx={{
      width: "100%",
      height: "100%",
      color: "hint.main",
      margin: "auto",
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1,
      my: 6,
    }}
  >
    <Icon name="hintWarning" size={64} />
    <Typography component="h5" variant="h2" sx={{ my: 3 }}>
      <Trans id="hint.dataloadingerror.title">Data loading error</Trans>
    </Typography>
    <Box sx={{ "& > * + *:not([data-no-margin])": { marginTop: 2 } }}>
      <Typography component="p" variant="body2" sx={{ maxWidth: "40rem" }}>
        <Trans id="hint.dataloadingerror.message">
          The data could not be loaded.
        </Trans>
      </Typography>
      {message ? (
        <Typography component="p" variant="body2" sx={{ maxWidth: "40rem" }}>
          {message}
        </Typography>
      ) : null}
    </Box>
  </Flex>
);

export const LoadingGeoDimensionsError = () => (
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
    <Icon name="hintWarning" size={64} />
    <Typography component="h5" variant="h2" sx={{ my: 3 }}>
      <Trans id="hint.coordinatesloadingerror.title">
        Coordinates loading error
      </Trans>
    </Typography>
    <Box sx={{ "& > * + *:not([data-no-margin])": { marginTop: 2 } }}>
      <Typography component="p" variant="body2" sx={{ maxWidth: "40rem" }}>
        <Trans id="hint.coordinatesloadingerror.message">
          There was a problem with loading the coordinates from geographical
          dimensions.
        </Trans>
      </Typography>
    </Box>
  </Flex>
);

export const ChartUnexpectedError = () => (
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
    <Icon name="hintWarning" size={64} />
    <Typography component="h5" variant="h2" sx={{ my: 3 }}>
      <Trans id="hint.chartunexpected.title">Unexpected error</Trans>
    </Typography>
    <Typography component="p" variant="body2" sx={{ maxWidth: "40rem" }}>
      <Trans id="hint.chartunexpected.message">
        An unexpected error occurred while displaying this chart.
      </Trans>
    </Typography>
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
    <Icon name="datasetError" size={64} />
    <Typography component="h5" variant="h2" sx={{ my: 3 }}>
      <Trans id="hint.only.negative.data.title">Negative Values</Trans>
    </Typography>
    <Typography component="p" variant="body2" sx={{ maxWidth: "40rem" }}>
      <Trans id="hint.only.negative.data.message">
        Negative data values cannot be displayed with this chart type.
      </Trans>
    </Typography>
  </Flex>
);

export const Success = () => (
  <Flex
    sx={{
      width: "auto",
      height: "auto",
      borderRadius: 2,
      mb: 4,
      p: 4,
      backgroundColor: "successLight",
      color: "success",
      justifyContent: "flex-start",
      alignItems: "center",
    }}
  >
    <Box sx={{ width: 64, pr: 4, flexShrink: 0 }}>
      <Icon name="datasetSuccess" size={64} />
    </Box>
    <Typography component="p" variant="body1" sx={{ textAlign: "left", ml: 4 }}>
      <Trans id="hint.publication.success">
        Your visualization is now published. You can share and embed it using
        the URL or the options below.
      </Trans>
    </Typography>
  </Flex>
);
export const HintBlue = ({
  iconName,
  children,
  iconSize = 24,
}: {
  iconName: IconName;
  children: ReactNode;
  iconSize?: number;
}) => (
  <Flex
    sx={{
      width: "auto",
      height: "auto",
      p: 4,
      backgroundColor: "primaryLight",
      color: "primary",
      textAlign: "center",
      justifyContent: "flex-start",
      alignItems: ["flex-start", "center"],
    }}
  >
    <Box sx={{ width: iconSize, pr: 4 }}>
      <Icon name={iconName} size={iconSize} />
    </Box>
    <Typography component="p" variant="body1" sx={{ textAlign: "left", ml: 4 }}>
      {children}
    </Typography>
  </Flex>
);
export const HintRed = ({
  iconName,
  children,
  iconSize = 24,
}: {
  iconName: IconName;
  children: ReactNode;
  iconSize?: number;
}) => (
  <Flex
    sx={{
      width: "auto",
      height: "auto",
      borderRadius: 2,
      margin: "auto",
      p: 4,
      backgroundColor: "alert.light",
      color: "alert.main",
      textAlign: "center",
      justifyContent: "flex-start",
      alignItems: ["flex-start", "center"],
    }}
  >
    <Box sx={{ width: iconSize, pr: 4 }}>
      <Icon name={iconName} size={iconSize} />
    </Box>
    <Typography component="p" variant="body1" sx={{ textAlign: "left", ml: 4 }}>
      {children}
    </Typography>
  </Flex>
);
