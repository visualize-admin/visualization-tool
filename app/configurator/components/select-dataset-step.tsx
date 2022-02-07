import { t, Trans } from "@lingui/macro";
import Head from "next/head";
import NextLink from "next/link";
import { Router, useRouter } from "next/router";
import React, { useMemo } from "react";
import { Box, Button, Text } from "theme-ui";
import { useDebounce } from "use-debounce";
import { useDataCubesQuery } from "../../graphql/query-hooks";
import { useConfiguratorState, useLocale } from "../../src";
import {
  BrowseStateProvider,
  buildURLFromBrowseState,
  DataCubeAbout,
  DatasetResults,
  SearchDatasetBox,
  SearchFilters,
  useBrowseContext,
} from "./dataset-browse";
import { DataSetMetadata } from "./dataset-metadata";
import { DataSetPreview } from "./dataset-preview";
import { PanelLayout, PanelLeftWrapper, PanelMiddleWrapper } from "./layout";

const softJSONParse = (v: string) => {
  try {
    return JSON.parse(v);
  } catch (e) {
    return null;
  }
};

const formatBackLink = (
  query: Router["query"]
): React.ComponentProps<typeof NextLink>["href"] => {
  const backParameters = softJSONParse(query.previous as string);
  if (!backParameters) {
    return "/browse";
  }
  return buildURLFromBrowseState(backParameters);
};

export const SelectDatasetStepContent = () => {
  const locale = useLocale();

  const browseState = useBrowseContext();
  const { search, order, includeDrafts, filters, dataset } = browseState;

  const [configState] = useConfiguratorState();
  const [debouncedQuery] = useDebounce(search, 150, {
    leading: true,
  });
  const router = useRouter();
  const backLink = useMemo(() => {
    return formatBackLink(router.query);
  }, [router.query]);
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

  if (configState.state !== "SELECTING_DATASET") {
    return null;
  }
  return (
    <PanelLayout
      sx={{
        width: "100%",
        maxWidth: 1300,
        margin: "auto",
        left: 0,
        right: 0,
        position: "static",
        // FIXME replace 96px with actual header size
        marginTop: "96px",
        height: "auto",
        pt: 3,
      }}
    >
      <PanelLeftWrapper
        raised={false}
        sx={{ pt: "1.25rem", bg: "transparent" }}
      >
        {dataset ? (
          <>
            <Box px={4}>
              <NextLink passHref href={backLink}>
                <Button variant="secondary">
                  ←{" "}
                  <Trans id="dataset-preview.back-to-results">
                    Back to the list
                  </Trans>
                </Button>
              </NextLink>
            </Box>
            <DataSetMetadata sx={{ mt: "3rem" }} dataSetIri={dataset} />
          </>
        ) : (
          <SearchFilters />
        )}
      </PanelLeftWrapper>
      <PanelMiddleWrapper
        sx={{
          gridColumnStart: "middle",
          gridColumnEnd: "right",
        }}
      >
        <Box sx={{ maxWidth: 900 }}>
          {dataset ? null : filters.length > 0 ? (
            filters
              .filter(
                (f): f is Exclude<typeof f, DataCubeAbout> =>
                  f.__typename !== "DataCubeAbout"
              )
              .map((f) => f.label)
              .join(", ")
          ) : (
            <>
              <Text
                variant="heading1"
                color="monochrome800"
                mb={4}
                sx={{ display: "block" }}
              >
                <Trans id="browse.datasets.all-datasets">All datasets</Trans>
              </Text>
              <Text
                variant="paragraph1"
                color="monochrome800"
                sx={{
                  mb: 4,
                  maxWidth: 800,
                  fontWeight: "light",
                  display: "block",
                }}
              >
                <Trans id="browse.datasets.description">
                  Explore datasets provided by the LINDAS Linked Data Service by
                  either filtering by categories or organisations or search
                  directly for specific keywords. Click on a dataset to see more
                  detailed information and start creating your own
                  visualizations.
                </Trans>
              </Text>
            </>
          )}
          {dataset ? null : (
            <Box mb={4}>
              <SearchDatasetBox browseState={browseState} searchResult={data} />
            </Box>
          )}
          {dataset ? (
            <>
              <Box>
                <DataSetPreview dataSetIri={dataset} />
              </Box>
            </>
          ) : (
            <DatasetResults fetching={fetching} data={data} />
          )}
        </Box>
      </PanelMiddleWrapper>
    </PanelLayout>
  );
};

const PageTitle = () => {
  const { search, filters } = useBrowseContext();
  return (
    <Head>
      <title key="title">
        {search
          ? `"${search}"`
          : filters?.length > 0 && filters[0].__typename !== "DataCubeAbout"
          ? filters[0].label
          : t({ id: "browse.datasets.all-datasets" })}{" "}
        - visualize.admin.ch
      </title>
    </Head>
  );
};

export const SelectDatasetStep = () => {
  return (
    <BrowseStateProvider>
      <PageTitle />
      <SelectDatasetStepContent />
    </BrowseStateProvider>
  );
};
