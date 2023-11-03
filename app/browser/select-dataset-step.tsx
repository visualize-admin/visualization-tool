import { t, Trans } from "@lingui/macro";
import { Box, Button, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { AnimatePresence } from "framer-motion";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import Head from "next/head";
import NextLink from "next/link";
import { Router, useRouter } from "next/router";
import React, { useMemo } from "react";
import { useDebounce } from "use-debounce";

import {
  DatasetResults,
  SearchDatasetControls,
  SearchDatasetInput,
  SearchFilters,
} from "@/browser/dataset-browse";
import { DataSetPreview } from "@/browser/dataset-preview";
import { DataSetMetadata } from "@/components/dataset-metadata";
import Flex from "@/components/flex";
import { Footer } from "@/components/footer";
import {
  BANNER_HEIGHT,
  BANNER_MARGIN_TOP,
  bannerPresenceProps,
  DURATION,
  MotionBox,
  navPresenceProps,
  smoothPresenceProps,
} from "@/components/presence";
import {
  PanelLayout,
  PanelLeftWrapper,
  PanelMiddleWrapper,
} from "@/configurator/components/layout";
import { truthy } from "@/domain/types";
import {
  DataCubeOrganization,
  DataCubeTheme,
  useSearchCubesQuery,
} from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { useConfiguratorState, useLocale } from "@/src";

import { useRedirectToVersionedCube } from "../components/use-redirect-to-versioned-cube";

import {
  BrowseStateProvider,
  buildURLFromBrowseState,
  useBrowseContext,
} from "./context";
import { BrowseFilter, DataCubeAbout } from "./filters";

const softJSONParse = (v: string) => {
  try {
    return JSON.parse(v);
  } catch (e) {
    return null;
  }
};

const useStyles = makeStyles<Theme, { datasetPresent: boolean }>((theme) => ({
  panelLayout: {
    maxWidth: 1400,
    margin: "auto",
    position: "static",
    marginTop: ({ datasetPresent }) => (datasetPresent ? 96 : 0),
    height: "auto",
    transition: "margin-top 0.5s ease",
  },
  panelLeft: {
    // To prevent weird look when dataset metadata is loading
    minHeight: "calc(100vh - 96px)",
    backgroundColor: "transparent",
    paddingTop: ({ datasetPresent }) =>
      datasetPresent ? 48 : theme.spacing(5),
    boxShadow: "none",
    borderRightColor: theme.palette.grey[300],
    borderRightStyle: "solid",
    borderRightWidth: 1,
    transition: "padding-top 0.5s ease",
  },
  panelMiddle: {
    paddingTop: ({ datasetPresent }) =>
      datasetPresent ? 48 : theme.spacing(5),
    gridColumnStart: "middle",
    gridColumnEnd: "right",
    transition: "padding-top 0.5s ease",
  },
  panelBannerWrapper: {
    position: "static",
    display: "grid",
    gridTemplateColumns:
      "minmax(12rem, 20rem) minmax(22rem, 1fr) minmax(12rem, 20rem)",
    gridTemplateAreas: `". banner ."`,
    minHeight: BANNER_HEIGHT,
    marginTop: BANNER_MARGIN_TOP,
    backgroundColor: theme.palette.primary.light,
  },
  panelBanner: {
    maxWidth: 1400,
    margin: "auto",
    padding: theme.spacing(4),
    gridArea: "banner",
  },
  panelBannerContent: {
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: 720,
  },
  panelBannerTitle: {
    color: theme.palette.grey[700],
    marginBottom: theme.spacing(4),
  },
  panelBannerDescription: {
    color: theme.palette.grey[600],
    marginBottom: theme.spacing(3),
  },
  filters: {
    display: "block",
    color: theme.palette.grey[800],
  },
}));

export const formatBackLink = (
  query: Router["query"]
): React.ComponentProps<typeof NextLink>["href"] => {
  const backParameters = softJSONParse(query.previous as string);
  if (!backParameters) {
    return "/browse";
  }
  return buildURLFromBrowseState(backParameters);
};

const prepareSearchQueryFilters = (filters: BrowseFilter[]) => {
  return (
    filters
      // Subthemes are filtered on client side.
      .filter(
        (d): d is Exclude<BrowseFilter, DataCubeAbout> =>
          d.__typename !== "DataCubeAbout"
      )
      .map((d) => ({ type: d.__typename, label: d.label, value: d.iri }))
  );
};

const SelectDatasetStepContent = () => {
  const locale = useLocale();
  const [configState] = useConfiguratorState();

  const browseState = useBrowseContext();
  const { search, order, includeDrafts, filters, dataset } = browseState;

  const [debouncedQuery] = useDebounce(search, 500, {
    leading: true,
  });
  const router = useRouter();
  const classes = useStyles({ datasetPresent: !!dataset });
  const backLink = useMemo(() => {
    return formatBackLink(router.query);
  }, [router.query]);

  const queryFilters = useMemo(() => {
    return filters ? prepareSearchQueryFilters(filters) : [];
  }, [filters]);

  // Use the debounced query value here only!
  const [{ data, fetching, error }] = useSearchCubesQuery({
    variables: {
      sourceType: configState.dataSource.type,
      sourceUrl: configState.dataSource.url,
      locale,
      query: debouncedQuery,
      order,
      includeDrafts,
      filters: queryFilters,
    },
    pause: !!dataset,
  });

  useRedirectToVersionedCube({
    dataSource: configState.dataSource,
    datasetIri: dataset,
  });

  const { allCubes, cubes } = React.useMemo(() => {
    if ((data && data.searchCubes.length === 0) || !data) {
      return {
        allCubes: [],
        cubes: [],
      };
    }

    const subthemeFilters = filters.filter(
      (d) => d.__typename === "DataCubeAbout"
    );

    if (subthemeFilters.length === 0) {
      return {
        allCubes: data.searchCubes,
        cubes: data.searchCubes,
      };
    }

    const subthemes = subthemeFilters.map((d) => d.iri);

    return {
      allCubes: data.searchCubes,
      cubes: data.searchCubes.filter((d) => {
        return d.cube.subthemes.some((d) => subthemes.includes(d.iri));
      }),
    };
  }, [data, filters]);

  const themes: DataCubeTheme[] = React.useMemo(() => {
    return sortBy(
      uniqBy(
        cubes
          .flatMap((d) => d.cube.themes)
          .map((d) => ({ ...d, __typename: "DataCubeTheme" })),
        (d) => d.iri
      ),
      (d) => d.label
    );
  }, [cubes]);

  const orgs: DataCubeOrganization[] = React.useMemo(() => {
    return sortBy(
      uniqBy(
        cubes
          .map((d) => d.cube.creator)
          .filter((d) => d?.iri)
          .filter(truthy)
          .map((d) => ({ ...d, __typename: "DataCubeOrganization" })),
        (d) => d.iri
      ),
      (d) => d.label
    );
  }, [cubes]);

  if (configState.state !== "SELECTING_DATASET") {
    return null;
  }

  return (
    <Box>
      <AnimatePresence>
        {!dataset && (
          <MotionBox key="banner" {...bannerPresenceProps}>
            <Box
              component="section"
              role="banner"
              className={classes.panelBannerWrapper}
            >
              <div className={classes.panelBanner}>
                <Flex className={classes.panelBannerContent}>
                  <Typography variant="h1" className={classes.panelBannerTitle}>
                    Swiss Open Government Data
                  </Typography>
                  <Typography
                    variant="body2"
                    className={classes.panelBannerDescription}
                  >
                    <Trans id="browse.datasets.description">
                      Explore datasets provided by the LINDAS Linked Data
                      Service by either filtering by categories or organisations
                      or search directly for specific keywords. Click on a
                      dataset to see more detailed information and start
                      creating your own visualizations.
                    </Trans>
                  </Typography>
                  <SearchDatasetInput browseState={browseState} />
                </Flex>
              </div>
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>
      <PanelLayout className={classes.panelLayout} key="panel">
        <PanelLeftWrapper className={classes.panelLeft}>
          <AnimatePresence mode="wait">
            {dataset ? (
              <MotionBox
                key="metadata"
                sx={{ mx: 4, px: 4 }}
                {...navPresenceProps}
              >
                <NextLink href={backLink} passHref legacyBehavior>
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
                <MotionBox sx={{ mt: 6 }} {...smoothPresenceProps}>
                  <DataSetMetadata
                    dataSetIri={dataset}
                    dataSource={configState.dataSource}
                  />
                </MotionBox>
              </MotionBox>
            ) : (
              <MotionBox key="search-filters" {...navPresenceProps}>
                <SearchFilters cubes={allCubes} themes={themes} orgs={orgs} />
              </MotionBox>
            )}
          </AnimatePresence>
        </PanelLeftWrapper>
        <PanelMiddleWrapper
          className={classes.panelMiddle}
          sx={{ maxWidth: 1040 }}
        >
          <AnimatePresence mode="wait">
            {dataset ? (
              <MotionBox key="preview" {...navPresenceProps}>
                <DataSetPreview
                  dataSetIri={dataset}
                  dataSource={configState.dataSource}
                />
              </MotionBox>
            ) : (
              <MotionBox key="filters" {...navPresenceProps}>
                <AnimatePresence>
                  {queryFilters.length > 0 && (
                    <MotionBox
                      {...{
                        initial: {
                          transform: "translateY(-16px)",
                          height: 0,
                          marginBottom: 0,
                          opacity: 0,
                        },
                        animate: {
                          transform: "translateY(0px)",
                          height: "auto",
                          marginBottom: 16,
                          opacity: 1,
                        },
                        exit: {
                          transform: "translateY(-16px)",
                          height: 0,
                          marginBottom: 0,
                          opacity: 0,
                        },
                        transition: {
                          duration: DURATION,
                        },
                      }}
                    >
                      <Typography
                        key="filters"
                        className={classes.filters}
                        variant="h1"
                      >
                        {queryFilters
                          .map((d) => {
                            const searchList =
                              d.type === "DataCubeTheme" ? themes : orgs;
                            const item = (
                              searchList as { iri: string; label?: string }[]
                            ).find(({ iri }) => iri === d.value);
                            return (item ?? d).label;
                          })
                          .join(", ")}
                      </Typography>
                    </MotionBox>
                  )}
                </AnimatePresence>
                <SearchDatasetControls
                  browseState={browseState}
                  cubes={cubes}
                />
                <DatasetResults
                  fetching={fetching}
                  error={error}
                  cubes={cubes}
                />
              </MotionBox>
            )}
          </AnimatePresence>
        </PanelMiddleWrapper>
      </PanelLayout>
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
    </Box>
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
