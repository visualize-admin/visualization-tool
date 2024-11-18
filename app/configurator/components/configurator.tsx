import { t, Trans } from "@lingui/macro";
import {
  Box,
  Grow,
  Link,
  SxProps,
  Tooltip,
  Typography,
  useEventCallback,
} from "@mui/material";
import Button, { ButtonProps } from "@mui/material/Button";
import { PUBLISHED_STATE } from "@prisma/client";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useClient } from "urql";
import { useDebounce } from "use-debounce";

import { SelectDatasetStep } from "@/browser/select-dataset-step";
import { extractChartConfigComponentIris } from "@/charts/shared/chart-helpers";
import { ChartPreview } from "@/components/chart-preview";
import { HEADER_HEIGHT } from "@/components/header-constants";
import { Loading } from "@/components/hint";
import {
  createMetadataPanelStore,
  MetadataPanelStoreContext,
} from "@/components/metadata-panel-store";
import { useLocalSnack } from "@/components/use-local-snack";
import {
  ConfiguratorState,
  ConfiguratorStateLayouting,
  enableLayouting,
  getChartConfig,
  hasChartConfigs,
  initChartStateFromChartEdit,
  isConfiguring,
  isLayouting,
  MetaKey,
  saveChartLocally,
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
  LAYOUT_HEADER_HEIGHT,
  PanelBodyWrapper,
  PanelHeaderLayout,
  PanelHeaderWrapper,
  PanelLayout,
} from "@/configurator/components/layout";
import { LayoutConfigurator } from "@/configurator/components/layout-configurator";
import {
  PreviewBreakpointToggleMenu,
  PreviewContainer,
  usePreviewBreakpoint,
} from "@/configurator/components/preview-breakpoint";
import { ShowDrawerButton } from "@/configurator/components/show-drawer-button";
import { ChartConfiguratorTable } from "@/configurator/table/table-chart-configurator";
import { useUserConfig } from "@/domain/user-configs";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { Icon } from "@/icons";
import SvgIcChevronLeft from "@/icons/components/IcChevronLeft";
import { useLocale } from "@/locales/use-locale";
import { useDataSourceStore } from "@/stores/data-source";
import {
  InteractiveFiltersChartProvider,
  InteractiveFiltersProvider,
} from "@/stores/interactive-filters";
import { createConfig, updateConfig } from "@/utils/chart-config/api";
import { getRouterChartId } from "@/utils/router/helpers";
import { replaceLinks } from "@/utils/ui-strings";
import useEvent from "@/utils/use-event";
import { useMutate } from "@/utils/use-fetch-data";

const BackContainer = (props: React.PropsWithChildren<{ sx?: SxProps }>) => {
  const { children, sx } = props;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: LAYOUT_HEADER_HEIGHT,
        flexGrow: 1,
        px: 2,
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
): field is MetaKey => {
  return field === "title" || field === "description" || field === "label";
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

const NextStepButton = (props: React.PropsWithChildren<{}>) => {
  const { children } = props;
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const chartConfig = getChartConfig(state);
  const componentIris = extractChartConfigComponentIris({ chartConfig });
  const [{ data: components }] = useDataCubesComponentsQuery({
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIris,
        filters: cube.filters,
        joinBy: cube.joinBy,
        loadValues: true,
      })),
    },
  });

  const handleClick = useEvent(() => {
    if (components?.dataCubesComponents) {
      dispatch({
        type: "STEP_NEXT",
        dataCubesComponents: components.dataCubesComponents,
      });
    }
  });

  return (
    <Button
      color="primary"
      variant="contained"
      onClick={handleClick}
      sx={{ minWidth: "fit-content" }}
    >
      {children}
    </Button>
  );
};

