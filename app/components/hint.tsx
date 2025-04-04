import { Trans } from "@lingui/macro";
import {
  Alert,
  AlertProps,
  AlertTitle,
  alpha,
  Box,
  BoxProps,
  keyframes,
  Link,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode, useEffect, useState } from "react";

import Flex from "@/components/flex";
import { MotionBox } from "@/components/presence";
import { Icon, IconName } from "@/icons";

export const Error = ({ children }: { children: ReactNode }) => {
  return (
    <Flex
      sx={{
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
        width: "100%",
        color: "red.main",
      }}
    >
      {children}
    </Flex>
  );
};

const delayedShow = keyframes`
  0% { opacity: 0 }
  100% { opacity: 1 }
`;

const spin = keyframes`
  0% { transform: rotate(-360deg) },
  100% { transform: rotate(0deg) }
`;

const Spinner = ({ size = 40, ...props }: { size?: number } & BoxProps) => {
  return (
    <Flex
      {...props}
      sx={{
        display: "flex",
        alignItems: "center",
        width: size,
        height: size,
        animation: `1s linear infinite ${spin}`,
        ...props.sx,
      }}
    >
      <svg width={43} height={44} viewBox="0 0 43 44" fill="none">
        <circle cx={21.5} cy={22} r={20} stroke="#E5E7EB" stroke-width={3} />
        <path
          d="M41.5 22C41.5 25.2891 40.6889 28.5273 39.1384 31.428C37.588 34.3286 35.3461 36.8022 32.6114 38.6294C29.8767 40.4567 26.7335 41.5814 23.4603 41.9037C20.1872 42.2261 16.885 41.7363 13.8463 40.4776C10.8077 39.219 8.12633 37.2304 6.03979 34.6879C3.95326 32.1455 2.52595 29.1277 1.8843 25.9019C1.24264 22.676 1.40644 19.3417 2.36119 16.1944C3.31595 13.047 5.03218 10.1836 7.35786 7.85791"
          stroke="#1F2937"
          stroke-width={3}
        />
      </svg>
    </Flex>
  );
};

const useLoadingStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(6),
    width: "100%",
    height: "100%",
    margin: "auto",
    padding: theme.spacing(2),
    textAlign: "center",
    opacity: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
}));

export const Loading = ({ delayMs = 1000 }: { delayMs?: number }) => {
  const [variant, setVariant] = useState<"regular" | "long">("regular");
  const classes = useLoadingStyles();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVariant("long");
    }, 7500);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <Flex
      className={classes.root}
      sx={{ animation: `0s linear ${delayMs}ms forwards ${delayedShow}` }}
    >
      <Spinner />
      <div>
        <Typography variant="h3" component="p">
          <Trans id="hint.loading.data">Loading data…</Trans>
        </Typography>
        {variant === "long" ? (
          <Typography variant="h3" component="p">
            <Trans id="hint.loading.data.large.datasets">
              While we are continuously optimizing performance, processing large
              data sets may currently require additional time.
            </Trans>
          </Typography>
        ) : null}
      </div>
    </Flex>
  );
};

const useInlineLoadingStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing(6),
    },
  };
});

export const InlineLoading = ({ delayMs = 1000 }: { delayMs?: number }) => {
  const classes = useInlineLoadingStyles();

  return (
    <Box
      className={classes.root}
      sx={{ animation: `0s linear ${delayMs}ms forwards ${delayedShow}` }}
    >
      <Spinner />
      <Typography>
        <Trans id="hint.loading.data">Loading data…</Trans>
      </Typography>
    </Box>
  );
};

export const LoadingOverlay = () => {
  const classes = useLoadingStyles();
  const theme = useTheme();

  return (
    <MotionBox
      className={classes.overlay}
      initial={{
        backgroundColor: alpha(theme.palette.cobalt[50], 0),
      }}
      animate={{
        backgroundColor: alpha(theme.palette.cobalt[50], 0.3),
      }}
      exit={{
        backgroundColor: alpha(theme.palette.cobalt[50], 0),
      }}
      transition={{ duration: 0.2 }}
    >
      <Loading delayMs={500} />
    </MotionBox>
  );
};

