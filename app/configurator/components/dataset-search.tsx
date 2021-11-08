import { Maybe } from "@graphql-tools/utils/types";
import { Plural, t, Trans } from "@lingui/macro";
import { keyBy } from "lodash";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { Box, Button, Flex, Text } from "theme-ui";
import { SearchQueryState, useConfiguratorState } from "..";
import { Checkbox, MiniSelect, SearchField } from "../../components/form";
import { Loading } from "../../components/hint";
import {
  DataCubeResultOrder,
  DataCubesQuery,
  useThemesQuery,
} from "../../graphql/query-hooks";
import { DataCubePublicationStatus } from "../../graphql/resolver-types";
import { useLocale } from "../../locales/use-locale";
import Stack from "./Stack";
import { useFormatDate } from "./ui-helpers";

export const SearchDatasetBox = ({
  searchQueryState,
  searchResult,
}: {
  searchQueryState: SearchQueryState;
  searchResult: Maybe<DataCubesQuery>;
}) => {
  const [showDraftCheckbox, setShowDraftCheckbox] = useState<boolean>(false);

  const {
    query,
    onTypeQuery,
    onReset,
    includeDrafts,
    setIncludeDrafts,
    order,
    onSetOrder,
  } = searchQueryState;
  const options = [
    {
      value: DataCubeResultOrder.Score,
      label: t({ id: "dataset.order.relevance", message: `Relevance` }),
    },
    {
      value: DataCubeResultOrder.TitleAsc,
      label: t({ id: "dataset.order.title", message: `Title` }),
    },
    {
      value: DataCubeResultOrder.CreatedDesc,
      label: t({ id: "dataset.order.newest", message: `Newest` }),
    },
  ];

  const searchLabel = t({
    id: "dataset.search.label",
    message: `Search datasets`,
  });

  const isSearching = query !== "";

  const onToggleIncludeDrafts = useCallback(() => {
    setIncludeDrafts((d: boolean) => !d);
  }, [setIncludeDrafts]);

  return (
    <Box>
      <Box sx={{ px: 4, pt: 4 }}>
        <SearchField
          id="datasetSearch"
          label={searchLabel}
          value={query}
          onChange={onTypeQuery}
          onReset={onReset}
          placeholder={searchLabel}
          onFocus={() => setShowDraftCheckbox(true)}
        ></SearchField>
      </Box>

      {showDraftCheckbox && (
        <Box sx={{ px: 4, pt: 4 }}>
          <Checkbox
            label={t({
              id: "dataset.includeDrafts",
              message: "Include draft datasets",
            })}
            name={"dataset-include-drafts"}
            value={"dataset-include-drafts"}
            checked={includeDrafts}
            disabled={false}
            onChange={onToggleIncludeDrafts}
          />
        </Box>
      )}

      <Flex sx={{ px: 4, py: 2, justifyContent: "space-between" }}>
        <Text
          color="secondary"
          sx={{
            fontFamily: "body",
            fontSize: [2, 2, 2],
            lineHeight: "24px",
          }}
          aria-live="polite"
        >
          {searchResult && (
            <Plural
              id="dataset.results"
              value={searchResult.dataCubes.length}
              zero="No results"
              one="# result"
              other="# results"
            />
          )}
        </Text>

        <Flex>
          <label htmlFor="datasetSort">
            <Text
              color="secondary"
              sx={{
                fontFamily: "body",
                fontSize: [1, 2, 2],
                lineHeight: "24px",
              }}
            >
              <Trans id="dataset.sortby">Sort by</Trans>
            </Text>
          </label>

          <MiniSelect
            id="datasetSort"
            value={order}
            options={isSearching ? options : options.slice(1)}
            onChange={(e) => {
              onSetOrder(e.currentTarget.value as DataCubeResultOrder);
            }}
          ></MiniSelect>
        </Flex>
      </Flex>
    </Box>
  );
};

export const SearchFilters = ({
  searchQueryState,
}: {
  searchQueryState: SearchQueryState;
}) => {
  const locale = useLocale();
  const { categoryFilters, onToggleFilterTheme } = searchQueryState;
  const [{ data: allThemes }] = useThemesQuery({
    variables: { locale },
  });

  const categoryFiltersByTheme = useMemo(
    () => keyBy(categoryFilters, (c) => c.theme),
    [categoryFilters]
  );
  return (
    <Flex
      sx={{
        bg: "monochrome100",
        flexDirection: "column",
        height: "100%",
      }}
      px={4}
      pt={4}
      role="search"
    >
      <Stack>
        {allThemes
          ? allThemes.themes.map((cat) => {
              return (
                <Checkbox
                  key={cat.theme}
                  label={cat.name}
                  checked={!!categoryFiltersByTheme[cat.theme]}
                  name={cat.name}
                  value={cat.theme}
                  onChange={(ev) => {
                    onToggleFilterTheme(cat);
                  }}
                />
              );
            })
          : null}
      </Stack>
    </Flex>
  );
};

