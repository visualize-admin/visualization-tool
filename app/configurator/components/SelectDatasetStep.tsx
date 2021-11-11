import React, { useMemo } from "react";
import { Box, Link, Text } from "theme-ui";
import { useDebounce } from "use-debounce";
import { useConfiguratorState } from "..";
import { ChartPanel } from "../../components/chart-panel";
import { DataSetHint } from "../../components/hint";
import {
  DataCubeOrganization,
  DataCubeTheme,
  useDataCubesQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../src";
import { DataSetMetadata } from "./dataset-metadata";
import { DataSetPreview } from "./dataset-preview";
import {
  SearchDatasetBox,
  SearchFilters,
  DatasetResults,
  useSearchQueryState,
  SearchStateProvider,
  useSearchContext,
} from "./dataset-search";
import {
  PanelHeader,
  PanelLayout,
  PanelLeftWrapper,
  PanelMiddleWrapper,
  PanelRightWrapper,
} from "./layout";
import { flag } from "./flag";
import Breadcrumbs from "./breadcrumbs";
import { BrowseParams } from "../../pages/browse";

const BreadcrumbFilter = ({
  breadcrumb,
  ...props
}: {
  breadcrumb: DataCubeTheme | DataCubeOrganization;
}) => {
  return (
    <Link variant="inline" {...props}>
      {breadcrumb.label}
    </Link>
  );
};

export const SelectDatasetStepV2Content = () => {
  const locale = useLocale();

  const searchQueryState = useSearchContext();
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
    <PanelLayout
      sx={{
        width: "100%",
        maxWidth: 1200,
        margin: "auto",
        left: 0,
        right: 0,
        position: "static",
        // FIXME replace 96px with actual header size
        marginTop: "96px",
        height: "auto",
      }}
    >
      <PanelLeftWrapper raised={false} sx={{ mt: 50 }}>
        <SearchFilters />
        {state.dataSet ? (
          <>
            <Box mb={4} px={4}>
              <Link
                variant="inline"
                onClick={(ev) => {
                  ev.preventDefault();
                  dispatch({
                    type: "DATASET_SELECTED",
                    dataSet: undefined,
                  });
                }}
              >
                Back to the list
              </Link>
            </Box>
            <DataSetMetadata dataSetIri={state.dataSet} />
          </>
        ) : null}
      </PanelLeftWrapper>
      <PanelMiddleWrapper
        sx={{
          gridColumnStart: "middle",
          gridColumnEnd: "right",
        }}
      >
        <Box sx={{ maxWidth: 900, margin: "auto" }}>
          <Text variant="heading1" sx={{ mb: 4 }}>
            {filters.length > 0
              ? filters[filters.length - 1].label
              : "Swiss Open Government Data"}
          </Text>
          {state.dataSet ? null : (
            <Box mb={4}>
              <>
                {/* {filters ? (
                  <Breadcrumbs
                    breadcrumbs={breadcrumbs}
                    Breadcrumb={BreadcrumbFilter}
                    onClickBreadcrumb={handleClickBreadcrumb}
                    mb={4}
                  />
                ) : null} */}
              </>
              <SearchDatasetBox
                searchQueryState={searchQueryState}
                searchResult={data}
              />
            </Box>
          )}
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
            <DatasetResults fetching={fetching} data={data} />
          )}
        </Box>
      </PanelMiddleWrapper>
    </PanelLayout>
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
    <PanelLayout>
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
    </PanelLayout>
  );
};

export const SelectDatasetStepV2 = ({ params }: { params?: BrowseParams }) => {
  return (
    <SearchStateProvider params={params}>
      <SelectDatasetStepV2Content />
    </SearchStateProvider>
  );
};

export const SelectDatasetStep = () => {
  return flag("selectdatasetsv2") ? (
    <SelectDatasetStepV2 />
  ) : (
    <SelectDatasetStepV1 />
  );
};