export const NoDataHint = () => {
  return (
    <HintBlue>
      <AlertTitle>
        <Trans id="hint.nodata.title">
          No data available for current filter selection
        </Trans>
      </AlertTitle>
      <Trans id="hint.nodata.message">
        Please try with another geographical dimension.
      </Trans>
    </HintBlue>
  );
};

export const NoGeometriesHint = () => {
  return (
    <HintBlue>
      <AlertTitle>
        <Trans id="hint.nogeometries.title">No geometries available</Trans>
      </AlertTitle>
      <Trans id="hint.nogeometries.message">
        Please try with another geographical dimension.
      </Trans>
    </HintBlue>
  );
};

export const LoadingDataError = ({ message }: { message?: string }) => {
  return (
    <HintRed>
      <AlertTitle>
        <Trans id="hint.dataloadingerror.title">Data loading error</Trans>
      </AlertTitle>
      <Trans id="hint.dataloadingerror.message">
        The data could not be loaded.
      </Trans>
      <Link
        typography="body2"
        target="_blank"
        href="https://visualization-tool.status.interactivethings.io/"
        sx={{ mt: "0.5em" }}
      >
        <Trans id="hint.dataloadingerror.status">
          Check our status page for more information.
          <Icon name="legacyLinkExternal" size={14} />
        </Trans>
      </Link>
      {message ? (
        <pre
          style={{
            marginTop: "0.5rem",
            marginLeft: "1rem",
            marginBottom: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {message}
        </pre>
      ) : null}
    </HintRed>
  );
};

export const LoadingGeoDimensionsError = () => {
  return (
    <HintRed>
      <AlertTitle>
        <Trans id="hint.coordinatesloadingerror.title">
          Coordinates loading error
        </Trans>
      </AlertTitle>
      <Trans id="hint.coordinatesloadingerror.message">
        There was a problem with loading the coordinates from geographical
        dimensions.
      </Trans>
    </HintRed>
  );
};

export const ChartUnexpectedError = ({ error }: { error?: Error }) => {
  return (
    <HintRed>
      <AlertTitle>
        <Trans id="hint.chartunexpected.title">Unexpected error</Trans>
      </AlertTitle>
      <Trans id="hint.chartunexpected.message">
        An unexpected error occurred while displaying this chart.
      </Trans>
      {error ? (
        <Typography variant="body3" component="div" mt={2}>
          {error.message}
        </Typography>
      ) : null}
    </HintRed>
  );
};

export const OnlyNegativeDataHint = () => {
  return (
    <HintOrange>
      <AlertTitle>
        <Trans id="hint.only.negative.data.title">Negative Values</Trans>
      </AlertTitle>
      <Trans id="hint.only.negative.data.message">
        Negative data values cannot be displayed with this chart type.
      </Trans>
    </HintOrange>
  );
};

export const PublishSuccess = () => {
  return (
    <HintGreen>
      <Trans id="hint.publication.success">
        Your visualization is now published. You can share and embed it using
        the URL or the options below.
      </Trans>
    </HintGreen>
  );
};

const colorToIcon: Record<NonNullable<AlertProps["color"]>, IconName> = {
  red: "infoCircle",
  green: "checkmarkCircle",
  blue: "infoCircle",
  orange: "infoCircle",
};

const mkHint = (
  color: NonNullable<AlertProps["color"]>,
  displayName: string
) => {
  const Component = ({
    smaller,
    sx,
    ...rest
  }: {
    smaller?: boolean;
  } & Omit<AlertProps, "color" | "icon">) => (
    <Alert
      color={color}
      icon={smaller ? false : <Icon name={colorToIcon[color]} />}
      sx={
        smaller
          ? { p: 0, backgroundColor: "transparent", boxShadow: 0, ...sx }
          : sx
      }
      {...rest}
    />
  );
  Component.displayName = displayName;

  return Component;
};

export const HintRed = mkHint("red", "HintRed");
const HintGreen = mkHint("green", "HintGreen");
export const HintBlue = mkHint("blue", "HintBlue");
export const HintOrange = mkHint("orange", "HintOrange");
