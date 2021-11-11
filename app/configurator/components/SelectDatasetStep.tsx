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
} from "./dataset-search";
import {
  PanelLeftWrapper,
  PanelMiddleWrapper,
  PanelRightWrapper,
} from "./layout";
import { flag } from "./flag";
import Breadcrumbs from "./breadcrumbs";

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

export const SelectDatasetStepV2 = () => {
  const locale = useLocale();

  const searchQueryState = useSearchQueryState();
  const { query, order, includeDrafts, filters, setFilters } = searchQueryState;

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

  const breadcrumbs = useMemo(() => {
    return [{ label: "Datasets", __typename: "Root" }, ...filters];
  }, [filters]);

  const handleClickBreadcrumb = (breadcrumbIndex: number) => {
    // breadcrumbs are in the form [rootNode, ...filters], this is why
    // we need to substract 1 to breadcrumb index to get the filter index.
    const filterIndex = breadcrumbIndex - 1;
    if (filterIndex === filters.length - 1) {
      setFilters([filters[filterIndex]]);
    } else {
      setFilters(filters.slice(0, filterIndex + 1));
    }
  };

  if (state.state !== "SELECTING_DATASET") {
    return null;
  }
  return (
    <>
      {state.dataSet ? null : (
        <PanelLeftWrapper raised={false}>
          <SearchFilters searchQueryState={searchQueryState} />
        </PanelLeftWrapper>
      )}
      <PanelMiddleWrapper
        sx={
          state.dataSet
            ? {
                gridRowStart: "left",
                gridRowEnd: "right",
                gridColumnStart: "left",
                gridColumnEnd: "middle",
                height: "auto",
              }
            : undefined
        }
      >
        <Box sx={{ maxWidth: 1200, margin: "auto" }}>
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
        </Box>
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
