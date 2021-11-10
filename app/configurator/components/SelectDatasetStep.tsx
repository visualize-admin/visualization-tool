import React from "react";
import { Box } from "theme-ui";
import { useDebounce } from "use-debounce";
import { useConfiguratorState } from "..";
import { ChartPanel } from "../../components/chart-panel";
import { DataSetHint } from "../../components/hint";
import { useDataCubesQuery } from "../../graphql/query-hooks";
import { useLocale } from "../../src";
import { DataSetMetadata } from "./dataset-metadata";
import { DataSetPreview } from "./dataset-preview";
import {
  SearchDatasetBox,
  SearchFilters,
  DatasetResults,
  useSearchQueryState,
} from "./dataset-search";
import {
  PanelLeftWrapper,
  PanelMiddleWrapper,
  PanelRightWrapper,
} from "./layout";
import { TextLink } from "./configurator";
import { fallbackExchange } from "@urql/core/dist/types/exchanges/fallback";
import { flag } from "./flag";

export const SelectDatasetStepV2 = () => {
  const locale = useLocale();

  const searchQueryState = useSearchQueryState();
  const { query, order, includeDrafts, filters } = searchQueryState;

  const [state, dispatch] = useConfiguratorState();
  const [debouncedQuery] = useDebounce(query, 150, {
    leading: true,
  });

  // Use the debounced query value here only!
  const [{ fetching, data }] = useDataCubesQuery({
    variables: {
      locale,
      query: debouncedQuery,
      order,
      includeDrafts,
      filters: filters
        ? filters.map((filter) => {
            return { type: filter.__typename, value: filter.iri };
          })
        : [],
    },
  });

  if (state.state !== "SELECTING_DATASET") {
    return null;
  }
  return (
    <>
      <PanelLeftWrapper>
        <SearchFilters searchQueryState={searchQueryState} />
      </PanelLeftWrapper>
      <PanelMiddleWrapper>
        {state.dataSet ? null : (
          <Box mb={4}>
            <SearchDatasetBox
              searchQueryState={searchQueryState}
              searchResult={data}
            />
          </Box>
        )}
        {state.dataSet || !data ? (
          <>
            <Box mb={4} px={4}>
              <TextLink
                onClick={(ev) => {
                  ev.preventDefault();
                  dispatch({
                    type: "DATASET_SELECTED",
                    dataSet: undefined,
                  });
                }}
              >
                Back to the list
              </TextLink>
            </Box>
            <ChartPanel>
              {state.dataSet ? (
                <>
                  <DataSetPreview dataSetIri={state.dataSet} />
                </>
              ) : (
                <DataSetHint />
              )}
            </ChartPanel>
          </>
        ) : (
          <ChartPanel>
            <div>
              <DatasetResults fetching={fetching} data={data} />
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

export const SelectDatasetStepV1 = () => {
  const locale = useLocale();

  const searchQueryState = useSearchQueryState();
  const { query, order, includeDrafts, filters } = searchQueryState;

  const [state, dispatch] = useConfiguratorState();
  const [debouncedQuery] = useDebounce(query, 150, {
    leading: true,
  });

  // Use the debounced query value here only!
  const [{ fetching, data }] = useDataCubesQuery({
    variables: {
      locale,
      query: debouncedQuery,
      order,
      includeDrafts,
      filters: filters
        ? filters.map((filter) => {
            return { type: filter.__typename, value: filter.iri };
          })
        : [],
    },
  });

  if (state.state !== "SELECTING_DATASET") {
    return null;
  }
  return (
    <>
      <PanelLeftWrapper>
        <Box mb={4}>
          <SearchDatasetBox
            searchQueryState={searchQueryState}
            searchResult={data}
          />
        </Box>
        <DatasetResults
          fetching={fetching}
          data={data}
          resultProps={{
            showTags: false,
          }}
        />
      </PanelLeftWrapper>
      <PanelMiddleWrapper>
        {state.dataSet || !data ? (
          <>
            <ChartPanel>
              {state.dataSet ? (
                <>
                  <DataSetPreview dataSetIri={state.dataSet} />
                </>
              ) : (
                <DataSetHint />
              )}
            </ChartPanel>
          </>
        ) : (
          <ChartPanel>
            <DataSetHint />
          </ChartPanel>
        )}
      </PanelMiddleWrapper>
      <PanelRightWrapper>
        {state.dataSet ? <DataSetMetadata dataSetIri={state.dataSet} /> : null}
      </PanelRightWrapper>
    </>
  );
};

export const SelectDatasetStep = () => {
  return flag("selectdatasetsv2") ? (
    <SelectDatasetStepV2 />
  ) : (
    <SelectDatasetStepV1 />
  );
};
