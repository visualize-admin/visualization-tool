import { t, Trans } from "@lingui/macro";
import { Box, Button, Typography } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import Head from "next/head";
import NextLink from "next/link";
import { Router, useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";
import ParsingClient from "sparql-http-client/ParsingClient";
import { useDebounce } from "use-debounce";

import { useDataSource } from "@/components/data-source-menu";
import { Footer } from "@/components/footer";
import {
  BrowseStateProvider,
  buildURLFromBrowseState,
  DataCubeAbout,
  DatasetResults,
  SearchDatasetBox,
  SearchFilters,
  useBrowseContext,
} from "@/configurator/components/dataset-browse";
import { DataSetMetadata } from "@/configurator/components/dataset-metadata";
import { DataSetPreview } from "@/configurator/components/dataset-preview";
import {
  PanelLayout,
  PanelLeftWrapper,
  PanelMiddleWrapper,
} from "@/configurator/components/layout";
import {
  MotionBox,
  navPresenceProps,
} from "@/configurator/components/presence";
import { useDataCubesQuery } from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { queryLatestPublishedCubeFromUnversionedIri } from "@/rdf/query-cube-metadata";
import { useConfiguratorState, useLocale } from "@/src";
import { getQueryParams } from "@/utils/flashes";

const softJSONParse = (v: string) => {
  try {
    return JSON.parse(v);
  } catch (e) {
    return null;
  }
};

export const formatBackLink = (
  query: Router["query"]
): React.ComponentProps<typeof NextLink>["href"] => {
  const backParameters = softJSONParse(query.previous as string);
  if (!backParameters) {
    return "/browse";
  }
  return buildURLFromBrowseState(backParameters);
};

/**
 * Heuristic to check if a dataset IRI is versioned.
 * Versioned iris look like https://blabla/<number/
 */
const isDatasetIriVersioned = (iri: string) => {
  return iri.match(/\/\d+\/?$/) !== null;
};

export const SelectDatasetStepContent = () => {
  const [dataSource] = useDataSource();
  const locale = useLocale();

  const browseState = useBrowseContext();
  const { search, order, includeDrafts, filters, dataset } = browseState;

  const [configState] = useConfiguratorState();
  const [debouncedQuery] = useDebounce(search, 500, {
    leading: true,
  });
  const router = useRouter();
  const backLink = useMemo(() => {
    return formatBackLink(router.query);
  }, [router.query]);
  // Use the debounced query value here only!
  const [datacubesQuery] = useDataCubesQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
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

  useEffect(() => {
    const run = async () => {
      if (
        dataset !== null &&
        !Array.isArray(dataset) &&
        !isDatasetIriVersioned(dataset)
      ) {
        const sparqlClient = new ParsingClient({ endpointUrl: dataSource.url });
        const resp = await queryLatestPublishedCubeFromUnversionedIri(
          sparqlClient,
          dataset
        );

        if (!resp) {
          router.replace({
            pathname: `/?${getQueryParams("CANNOT_FIND_CUBE", {
              iri: dataset,
            })}`,
          });
        }
      }
    };

    run();
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
        pt: "55px",
      }}
    >
      <PanelLeftWrapper
        raised={false}
        sx={{ backgroundColor: "transparent", paddingTop: 0 }}
      >
        <AnimatePresence exitBeforeEnter>
          {dataset ? (
            <MotionBox
              {...navPresenceProps}
              px={4}
              key="dataset-metadata"
              custom={dataset}
            >
              <NextLink passHref href={backLink}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Icon name="chevronLeft" size={12} />}
                >
                  <Trans id="dataset-preview.back-to-results">
                    Back to the list
                  </Trans>
                </Button>
              </NextLink>
              <DataSetMetadata sx={{ mt: "3rem" }} dataSetIri={dataset} />
            </MotionBox>
          ) : (
            <MotionBox
              key="search-filters"
              {...navPresenceProps}
              custom={false}
            >
              <SearchFilters data={datacubesQuery.data} />
            </MotionBox>
          )}
        </AnimatePresence>
      </PanelLeftWrapper>
      <PanelMiddleWrapper
        sx={{
          pt: 0,
          pl: 6,
          gridColumnStart: "middle",
          gridColumnEnd: "right",
        }}
      >
        <Box sx={{ maxWidth: 900 }}>
          <AnimatePresence exitBeforeEnter>
            {dataset ? (
              <MotionBox {...navPresenceProps} key="preview">
                <DataSetPreview dataSetIri={dataset} />
              </MotionBox>
            ) : (
              <MotionBox {...navPresenceProps}>
                {filters.length > 0 ? (
                  <Typography
                    key="filters"
                    variant="h1"
                    color="grey.800"
                    mb={4}
                    sx={{ display: "block" }}
                  >
                    {filters
                      .filter(
                        (f): f is Exclude<typeof f, DataCubeAbout> =>
                          f.__typename !== "DataCubeAbout"
                      )
                      .map((f) => f.label)
                      .join(", ")}
                  </Typography>
                ) : (
                  <>
                    <Typography
                      key="all-datasets"
                      variant="h1"
                      color="grey.800"
                      mb={4}
                      sx={{ display: "block" }}
                    >
                      <Trans id="browse.datasets.all-datasets">
                        All datasets
                      </Trans>
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={400}
                      color="grey.800"
                      sx={{
                        mb: 4,
                        maxWidth: 800,
                        display: "block",
                      }}
                    >
                      <Trans id="browse.datasets.description">
                        Explore datasets provided by the LINDAS Linked Data
                        Service by either filtering by categories or
                        organisations or search directly for specific keywords.
                        Click on a dataset to see more detailed information and
                        start creating your own visualizations.
                      </Trans>
                    </Typography>
                  </>
                )}
                <Box mb={1} key="search-box">
                  <SearchDatasetBox
                    browseState={browseState}
                    searchResult={datacubesQuery.data}
                  />
                </Box>
                <DatasetResults key="results" query={datacubesQuery} />
              </MotionBox>
            )}
          </AnimatePresence>
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
      <Box
        sx={{
          borderTop: "2px solid rgba(0,0,0,0.05)",
          mt: 8,
        }}
      >
        <Footer
          sx={{
            borderTopWidth: 0,
            ml: "auto",
            mr: "auto",
            width: "100%",
          }}
        />
      </Box>
    </BrowseStateProvider>
  );
};
