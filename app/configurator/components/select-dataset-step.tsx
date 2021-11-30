import { Trans } from "@lingui/macro";
import NextLink from "next/link";
import { Router, useRouter } from "next/router";
import qs from "qs";
import React, { useMemo } from "react";
import { Box, Link, Text } from "theme-ui";
import { useDebounce } from "use-debounce";
import { DataSetHint } from "../../components/hint";
import { useDataCubesQuery } from "../../graphql/query-hooks";
import { useConfiguratorState, useLocale } from "../../src";
import {
  BrowseStateProvider,
  DatasetResults,
  getBrowseParamsFromQuery,
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

const formatBackLink = (query: Router["query"]): string => {
  const backParameters = softJSONParse(query.previous as string);
  if (!backParameters) {
    return "/browse";
  }
  const { type, iri, subtype, subiri, ...queryParams } =
    getBrowseParamsFromQuery(backParameters);

  const typePart =
    type && iri
      ? `${encodeURIComponent(type)}/${encodeURIComponent(iri)}`
      : undefined;
  const subtypePart =
    subtype && subiri
      ? `${encodeURIComponent(subtype)}/${encodeURIComponent(subiri)}`
      : undefined;

  const pathname = ["/browse", typePart, subtypePart].filter(Boolean).join("/");
  return `${pathname}?${qs.stringify(queryParams)}`;
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
      <PanelLeftWrapper raised={false} sx={{ mt: 50 }}>
        {dataset ? (
          <>
            <Box mb={4} px={4}>
              <NextLink passHref href={`${backLink}`}>
                <Link variant="inline">
                  <Trans id="dataset-preview.back-to-results">
                    Back to the list
                  </Trans>
                </Link>
              </NextLink>
            </Box>
            <DataSetMetadata dataSetIri={dataset} />
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
          <Text variant="heading1" sx={{ mb: 4 }}>
            {dataset
              ? null
              : filters.length > 0
              ? filters
                  .filter((f) => f.__typename !== "DataCubeAbout")
                  .map((f) =>
                    f.__typename !== "DataCubeAbout" ? f.label : null
                  )
                  .join(", ")
              : "Swiss Open Government Data"}
          </Text>
          {dataset ? null : (
            <Box mb={4}>
              <SearchDatasetBox browseState={browseState} searchResult={data} />
            </Box>
          )}
          {dataset || !data ? (
            <>
              {dataset ? (
                <Box>
                  <DataSetPreview dataSetIri={dataset} />
                </Box>
              ) : (
                <DataSetHint />
              )}
            </>
          ) : (
            <DatasetResults fetching={fetching} data={data} />
          )}
        </Box>
      </PanelMiddleWrapper>
    </PanelLayout>
  );
};

export const SelectDatasetStep = () => {
  return (
    <BrowseStateProvider>
      <SelectDatasetStepContent />
    </BrowseStateProvider>
  );
};