export const SaveDraftButton = ({
  chartId,
}: {
  chartId: string | undefined;
}) => {
  const { data: config, invalidate: invalidateConfig } = useUserConfig(chartId);
  const session = useSession();
  const client = useClient();

  const [state, dispatch] = useConfiguratorState();

  const [snack, enqueueSnackbar, dismissSnack] = useLocalSnack();
  const [debouncedSnack] = useDebounce(snack, 500);
  const { asPath, replace } = useRouter();

  const createConfigMut = useMutate(createConfig);
  const updatePublishedStateMut = useMutate(updateConfig);
  const loggedInId = session.data?.user.id;

  const handleClick = useEventCallback(async () => {
    try {
      if (config?.user_id && loggedInId) {
        const updated = await updatePublishedStateMut.mutate({
          data: state,
          published_state: PUBLISHED_STATE.DRAFT,
          key: config.key,
        });

        if (updated) {
          if (asPath !== `/create/${updated.key}`) {
            replace(`/create/new?edit=${updated.key}`);
          }
        } else {
          throw new Error("Could not update draft");
        }
      } else if (state) {
        const saved = await createConfigMut.mutate({
          data: state,
          user_id: loggedInId,
          published_state: PUBLISHED_STATE.DRAFT,
        });
        if (saved) {
          const config = await initChartStateFromChartEdit(
            client,
            saved.key,
            state.state
          );

          if (!config) {
            return;
          }

          dispatch({ type: "INITIALIZED", value: config });
          saveChartLocally(saved.key, config);
          replace(`/create/${saved.key}`, undefined, {
            shallow: true,
          });
        } else {
          throw new Error("Could not save draft");
        }
      }

      enqueueSnackbar({
        message: (
          <>
            {replaceLinks(
              t({
                id: "button.save-draft.saved",
                message: "Draft saved in [My visualizations](/profile)",
              }),
              (label, href) => {
                return (
                  <div>
                    <NextLink href={href} passHref legacyBehavior>
                      <Link sx={{ color: "primary.main" }}>{label}</Link>
                    </NextLink>
                  </div>
                );
              }
            )}
          </>
        ),
        variant: "success",
      });

      invalidateConfig();
    } catch (e) {
      console.log(
        `Error while saving draft: ${e instanceof Error ? e.message : e}`
      );
      enqueueSnackbar({
        message: t({
          id: "button.save-draft.error",
          message: "Could not save draft",
        }),
        variant: "error",
      });
    }

    setTimeout(() => {
      updatePublishedStateMut.reset();
      createConfigMut.reset();
    }, 2000);
  });

  const hasUpdated = !!(updatePublishedStateMut.data || createConfigMut.data);
  const [debouncedHasUpdated] = useDebounce(hasUpdated, 300);

  if (!loggedInId) {
    return null;
  }

  return (
    <Tooltip
      arrow
      title={debouncedSnack?.message ?? ""}
      open={!!snack}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      onClose={() => dismissSnack()}
    >
      <Button
        endIcon={
          hasUpdated || debouncedHasUpdated ? (
            <Grow in={hasUpdated}>
              <span>
                <Icon name="check" />
              </span>
            </Grow>
          ) : null
        }
        variant="outlined"
        onClick={handleClick}
      >
        <Trans id="button.save-draft">Save draft</Trans>
      </Button>
    </Tooltip>
  );
};

const LayoutChartButton = () => {
  return (
    <NextStepButton>
      <Trans id="button.layout">Proceed to layout options</Trans>
    </NextStepButton>
  );
};

