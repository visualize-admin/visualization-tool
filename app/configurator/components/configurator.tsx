import React, { useRef, useState } from "react";
import { Box } from "theme-ui";
import { useDebounce } from "use-debounce";
import { ChartConfig, ConfiguratorState, useConfiguratorState } from "..";
import { ChartPanel } from "../../components/chart-panel";
import { ChartPreview } from "../../components/chart-preview";
import { DataSetHint } from "../../components/hint";
import {
  DataCubeResultOrder,
  useDataCubesQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../src";
import { ChartConfiguratorTable } from "../table/table-chart-configurator";
import { ChartAnnotationsSelector } from "./chart-annotations-selector";
import { ChartAnnotator } from "./chart-annotator";
import { ChartConfigurator } from "./chart-configurator";
import { ChartOptionsSelector } from "./chart-options-selector";
import { ChartTypeSelector } from "./chart-type-selector";
import { DataSetMetadata } from "./dataset-metadata";
import { DataSetPreview } from "./dataset-preview";
import { DatasetSearch, Datasets } from "./dataset-selector";
import {
  PanelLeftWrapper,
  PanelMiddleWrapper,
  PanelRightWrapper,
} from "./layout";
import { Stepper } from "./stepper";

const useFilterState = () => {
  const [query, setQuery] = useState<string>("");

  const [order, setOrder] = useState<DataCubeResultOrder>(
    DataCubeResultOrder.TitleAsc
  );
  const previousOrderRef = useRef<DataCubeResultOrder>(
    DataCubeResultOrder.TitleAsc
  );

  return {
    onReset: () => {
      setQuery("");
      setOrder(previousOrderRef.current);
    },
    onTypeQuery: (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.currentTarget.value);
      if (query === "" && e.currentTarget.value !== "") {
        previousOrderRef.current = order;
        setOrder(DataCubeResultOrder.Score);
      }
      if (query !== "" && e.currentTarget.value === "") {
        setOrder(previousOrderRef.current);
      }
    },
    query,
    order,
    onSetOrder: (order: DataCubeResultOrder) => {
      previousOrderRef.current = order;
      setOrder(order);
    },
  };
};

const SelectDatasetStep = () => {
  const locale = useLocale();

  const [showDraftCheckbox, setShowDraftCheckbox] = useState<boolean>(false);
  const [includeDrafts, setIncludeDrafts] = useState<boolean>(false);
  const { onReset, onTypeQuery, query, order, onSetOrder } = useFilterState();

  const [state] = useConfiguratorState();
  const [debouncedQuery] = useDebounce(query, 150, { leading: true });
  console.log({ query, debouncedQuery });

  // Use the debounced query value here only!
  const [{ fetching, data }] = useDataCubesQuery({
    variables: { locale, query: debouncedQuery, order, includeDrafts },
  });

  if (state.state !== "SELECTING_DATASET") {
    return null;
  }
  return (
    <>
      <PanelLeftWrapper>
        <DatasetSearch
          query={query}
          onTypeQuery={onTypeQuery}
          onReset={onReset}
          includeDrafts={includeDrafts}
          setIncludeDrafts={setIncludeDrafts}
          showDraftCheckbox={showDraftCheckbox}
          setShowDraftCheckbox={setShowDraftCheckbox}
          order={order}
          onSetOrder={onSetOrder}
        />
      </PanelLeftWrapper>
      <PanelMiddleWrapper>
        {state.dataSet || !data ? (
          <ChartPanel>
            {state.dataSet ? (
              <>
                <DataSetPreview dataSetIri={state.dataSet} />
              </>
            ) : (
              <DataSetHint />
            )}
          </ChartPanel>
        ) : (
          <ChartPanel>
            <div>
              <Datasets fetching={fetching} data={data} />
            </div>
          </ChartPanel>
        )}
      </PanelMiddleWrapper>
      <PanelRightWrapper>
        {state.dataSet ? <DataSetMetadata dataSetIri={state.dataSet} /> : null}
      </PanelRightWrapper>
    </>
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
    <Box
      bg="muted"
      sx={{
        display: "grid",
        gridTemplateColumns:
          "minmax(12rem, 20rem) minmax(22rem, 1fr) minmax(12rem, 20rem)",
        gridTemplateRows: "auto minmax(0, 1fr)",
        gridTemplateAreas: `
        "header header header"
        "left middle right"
        `,
        width: "100%",
        position: "fixed",
        // FIXME replace 96px with actual header size
        top: "96px",
        height: "calc(100vh - 96px)",
      }}
    >
      <Box as="section" role="navigation" sx={{ gridArea: "header" }}>
        <Stepper dataSetIri={state.dataSet} />
      </Box>
      {state.state === "SELECTING_DATASET" ? <SelectDatasetStep /> : null}
      {state.state === "SELECTING_CHART_TYPE" ? <SelectChartTypeStep /> : null}
      {state.state === "CONFIGURING_CHART" ? <ConfigureChartStep /> : null}
      {state.state === "DESCRIBING_CHART" ? <DescribeChartStep /> : null}
      {state.state === "PUBLISHING" ? <PublishStep /> : null}
    </Box>
  );
};
