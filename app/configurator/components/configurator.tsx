import { Trans } from "@lingui/macro";
import Box from "@mui/material/Box";
import Button, { ButtonProps } from "@mui/material/Button";
import { useRouter } from "next/router";
import React from "react";

import { SelectDatasetStep } from "@/browser/select-dataset-step";
import { ChartPanelConfigurator } from "@/components/chart-panel";
import { ChartPreview } from "@/components/chart-preview";
import { HEADER_HEIGHT } from "@/components/header";
import { Loading } from "@/components/hint";
import { useConfiguratorState } from "@/configurator";
import { ChartAnnotationsSelector } from "@/configurator/components/chart-annotations-selector";
import { ChartConfigurator } from "@/configurator/components/chart-configurator";
import { ChartOptionsSelector } from "@/configurator/components/chart-options-selector";
import {
  ConfiguratorDrawer,
  DRAWER_WIDTH,
} from "@/configurator/components/drawer";
import {
  PanelLayout,
  PanelLeftWrapper,
  PanelMiddleWrapper,
} from "@/configurator/components/layout";
import { ChartConfiguratorTable } from "@/configurator/table/table-chart-configurator";
import SvgIcChevronLeft from "@/icons/components/IcChevronLeft";
import { useDataSourceStore } from "@/stores/data-source";
import useEvent from "@/utils/use-event";

const BackContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        px: 2,
        minHeight: 78,
        display: "flex",
        alignItems: "center",
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
          dataset: state.dataSet,
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
    <>
      <PanelLeftWrapper
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
        {state.chartConfig.chartType === "table" ? (
          <ChartConfiguratorTable state={state} />
        ) : (
          <ChartConfigurator state={state} />
        )}
      </PanelLeftWrapper>
      <PanelMiddleWrapper>
        <ChartPanelConfigurator>
          <ChartPreview
            dataSetIri={state.dataSet}
            dataSource={state.dataSource}
          />
        </ChartPanelConfigurator>
      </PanelMiddleWrapper>
      <ConfiguratorDrawer
        anchor="left"
        open={!!state.activeField}
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
          {isAnnotationField(state.activeField) ? (
            <ChartAnnotationsSelector state={state} />
          ) : (
            <ChartOptionsSelector state={state} />
          )}
        </div>
      </ConfiguratorDrawer>
    </>
  );
};

const PublishStep = () => {
  const [state] = useConfiguratorState();

  if (state.state !== "PUBLISHING") {
    return null;
  }

  return (
    <PanelMiddleWrapper>
      <ChartPanelConfigurator>
        <ChartPreview
          dataSetIri={state.dataSet}
          dataSource={state.dataSource}
        />
      </ChartPanelConfigurator>
    </PanelMiddleWrapper>
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
    <PanelLayout>
      {state === "CONFIGURING_CHART" ? <ConfigureChartStep /> : null}
      {state === "PUBLISHING" ? <PublishStep /> : null}
    </PanelLayout>
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
