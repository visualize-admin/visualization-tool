import { Trans } from "@lingui/macro";
import Box from "@mui/material/Box";
import Button, { ButtonProps } from "@mui/material/Button";
import { useRouter } from "next/router";
import React from "react";

import { ChartPanelConfigurator } from "@/components/chart-panel";
import { ChartPreview } from "@/components/chart-preview";
import { useConfiguratorState } from "@/configurator";
import { ChartAnnotationsSelector } from "@/configurator/components/chart-annotations-selector";
import { ChartConfigurator } from "@/configurator/components/chart-configurator";
import { ConfiguratorDrawer } from "@/configurator/components/drawer";
import {
  PanelLayout,
  PanelLeftWrapper,
  PanelMiddleWrapper,
} from "@/configurator/components/layout";
import { SelectDatasetStep } from "@/configurator/components/select-dataset-step";
import { ChartConfiguratorTable } from "@/configurator/table/table-chart-configurator";
import SvgIcChevronLeft from "@/icons/components/IcChevronLeft";
import useEvent from "@/utils/use-event";

import { InteractiveFiltersOptions } from "../interactive-filters/interactive-filters-config-options";
import { isInteractiveFilterType } from "../interactive-filters/interactive-filters-configurator";

import { ChartAnnotator } from "./chart-annotator";
import { ChartOptionsSelector } from "./chart-options-selector";

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

const BackButton = ({
  children,
  onClick,
}: { children: React.ReactNode } & ButtonProps) => {
  return (
    <Button
      variant="text"
      color="inherit"
      size="small"
      sx={{ fontWeight: "bold" }}
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
          <>
            <ChartConfigurator state={state} />
            <ChartAnnotator state={state} />
          </>
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
        <div style={{ width: 319 }} data-testid="panel-drawer">
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
          ) : isInteractiveFilterType(state.activeField) ? (
            <InteractiveFiltersOptions state={state} />
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
    <>
      <PanelMiddleWrapper>
        <ChartPanelConfigurator>
          <ChartPreview
            dataSetIri={state.dataSet}
            dataSource={state.dataSource}
          />
        </ChartPanelConfigurator>
      </PanelMiddleWrapper>
    </>
  );
};

export const Configurator = () => {
  // Local state, the dataset preview doesn't need to be persistent.
  // FIXME: for a11y, "updateDataSetPreviewIri" should also move focus to "Weiter" button (?)
  const [state] = useConfiguratorState();

  return state.state === "SELECTING_DATASET" ? (
    <SelectDatasetStep />
  ) : (
    <PanelLayout>
      {state.state === "CONFIGURING_CHART" ? <ConfigureChartStep /> : null}
      {state.state === "PUBLISHING" ? <PublishStep /> : null}
    </PanelLayout>
  );
};
