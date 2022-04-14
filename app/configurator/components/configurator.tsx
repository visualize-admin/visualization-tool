import { ChartPanel } from "@/components/chart-panel";
import { ChartPreview } from "@/components/chart-preview";
import { useConfiguratorState } from "@/configurator";
import { ChartAnnotationsSelector } from "@/configurator/components/chart-annotations-selector";
import { ChartAnnotator } from "@/configurator/components/chart-annotator";
import { ChartConfigurator } from "@/configurator/components/chart-configurator";
import { ChartOptionsSelector } from "@/configurator/components/chart-options-selector";
import { ChartTypeSelector } from "@/configurator/components/chart-type-selector";
import {
  PanelHeader,
  PanelLayout,
  PanelLeftWrapper,
  PanelMiddleWrapper,
  PanelRightWrapper,
} from "@/configurator/components/layout";
import { SelectDatasetStep } from "@/configurator/components/select-dataset-step";
import { Stepper } from "@/configurator/components/stepper";
import { ChartConfiguratorTable } from "@/configurator/table/table-chart-configurator";
import React from "react";

const ConfigureChartStep = () => {
  const [state] = useConfiguratorState();
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
        <ChartTypeSelector state={state} />
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

  return state.state === "SELECTING_DATASET" ? (
    <SelectDatasetStep />
  ) : (
    <PanelLayout>
      <PanelHeader>
        <Stepper dataSetIri={state.dataSet} />
      </PanelHeader>
      {state.state === "CONFIGURING_CHART" ? <ConfigureChartStep /> : null}
      {state.state === "DESCRIBING_CHART" ? <DescribeChartStep /> : null}
      {state.state === "PUBLISHING" ? <PublishStep /> : null}
    </PanelLayout>
  );
};