const PublishChartButton = ({ chartId }: { chartId: string | undefined }) => {
  const session = useSession();
  const { data: config } = useUserConfig(chartId);
  const editingPublishedChart =
    session.data?.user.id &&
    config?.user_id === session.data.user.id &&
    config.published_state === "PUBLISHED";

  return (
    <NextStepButton>
      {editingPublishedChart ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip
            title={t({
              id: "button.update.warning",
              message:
                "Keep in mind that updating this visualization will affect all the places where it might be already embedded!",
            })}
          >
            <div>
              <Icon name="hintWarning" />
            </div>
          </Tooltip>
          <Trans id="button.update">Update this visualization</Trans>
        </Box>
      ) : (
        <Trans id="button.publish">Publish</Trans>
      )}
    </NextStepButton>
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

  const chartId = getRouterChartId(router.asPath);

  return (
    <InteractiveFiltersChartProvider chartConfigKey={chartConfig.key}>
      <PanelLayout type="LM" sx={{ background: (t) => t.palette.muted.main }}>
        <PanelHeaderLayout type="LMR">
          <PanelHeaderWrapper type="L">
            <BackContainer>
              <BackButton onClick={handlePrevious}>
                <Trans id="controls.nav.back-to-preview">Back to preview</Trans>
              </BackButton>
            </BackContainer>
          </PanelHeaderWrapper>
          <PanelHeaderWrapper
            type="R"
            sx={{
              display: "flex",
              flexShrink: 0,
              alignItems: "start",
              justifyContent: "flex-end",
              gap: "0.5rem",
            }}
          >
            <SaveDraftButton chartId={chartId} />
            {enableLayouting(state) ? (
              <LayoutChartButton />
            ) : (
              <PublishChartButton chartId={chartId} />
            )}
          </PanelHeaderWrapper>
        </PanelHeaderLayout>
        <PanelBodyWrapper
          type="L"
          style={{
            flexGrow: 1,
            display: "flex",
            height: "100%",
            flexDirection: "column",
          }}
        >
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
        <PanelBodyWrapper
          type="M"
          sx={{ overflowX: "hidden", overflowY: "auto", p: 6 }}
        >
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
  const [state, dispatch] = useConfiguratorState(isLayouting);
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

  const layoutRef = useRef(state.layout);
  useEffect(() => {
    if (layoutRef.current?.type === state.layout.type) {
      layoutRef.current = state.layout;
    }
  }, [state.layout]);

  const { previewBreakpoint, setPreviewBreakpoint } = usePreviewBreakpoint();

  const handleLayoutChange = useCallback(
    (
      newLayoutType: ConfiguratorStateLayouting["layout"]["type"],
      newLayoutCallback: () => void
    ) => {
      if (newLayoutType === state.layout.type) {
        return;
      }

      if (layoutRef.current?.type === newLayoutType) {
        dispatch({
          type: "LAYOUT_CHANGED",
          value: {
            ...layoutRef.current,
            meta: state.layout.meta,
            activeField: undefined,
          },
        });
      } else {
        newLayoutCallback();
      }

      setPreviewBreakpoint(null);
    },
    [dispatch, setPreviewBreakpoint, state.layout.meta, state.layout.type]
  );

  if (state.state !== "LAYOUTING") {
    return null;
  }

  const isSingleURLs = state.layout.type === "singleURLs";
  const chartId = getRouterChartId(asPath);

  const centerLayout = !!(isSingleURLs || previewBreakpoint);

  return (
    <PanelLayout
      type={centerLayout ? "M" : "LM"}
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
            onClick={() =>
              handleLayoutChange("tab", () => {
                dispatch({
                  type: "LAYOUT_CHANGED",
                  value: {
                    type: "tab",
                    meta: state.layout.meta,
                    activeField: undefined,
                  },
                });
              })
            }
          />
          <IconButton
            label="layoutDashboard"
            checked={state.layout.type === "dashboard"}
            onClick={() =>
              handleLayoutChange("dashboard", () => {
                dispatch({
                  type: "LAYOUT_CHANGED",
                  value: {
                    type: "dashboard",
                    meta: state.layout.meta,
                    layout: "tall",
                    activeField: undefined,
                  },
                });
              })
            }
          />
          <IconButton
            label="layoutSingleURLs"
            checked={state.layout.type === "singleURLs"}
            onClick={() =>
              handleLayoutChange("singleURLs", () => {
                dispatch({
                  type: "LAYOUT_CHANGED",
                  value: {
                    type: "singleURLs",
                    publishableChartKeys: state.chartConfigs.map(
                      (chartConfig) => chartConfig.key
                    ),
                    meta: state.layout.meta,
                    activeField: undefined,
                  },
                });
              })
            }
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
      <PanelBodyWrapper
        type="L"
        sx={{
          zIndex: 2,
          position: "absolute",
          left: centerLayout ? -DRAWER_WIDTH : 0,
          top: centerLayout ? LAYOUT_HEADER_HEIGHT : 0,
          width: DRAWER_WIDTH,
          height: "100%",
          transition: "left 0.3s",
        }}
      >
        <LayoutConfigurator />
      </PanelBodyWrapper>
      <PanelBodyWrapper
        type="M"
        style={{ overflowY: "hidden", overflowX: "auto" }}
      >
        <Box sx={{ display: "flex", px: 6, py: 4 }}>
          {!isSingleURLs && previewBreakpoint && (
            <ShowDrawerButton onClick={() => setPreviewBreakpoint(null)} />
          )}
          <PreviewBreakpointToggleMenu
            value={previewBreakpoint}
            onChange={(value) => {
              dispatch({
                type: "LAYOUT_CHANGED",
                value: {
                  ...state.layout,
                  activeField: undefined,
                },
              });
              setPreviewBreakpoint(previewBreakpoint === value ? null : value);
            }}
          />
        </Box>
        <PreviewContainer
          breakpoint={previewBreakpoint}
          singleColumn={isSingleURLs}
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
          {/* We need to reset the key to prevent overwriting of the layout */}
          <ChartPreview key={previewBreakpoint} dataSource={state.dataSource} />
        </PreviewContainer>
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
      <PanelBodyWrapper type="M" sx={{ p: 6 }}>
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
