import { Trans } from "@lingui/macro";
import { Box, SxProps, Typography } from "@mui/material";
import Button, { ButtonProps } from "@mui/material/Button";
import { useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";

import { SelectDatasetStep } from "@/browser/select-dataset-step";
import { META } from "@/charts";
import { ChartPreview } from "@/components/chart-preview";
import {
  PublishChartButton,
  SaveDraftButton,
} from "@/components/chart-selection-tabs";
import { HEADER_HEIGHT } from "@/components/header-constants";
import { Loading } from "@/components/hint";
import {
  MetadataPanelStoreContext,
  createMetadataPanelStore,
} from "@/components/metadata-panel-store";
import {
  ConfiguratorState,
  getChartConfig,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import {
  ChartAnnotationsSelector,
  LayoutAnnotationsSelector,
} from "@/configurator/components/annotation-options";
import { Description, Title } from "@/configurator/components/annotators";
import { ChartConfigurator } from "@/configurator/components/chart-configurator";
import { ChartOptionsSelector } from "@/configurator/components/chart-options-selector";
import {
  ConfiguratorDrawer,
  DRAWER_WIDTH,
} from "@/configurator/components/drawer";
import { IconButton } from "@/configurator/components/icon-button";
import {
  PanelBodyWrapper,
  PanelHeaderLayout,
  PanelHeaderWrapper,
  PanelLayout,
} from "@/configurator/components/layout";
import { LayoutConfigurator } from "@/configurator/components/layout-configurator";
import { ChartConfiguratorTable } from "@/configurator/table/table-chart-configurator";
import SvgIcChevronLeft from "@/icons/components/IcChevronLeft";
import { useLocale } from "@/locales/use-locale";
import { useDataSourceStore } from "@/stores/data-source";
import {
  InteractiveFiltersChartProvider,
  InteractiveFiltersProvider,
} from "@/stores/interactive-filters";
import { getRouterChartId } from "@/utils/router/helpers";
import useEvent from "@/utils/use-event";

const BackContainer = (props: React.PropsWithChildren<{ sx?: SxProps }>) => {
  const { children, sx } = props;

  return (
    <Box
      sx={{
        px: 2,
        minHeight: 78,
        display: "flex",
        alignItems: "center",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export const BackButton = ({
  children,
  onClick,
  ...props
}: { children: React.ReactNode } & ButtonProps) => {
  const { sx } = props;

  return (
    <Button
      variant="text"
      color="primary"
      size="small"
      sx={{ fontWeight: "bold", ...sx }}
      startIcon={<SvgIcChevronLeft />}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export const isAnnotationField = (
  field: string | undefined
): field is "title" | "description" => {
  return field === "title" || field === "description";
};

const useAssureCorrectDataSource = (stateGuard: ConfiguratorState["state"]) => {
  const [state] = useConfiguratorState();
  const { dataSource, setDataSource } = useDataSourceStore();

  useEffect(() => {
    if (state.state !== stateGuard) {
      return;
    }

    if (state.dataSource.url !== dataSource.url) {
      setDataSource(state.dataSource);
    }
  }, [
    dataSource.url,
    setDataSource,
    state.dataSource,
    state.state,
    stateGuard,
  ]);
};

type BackToMainButtonProps = {
  onClick: () => void;
};

const BackToMainButton = (props: BackToMainButtonProps) => {
  const { onClick } = props;
  return (
    <BackContainer>
      <Button
        variant="text"
        color="inherit"
        size="small"
        sx={{ fontWeight: "bold" }}
        startIcon={<SvgIcChevronLeft />}
        onClick={onClick}
      >
        <Trans id="controls.nav.back-to-main">Back to main</Trans>
      </Button>
    </BackContainer>
  );
};

const ConfigureChartStep = () => {
  const [state, dispatch] = useConfiguratorState();
  const configuring = isConfiguring(state);
  const chartConfig = getChartConfig(state);
  const router = useRouter();
  const handleClosePanel = useEvent(() => {
    dispatch({ type: "CHART_ACTIVE_FIELD_CHANGED", value: undefined });
  });
  const handlePrevious = useEvent(() => {
    if (!configuring) {
      return;
    }

    router.push(
      {
        pathname: `/browse`,
        query: {
          dataset: chartConfig.cubes[0].iri,
        },
      },
      undefined,
      { shallow: true }
    );
  });

  useAssureCorrectDataSource("CONFIGURING_CHART");

  if (!configuring) {
    return null;
  }

  return (
    <InteractiveFiltersChartProvider chartConfigKey={chartConfig.key}>
      <PanelLayout type="LM">
        <PanelBodyWrapper
          type="L"
          sx={{
            flexGrow: 1,
            display: "flex",
            height: "100%",
            flexDirection: "column",
          }}
        >
          <BackContainer>
            <BackButton onClick={handlePrevious}>
              <Trans id="controls.nav.back-to-preview">Back to preview</Trans>
            </BackButton>
          </BackContainer>
          {chartConfig.chartType === "table" ? (
            <ChartConfiguratorTable state={state} />
          ) : (
            // Need to use key to force re-render when switching between charts
            // or adding / removing cubes to fix stale data issues
            <ChartConfigurator
              key={`${chartConfig.key}_${chartConfig.cubes.length}`}
              state={state}
            />
          )}
        </PanelBodyWrapper>
        <PanelBodyWrapper type="M">
          <ChartPreview dataSource={state.dataSource} />
        </PanelBodyWrapper>
        <ConfiguratorDrawer
          anchor="left"
          open={!!chartConfig.activeField}
          hideBackdrop
          onClose={handleClosePanel}
        >
          <div style={{ width: DRAWER_WIDTH }} data-testid="panel-drawer">
            <BackToMainButton onClick={handleClosePanel} />
            {isAnnotationField(chartConfig.activeField) ? (
              <ChartAnnotationsSelector />
            ) : (
              <ChartOptionsSelector state={state} />
            )}
          </div>
        </ConfiguratorDrawer>
      </PanelLayout>
    </InteractiveFiltersChartProvider>
  );
};

const LayoutingStep = () => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState();
  const handleClosePanel = useEvent(() => {
    dispatch({ type: "LAYOUT_ACTIVE_FIELD_CHANGED", value: undefined });
  });
  const handlePrevious = useEvent(() => {
    if (state.state !== "LAYOUTING") {
      return;
    }
    dispatch({ type: "STEP_PREVIOUS" });
  });

  useAssureCorrectDataSource("LAYOUTING");
  const { asPath } = useRouter();

  if (state.state !== "LAYOUTING") {
    return null;
  }

  const isSingleURLs = state.layout.type === "singleURLs";
  const chartId = getRouterChartId(asPath);

  return (
    <PanelLayout
      // SingleURLs layout doesn't have an options panel
      type={isSingleURLs ? "M" : "LM"}
      sx={{ background: (t) => t.palette.muted.main }}
    >
      <PanelHeaderLayout type="LMR">
        <PanelHeaderWrapper type="L">
          <BackContainer>
            <BackButton onClick={handlePrevious}>
              <Trans id="controls.nav.back-to-configurator">
                Back to editing
              </Trans>
            </BackButton>
          </BackContainer>
        </PanelHeaderWrapper>
        <PanelHeaderWrapper
          type="M"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            mx: "auto",
          }}
        >
          <IconButton
            label="layoutTab"
            checked={state.layout.type === "tab"}
            onClick={() => {
              if (state.layout.type === "tab") {
                return;
              }

              dispatch({
                type: "LAYOUT_CHANGED",
                value: {
                  type: "tab",
                  meta: state.layout.meta,
                  activeField: undefined,
                },
              });
            }}
          />
          <IconButton
            label="layoutDashboard"
            checked={state.layout.type === "dashboard"}
            onClick={() => {
              if (state.layout.type === "dashboard") {
                return;
              }

              dispatch({
                type: "LAYOUT_CHANGED",
                value: {
                  type: "dashboard",
                  meta: state.layout.meta,
                  layout: "tall",
                  activeField: undefined,
                },
              });
            }}
          />
          <IconButton
            label="layoutSingleURLs"
            checked={state.layout.type === "singleURLs"}
            onClick={() => {
              if (state.layout.type === "singleURLs") {
                return;
              }

              dispatch({
                type: "LAYOUT_CHANGED",
                value: {
                  type: "singleURLs",
                  publishableChartKeys: state.chartConfigs.map(
                    (chartConfig) => chartConfig.key
                  ),
                  // Clear the meta data, as it's not used in singleURLs layout,
                  // but makes the types more consistent
                  meta: META,
                  activeField: undefined,
                },
              });
            }}
          />
        </PanelHeaderWrapper>
        <PanelHeaderWrapper
          type="R"
          sx={{
            display: "flex",
            alignItems: "start",
            justifyContent: "flex-end",
            gap: "0.5rem",
          }}
        >
          <SaveDraftButton chartId={chartId} />
          <PublishChartButton chartId={chartId} />
        </PanelHeaderWrapper>
      </PanelHeaderLayout>
      {!isSingleURLs && (
        <PanelBodyWrapper type="L">
          <LayoutConfigurator />
        </PanelBodyWrapper>
      )}
      <PanelBodyWrapper type="M">
        <Box
          sx={
            isSingleURLs
              ? {
                  width: "100%",
                  maxWidth: { xs: "100%", lg: 1280 },
                  mx: "auto",
                }
              : {}
          }
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              mt: 3,
              mb: isSingleURLs ? 6 : 4,
            }}
          >
            {isSingleURLs ? (
              <Typography
                variant="h3"
                sx={{ fontWeight: "normal", color: "secondary.active" }}
              >
                <Trans id="controls.layout.singleURLs.publish">
                  Select the charts to publish separately. After proceeding to
                  publish, the selected charts will be opened in individual
                  tabs.
                </Trans>
              </Typography>
            ) : (
              <>
                <Title
                  text={state.layout.meta.title[locale]}
                  onClick={() => {
                    if (state.layout.activeField !== "title") {
                      dispatch({
                        type: "LAYOUT_ACTIVE_FIELD_CHANGED",
                        value: "title",
                      });
                    }
                  }}
                />
                <Description
                  text={state.layout.meta.description[locale]}
                  onClick={() => {
                    if (state.layout.activeField !== "description") {
                      dispatch({
                        type: "LAYOUT_ACTIVE_FIELD_CHANGED",
                        value: "description",
                      });
                    }
                  }}
                />
              </>
            )}
          </Box>
          <ChartPreview dataSource={state.dataSource} />
        </Box>
      </PanelBodyWrapper>
      <ConfiguratorDrawer
        anchor="left"
        open={!!state.layout.activeField}
        hideBackdrop
        onClose={handleClosePanel}
      >
        <div style={{ width: DRAWER_WIDTH }} data-testid="panel-drawer">
          <BackToMainButton onClick={handleClosePanel} />
          {isAnnotationField(state.layout.activeField) && (
            <LayoutAnnotationsSelector />
          )}
        </div>
      </ConfiguratorDrawer>
    </PanelLayout>
  );
};

const PublishStep = () => {
  const [state] = useConfiguratorState();

  if (state.state !== "PUBLISHING") {
    return null;
  }

  return (
    <PanelLayout type="LM">
      <PanelBodyWrapper type="M">
        <ChartPreview dataSource={state.dataSource} />
      </PanelBodyWrapper>
    </PanelLayout>
  );
};

export const Configurator = () => {
  const { pathname } = useRouter();
  // Local state, the dataset preview doesn't need to be persistent.
  // FIXME: for a11y, "updateDataSetPreviewIri" should also move focus to "Weiter" button (?)
  const [configuratorState] = useConfiguratorState();
  const isLoadingConfigureChartStep =
    configuratorState.state === "INITIAL" && pathname === "/create/[chartId]";
  const metadataPanelStore = useMemo(() => {
    return createMetadataPanelStore();
  }, []);

  return isLoadingConfigureChartStep ? (
    <LoadingConfigureChartStep />
  ) : configuratorState.state === "SELECTING_DATASET" ? (
    <SelectDatasetStep variant="page" />
  ) : configuratorState.state === "INITIAL" ? null : (
    <InteractiveFiltersProvider chartConfigs={configuratorState.chartConfigs}>
      {configuratorState.state === "CONFIGURING_CHART" && (
        <MetadataPanelStoreContext.Provider value={metadataPanelStore}>
          <ConfigureChartStep />
        </MetadataPanelStoreContext.Provider>
      )}
      {configuratorState.state === "LAYOUTING" && <LayoutingStep />}
      {configuratorState.state === "PUBLISHING" && <PublishStep />}
    </InteractiveFiltersProvider>
  );
};

const LoadingConfigureChartStep = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
      }}
    >
      <Loading delayMs={0} />
    </Box>
  );
};