export const DatasetResults = ({
  fetching,
  data,
}: {
  fetching: boolean;
  data: DataCubesQuery | undefined;
}) => {
  if (fetching) {
    return (
      <Box sx={{ alignItems: "center" }}>
        <Loading />
      </Box>
    );
  } else if (!fetching && data) {
    return (
      <>
        {data.dataCubes.map(
          ({ dataCube, highlightedTitle, highlightedDescription }) => (
            <DatasetResult
              key={dataCube.iri}
              dataCube={dataCube}
              highlightedTitle={highlightedTitle}
              highlightedDescription={highlightedDescription}
            />
          )
        )}
      </>
    );
  } else {
    return <Loading />;
  }
};

export const DateFormat = ({ date }: { date: string }) => {
  const formatter = useFormatDate();
  const formatted = useMemo(() => {
    return formatter(date);
  }, [formatter, date]);
  return <>{formatted}</>;
};

export const DatasetResult = ({
  dataCube,
  highlightedTitle,
  highlightedDescription,
}: {
  dataCube: Pick<
    DataCubesQuery["dataCubes"][0]["dataCube"],
    | "iri"
    | "publicationStatus"
    | "title"
    | "description"
    | "datePublished"
    | "resolvedThemes"
  >;
  highlightedTitle?: string | null;
  highlightedDescription?: string | null;
}) => {
  const [state, dispatch] = useConfiguratorState();
  const {
    iri,
    publicationStatus,
    title,
    description,
    resolvedThemes,
    datePublished,
  } = dataCube;
  const isDraft = publicationStatus === DataCubePublicationStatus.Draft;
  const selected = iri === state.dataSet;

  return (
    <Button
      variant="reset"
      onClick={() => dispatch({ type: "DATASET_SELECTED", dataSet: iri })}
      sx={{
        bg: selected ? "mutedDarker" : "transparent",
        position: "relative",
        color: "monochrome700",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        py: 4,
        borderRadius: 0,
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome300",

        ":hover": {
          bg: "mutedDarker",
        },
        ":active": {
          bg: "mutedDarker",
        },
      }}
    >
      {selected && (
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "4px",
            height: "calc(100% + 2px)",
            bg: "primary",
            marginTop: "-1px",
          }}
        ></Box>
      )}
      <Flex sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Text as="div" variant="paragraph2" sx={{ fontWeight: "bold" }} pb={1}>
          {highlightedTitle ? (
            <Box
              as="span"
              sx={{ "& > strong": { bg: "primaryLight" } }}
              dangerouslySetInnerHTML={{ __html: highlightedTitle }}
            />
          ) : (
            title
          )}
        </Text>
        <Text variant="paragraph2" color="monochrome600">
          {datePublished ? <DateFormat date={datePublished} /> : null}
        </Text>
      </Flex>
      <Text
        variant="paragraph2"
        sx={
          {
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            display: "-webkit-box",
            overflow: "hidden",
          } as $IntentionalAny
        }
        title={description ?? ""}
      >
        {highlightedDescription ? (
          <Box
            as="span"
            sx={{ "& > strong": { bg: "primaryLight" } }}
            dangerouslySetInnerHTML={{ __html: highlightedDescription }}
          />
        ) : (
          description
        )}
      </Text>
      <Stack spacing={1} direction="row">
        {isDraft && (
          <Tag>
            <Trans id="dataset.tag.draft">Draft</Trans>
          </Tag>
        )}
        {resolvedThemes
          ? resolvedThemes.map((t) => <Tag key={t.theme}>{t.name}</Tag>)
          : null}
      </Stack>
    </Button>
  );
};

const Tag = ({ children }: { children: ReactNode }) => (
  <Text
    variant="paragraph2"
    sx={{
      bg: "primaryLight",
      mt: 2,
      px: 2,
      width: "fit-content",
      borderRadius: "default",
    }}
  >
    {children}
  </Text>
);
