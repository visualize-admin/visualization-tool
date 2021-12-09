import { Trans } from "@lingui/macro";
import NextLink from "next/link";
import React from "react";
import { Link } from "theme-ui";
import { ConfiguratorState, useConfiguratorState } from "..";
import { ChartPanel } from "../../components/chart-panel";
import { ChartPreview } from "../../components/chart-preview";
import Stack from "../../components/Stack";
import { useDataCubeMetadataQuery } from "../../graphql/query-hooks";
import { useLocale } from "../../src";
import { ChartConfiguratorTable } from "../table/table-chart-configurator";
import { ChartAnnotationsSelector } from "./chart-annotations-selector";
import { ChartAnnotator } from "./chart-annotator";
import { ChartConfigurator } from "./chart-configurator";
import { SectionTitle } from "./chart-controls/section";
import { ChartOptionsSelector } from "./chart-options-selector";
import { ChartTypeSelector } from "./chart-type-selector";
import {
  PanelHeader,
  PanelLayout,
  PanelLeftWrapper,
  PanelMiddleWrapper,
  PanelRightWrapper,
} from "./layout";
import { SelectDatasetStep } from "./select-dataset-step";
import { Stepper } from "./stepper";

const DatasetSelector = ({ state }: { state: ConfiguratorState }) => {
  const locale = useLocale();
  const [{ data: metaData }] = useDataCubeMetadataQuery({
    variables: { iri: state.dataSet || "", locale },
    pause: !state.dataSet,
  });
  return (
    <div>
      <SectionTitle>Dataset</SectionTitle>
      {metaData ? (
        <Stack direction="column" mx={4} spacing={2}>
          <div>{metaData.dataCubeByIri?.title}</div>
          <div>
            <NextLink href="/browse" passHref>
              <Link variant="primary" sx={{ fontSize: 3 }}>
                <Trans id="dataset-selector.choose-another-dataset">
                  Choose another dataset
                </Trans>
              </Link>
            </NextLink>
          </div>
        </Stack>
      ) : null}
    </div>
  );
};

const SelectChartTypeStep = () => {
  const [state] = useConfiguratorState();
  if (state.state !== "SELECTING_CHART_TYPE") {
    return null;
  }
  return (
    <>
      <PanelLeftWrapper>
        <Stack spacing={2} direction="column">
          <DatasetSelector state={state} />
          <ChartTypeSelector state={state} />
        </Stack>
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

  return state.state === "SELECTING_DATASET" ? (
    <SelectDatasetStep />
  ) : (
    <PanelLayout>
      <PanelHeader>
        <Stepper dataSetIri={state.dataSet} />
      </PanelHeader>
      {state.state === "SELECTING_CHART_TYPE" ? <SelectChartTypeStep /> : null}
      {state.state === "CONFIGURING_CHART" ? <ConfigureChartStep /> : null}
      {state.state === "DESCRIBING_CHART" ? <DescribeChartStep /> : null}
      {state.state === "PUBLISHING" ? <PublishStep /> : null}
    </PanelLayout>
  );
};
