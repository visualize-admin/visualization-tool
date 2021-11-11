import React from "react";
import { Box, BoxOwnProps, BoxProps, Link, LinkProps } from "theme-ui";
import { useConfiguratorState } from "..";
import { ChartPanel } from "../../components/chart-panel";
import { ChartPreview } from "../../components/chart-preview";
import { ChartConfiguratorTable } from "../table/table-chart-configurator";
import { ChartAnnotationsSelector } from "./chart-annotations-selector";
import { ChartAnnotator } from "./chart-annotator";
import { ChartConfigurator } from "./chart-configurator";
import { ChartOptionsSelector } from "./chart-options-selector";
import { ChartTypeSelector } from "./chart-type-selector";
import {
  PanelHeader,
  PanelLayout,
  PanelLeftWrapper,
  PanelMiddleWrapper,
  PanelRightWrapper,
} from "./layout";
import { SelectDatasetStep } from "./SelectDatasetStep";
import { Stepper } from "./stepper";

const SelectChartTypeStep = () => {
  const [state] = useConfiguratorState();
  if (state.state !== "SELECTING_CHART_TYPE") {
    return null;
  }
  return (
    <>
      <PanelLeftWrapper>
        <ChartTypeSelector state={state} />
      </PanelLeftWrapper>
      <PanelMiddleWrapper>
        <ChartPanel>
          <ChartPreview dataSetIri={state.dataSet} />
        </ChartPanel>
      </PanelMiddleWrapper>
      <PanelRightWrapper />
    </>
  );
};

const ConfigureChartStep = () => {
  const [state] = useConfiguratorState();
  if (state.state !== "CONFIGURING_CHART") {
    return null;
  }
  return (
    <>
      <PanelLeftWrapper>
        {state.chartConfig.chartType === "table" ? (
          <ChartConfiguratorTable state={state} />
        ) : (
          <ChartConfigurator state={state} />
        )}
      </PanelLeftWrapper>
      <PanelMiddleWrapper>
        <ChartPanel>
          <ChartPreview dataSetIri={state.dataSet} />
        </ChartPanel>
      </PanelMiddleWrapper>
      <PanelRightWrapper>
        <ChartOptionsSelector state={state} />
      </PanelRightWrapper>
    </>
  );
};

const DescribeChartStep = () => {
  const [state] = useConfiguratorState();
  if (state.state !== "DESCRIBING_CHART") {
    return null;
  }
  return (
    <>
      <PanelLeftWrapper>
        <ChartAnnotator state={state} />
      </PanelLeftWrapper>
      <PanelMiddleWrapper>
        <ChartPanel>
          <ChartPreview dataSetIri={state.dataSet} />
        </ChartPanel>
      </PanelMiddleWrapper>
      <PanelRightWrapper>
        <ChartAnnotationsSelector state={state} />
      </PanelRightWrapper>
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
        <ChartPanel>
          <ChartPreview dataSetIri={state.dataSet} />
        </ChartPanel>
      </PanelMiddleWrapper>
    </>
  );
};

export const Configurator = () => {
  // Local state, the dataset preview doesn't need to be persistent.
  // FIXME: for a11y, "updateDataSetPreviewIri" should also move focus to "Weiter" button (?)
  const [state] = useConfiguratorState();

  return (
    <PanelLayout>
      {state.state === "SELECTING_DATASET" ? null : (
        <PanelHeader>
          <Stepper dataSetIri={state.dataSet} />
        </PanelHeader>
      )}
      {state.state === "SELECTING_DATASET" ? <SelectDatasetStep /> : null}
      {state.state === "SELECTING_CHART_TYPE" ? <SelectChartTypeStep /> : null}
      {state.state === "CONFIGURING_CHART" ? <ConfigureChartStep /> : null}
      {state.state === "DESCRIBING_CHART" ? <DescribeChartStep /> : null}
      {state.state === "PUBLISHING" ? <PublishStep /> : null}
    </PanelLayout>
  );
};
