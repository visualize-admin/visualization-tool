import { Maybe } from "@graphql-tools/utils/types";
import { Plural, t, Trans } from "@lingui/macro";
import e from "cors";
import { keyBy } from "lodash";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { Box, Button, Flex, Text } from "theme-ui";
import { SearchQueryState, useConfiguratorState } from "..";
import { Checkbox, MiniSelect, SearchField } from "../../components/form";
import { Loading } from "../../components/hint";
import {
  DataCubeCategory,
  DataCubeResultOrder,
  DataCubesQuery,
  useCategoriesQuery,
} from "../../graphql/query-hooks";
import { DataCubePublicationStatus } from "../../graphql/resolver-types";
import { useLocale } from "../../locales/use-locale";

const Chip = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return (
    <Flex sx={{ cursor: "pointer", borderRadius: 4, p: 1, bg: "monotone500" }}>
      {children}
      {onClose ? (
        <Box ml={1} onClick={onClose} sx={{ borderRadius: 100 }}>
          X
        </Box>
      ) : null}
    </Flex>
  );
};

const Stack = ({ children }) => {
  return <Box sx={{ "& > * + *": { mt: 2 } }}>{children}</Box>;
};

const Divider = () => {
  return (
    <Box
      sx={{
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome300",
      }}
    />
  );
};

export const SearchDatasetBox = ({
  searchQueryState,
  data,
}: {
  searchQueryState: SearchQueryState;
  data: Maybe<DataCubesQuery>;
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
    onToggleFilterCategory,
    filterCategories,
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

  const locale = useLocale();

  return (
    <Box>
      {/* <SectionTitle>
            <Trans id="controls.select.dataset">Select Dataset</Trans>
          </SectionTitle> */}
      <Box sx={{ px: 4, pt: 4 }}>
        <SearchField
          id="datasetSearch"
          label={searchLabel}
          value={query}
          onChange={onTypeQuery}
          onReset={onReset}
          placeholder={searchLabel}
          onFocus={() => setShowDraftCheckbox(true)}
          // onBlur={() => toggleDraftCheckbox(false)}
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
          {data && (
            <Plural
              id="dataset.results"
              value={data.dataCubes.length}
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

export const DatasetSearch = ({
  searchQueryState,
  data,
}: {
  searchQueryState: SearchQueryState;
  data: Maybe<DataCubesQuery>;
}) => {
  return (
    <Flex
      sx={{
        bg: "monochrome100",
        flexDirection: "column",
        height: "100%",
      }}
      role="search"
    >
      <Box px={4} pt={4}>
        <SearchFilters searchQueryState={searchQueryState} />
      </Box>
    </Flex>
  );
};

const SearchFilters = ({
  searchQueryState,
}: {
  searchQueryState: SearchQueryState;
}) => {
  const locale = useLocale();
  const { filterCategories, onToggleFilterCategory } = searchQueryState;
  const [{ data: allCategories }] = useCategoriesQuery({
    variables: { locale },
  });

  const filterCategoriesByTheme = useMemo(
    () => keyBy(filterCategories, (c) => c.theme),
    [filterCategories]
  );
  return (
    <Stack>
      {allCategories
        ? allCategories.categories.map((cat) => {
            return (
              <Checkbox
                key={cat.theme}
                label={cat.name}
                checked={!!filterCategoriesByTheme[cat.theme]}
                name={cat.name}
                value={cat.theme}
                onChange={(ev) => {
                  onToggleFilterCategory(cat);
                }}
              />
            );
          })
        : null}
    </Stack>
  );
};

export const Datasets = ({
  fetching,
  data,
}: {
  fetching: boolean;
  data: DataCubesQuery | undefined;
}) => {
  if (fetching) {
    return <Loading />;
  } else if (!fetching && data) {
    return (
      <>
        {data.dataCubes.map(
          ({ dataCube, highlightedTitle, highlightedDescription }) => (
            <DatasetButton
              key={dataCube.iri}
              iri={dataCube.iri}
              title={dataCube.title}
              description={dataCube.description}
              highlightedTitle={highlightedTitle}
              highlightedDescription={highlightedDescription}
              isDraft={
                dataCube.publicationStatus === DataCubePublicationStatus.Draft
              }
            />
          )
        )}
      </>
    );
  } else {
    return <Loading />;
  }
};
export const DatasetButton = ({
  iri,
  title,
  description,
  highlightedTitle,
  highlightedDescription,
  isDraft,
}: {
  iri: string;
  title: string;
  description?: string | null;
  highlightedTitle?: string | null;
  highlightedDescription?: string | null;
  isDraft: boolean;
}) => {
  const [state, dispatch] = useConfiguratorState();

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
      {isDraft && (
        <DatasetTag>
          <Trans id="dataset.tag.draft">Draft</Trans>
        </DatasetTag>
      )}
    </Button>
  );
};

const DatasetTag = ({ children }: { children: ReactNode }) => (
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
