import { Trans } from "@lingui/macro";
import { SxProps } from "@mui/material";
import Box from "@mui/material/Box";
import Button, { ButtonProps } from "@mui/material/Button";
import { useRouter } from "next/router";
import React from "react";

import { SelectDatasetStep } from "@/browser/select-dataset-step";
import { ChartPanel } from "@/components/chart-panel";
import { ChartPreview } from "@/components/chart-preview";
import { PublishChartButton } from "@/components/chart-selection-tabs";
import { HEADER_HEIGHT } from "@/components/header";
import { Loading } from "@/components/hint";
import { getChartConfig, useConfiguratorState } from "@/configurator";
import { ChartAnnotationsSelector } from "@/configurator/components/chart-annotations-selector";
import { ChartConfigurator } from "@/configurator/components/chart-configurator";
import { ChartOptionsSelector } from "@/configurator/components/chart-options-selector";
import {
  ConfiguratorDrawer,
  DRAWER_WIDTH,
} from "@/configurator/components/drawer";
import {
  PanelBodyWrapper,
  PanelHeaderLayout,
  PanelHeaderWrapper,
  PanelLayout,
} from "@/configurator/components/layout";
import { ChartConfiguratorTable } from "@/configurator/table/table-chart-configurator";
import SvgIcChevronLeft from "@/icons/components/IcChevronLeft";
import { useDataSourceStore } from "@/stores/data-source";
import { InteractiveFiltersProvider } from "@/stores/interactive-filters";
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
      color="inherit"
      size="small"
      sx={{ fontWeight: "bold", ...sx }}
      startIcon={<SvgIcChevronLeft />}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

const isAnnotationField = (field: string | undefined) => {
  return field === "title" || field === "description";
};

const ConfigureChartStep = () => {
  const [state, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const { dataSource, setDataSource } = useDataSourceStore();

  const handleClosePanel = useEvent(() => {
    dispatch({
      type: "ACTIVE_FIELD_CHANGED",
      value: undefined,
    });
  });

  const router = useRouter();

  const handlePrevious = useEvent(() => {
    if (state.state !== "CONFIGURING_CHART") {
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

  React.useEffect(() => {
    if (
      state.state === "CONFIGURING_CHART" &&
      state.dataSource.url !== dataSource.url
    ) {
      setDataSource(state.dataSource);
    }
  }, [dataSource.url, setDataSource, state.dataSource, state.state]);

  if (state.state !== "CONFIGURING_CHART") {
    return null;
  }

  return (
    <InteractiveFiltersProvider>
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
            <ChartConfigurator state={state} />
          )}
        </PanelBodyWrapper>
        <PanelBodyWrapper type="M">
          <ChartPanel>
            <ChartPreview dataSource={state.dataSource} />
          </ChartPanel>
        </PanelBodyWrapper>
        <ConfiguratorDrawer
          anchor="left"
          open={!!chartConfig.activeField}
          hideBackdrop
          onClose={handleClosePanel}
        >
          <div style={{ width: DRAWER_WIDTH }} data-testid="panel-drawer">
            <BackContainer>
              <Button
                variant="text"
                color="inherit"
                size="small"
                sx={{ fontWeight: "bold" }}
                startIcon={<SvgIcChevronLeft />}
                onClick={handleClosePanel}
              >
                <Trans id="controls.nav.back-to-main">Back to main</Trans>
              </Button>
            </BackContainer>
            {isAnnotationField(chartConfig.activeField) ? (
              <ChartAnnotationsSelector state={state} />
            ) : (
              <ChartOptionsSelector state={state} />
            )}
          </div>
        </ConfiguratorDrawer>
      </PanelLayout>
    </InteractiveFiltersProvider>
  );
};

const LayoutingStep = () => {
  const [state, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const { dataSource, setDataSource } = useDataSourceStore();

  const handleClosePanel = useEvent(() => {
    dispatch({
      type: "ACTIVE_FIELD_CHANGED",
      value: undefined,
    });
  });

  const handlePrevious = useEvent(() => {
    if (state.state !== "LAYOUTING") {
      return;
    }
    dispatch({ type: "STEP_PREVIOUS" });
  });

  React.useEffect(() => {
    if (
      state.state === "LAYOUTING" &&
      state.dataSource.url !== dataSource.url
    ) {
      setDataSource(state.dataSource);
    }
  }, [dataSource.url, setDataSource, state.dataSource, state.state]);

  if (state.state !== "LAYOUTING") {
    return null;
  }

  return (
    <InteractiveFiltersProvider>
      <PanelLayout type="M" sx={{ background: "#eee" }}>
        <PanelHeaderLayout type="LMR" sx={{ background: "#fff" }}>
          <PanelHeaderWrapper type="L">
            <BackContainer>
              <BackButton onClick={handlePrevious}>
                <Trans id="controls.nav.back-to-configurator">
                  Back to configurator
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
            <Button>Tab layout</Button>
            <Button>Dashboard</Button>
            <Button>Single URLs</Button>
          </PanelHeaderWrapper>
          <PanelHeaderWrapper
            type="R"
            sx={{
              display: "flex",
              alignItems: "start",
              justifyContent: "flex-end",
            }}
          >
            <PublishChartButton />
          </PanelHeaderWrapper>
        </PanelHeaderLayout>
        <PanelBodyWrapper type="M">
          <Box sx={{ maxWidth: 980, mx: "auto" }}>
            <ChartPanel>
              <ChartPreview dataSource={state.dataSource} />
            </ChartPanel>
          </Box>
        </PanelBodyWrapper>
        <ConfiguratorDrawer
          anchor="left"
          open={!!chartConfig.activeField}
          hideBackdrop
          onClose={handleClosePanel}
        >
          <div style={{ width: DRAWER_WIDTH }} data-testid="panel-drawer">
            <BackContainer>
              <Button
                variant="text"
                color="inherit"
                size="small"
                sx={{ fontWeight: "bold" }}
                startIcon={<SvgIcChevronLeft />}
                onClick={handleClosePanel}
              >
                <Trans id="controls.nav.back-to-main">Back to main</Trans>
              </Button>
            </BackContainer>
          </div>
        </ConfiguratorDrawer>
      </PanelLayout>
    </InteractiveFiltersProvider>
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
        <ChartPanel>
          <InteractiveFiltersProvider>
            <ChartPreview dataSource={state.dataSource} />
          </InteractiveFiltersProvider>
        </ChartPanel>
      </PanelBodyWrapper>
    </PanelLayout>
  );
};

export const Configurator = () => {
  const { pathname } = useRouter();
  // Local state, the dataset preview doesn't need to be persistent.
  // FIXME: for a11y, "updateDataSetPreviewIri" should also move focus to "Weiter" button (?)
  const [{ state }] = useConfiguratorState();
  const isLoadingConfigureChartStep =
    state === "INITIAL" && pathname === "/create/[chartId]";

  return isLoadingConfigureChartStep ? (
    <LoadingConfigureChartStep />
  ) : state === "SELECTING_DATASET" ? (
    <SelectDatasetStep />
  ) : (
    <>
      {state === "CONFIGURING_CHART" && <ConfigureChartStep />}
      {state === "LAYOUTING" && <LayoutingStep />}
      {state === "PUBLISHING" && <PublishStep />}
    </>
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
