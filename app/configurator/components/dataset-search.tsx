import { Maybe } from "@graphql-tools/utils/types";
import { Plural, t, Trans } from "@lingui/macro";
import { groupBy, keyBy, mapValues, sortBy } from "lodash";
import React, {
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, Button, Flex, Text, TextProps } from "theme-ui";
import { useConfiguratorState } from "..";
import { Checkbox, MiniSelect, SearchField } from "../../components/form";
import { Loading } from "../../components/hint";
import { Tab, TabContent, Tabs } from "../../components/tabs";
import {
  DataCubeOrganization,
  DataCubeResultOrder,
  DataCubesQuery,
  DataCubeTheme,
  useOrganizationsQuery,
  useThemesQuery,
} from "../../graphql/query-hooks";
import { DataCubePublicationStatus } from "../../graphql/resolver-types";
import { useLocale } from "../../locales/use-locale";
import Stack from "../../components/Stack";
import { useFormatDate } from "./ui-helpers";
import { Accordion, AccordionSummary, AccordionContent } from "./Accordion";

export type SearchFilter = DataCubeTheme | DataCubeOrganization;

export const useSearchQueryState = () => {
  const [query, setQuery] = useState<string>("");

  const [order, setOrder] = useState<DataCubeResultOrder>(
    DataCubeResultOrder.TitleAsc
  );
  const previousOrderRef = useRef<DataCubeResultOrder>(
    DataCubeResultOrder.TitleAsc
  );
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [includeDrafts, setIncludeDrafts] = useState<boolean>(false);

  const addFilter = (cat: SearchFilter) => {
    const type = cat.__typename;
    console.log("on add filter");
    const existingFilterIndex = filters.findIndex((f) => f.__typename === type);
    if (existingFilterIndex === -1) {
      setFilters(Array.from(new Set([...filters, cat])));
    } else {
      setFilters(
        Array.from(new Set([...filters.slice(0, existingFilterIndex), cat]))
      );
    }
  };

  const removeFilter = (cat: SearchFilter) => {
    setFilters(
      Array.from(new Set([...filters.filter((c) => c.iri !== cat.iri)]))
    );
  };

  return useMemo(
    () => ({
      includeDrafts,
      setIncludeDrafts,
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
      filters,
      setFilters,
      onAddFilter: addFilter,
      onRemoveFilter: removeFilter,
      onToggleFilter: (cat: SearchFilter) => {
        if (filters.find((c) => c.iri === cat.iri)) {
          removeFilter(cat);
        } else {
          addFilter(cat);
        }
      },
    }),
    [filters, includeDrafts, order, query]
  );
};

export type SearchQueryState = ReturnType<typeof useSearchQueryState>;

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

const NavItem = ({
  children,
  ...props
}: { children: React.ReactNode } & TextProps) => {
  return (
    <Box sx={{ cursor: "pointer", mb: 2 }}>
      <Text variant="paragraph2" {...props}>
        {children}
      </Text>
    </Box>
  );
};

export const SearchFilters = ({
  searchQueryState,
}: {
  searchQueryState: SearchQueryState;
}) => {
  const locale = useLocale();
  const { filters, onToggleFilter } = searchQueryState;
  const [{ data: allThemes }] = useThemesQuery({
    variables: { locale },
  });
  const [{ data: allOrgs }] = useOrganizationsQuery({
    variables: { locale },
  });

  const themeFilter = filters.find(
    (x) => x.__typename === ("DataCubeTheme" as DataCubeTheme["__typename"])
  );
  const orgFilter = filters.find(
    (x) =>
      x.__typename ===
      ("DataCubeOrganization" as DataCubeOrganization["__typename"])
  );

  const [allThemesAlpha, allOrgsAlpha] = useMemo(() => {
    return [
      allThemes ? sortBy(allThemes.themes, (x) => x?.label) : null,
      allOrgs ? sortBy(allOrgs.organizations, (x) => x?.label) : null,
    ];
  }, [allThemes, allOrgs]);
  return (
    <Flex
      sx={{
        flexDirection: "column",
        height: "100%",
      }}
      px={4}
      pt="2rem"
      role="search"
    >
      <Stack>
        <Accordion>
          <AccordionSummary>
            <Text variant="paragraph2" sx={{ fontWeight: "bold" }}>
              Themes
            </Text>
          </AccordionSummary>
          <AccordionContent>
            <Box ml={4}>
              {allThemesAlpha
                ? allThemesAlpha.map((theme) => {
                    if (!theme.label) {
                      return null;
                    }
                    return (
                      <NavItem
                        key={theme.iri}
                        onClick={() => onToggleFilter(theme)}
                        sx={{
                          fontWeight: themeFilter === theme ? "bold" : "normal",
                        }}
                      >
                        {theme.label}
                      </NavItem>
                    );
                  })
                : null}
            </Box>
          </AccordionContent>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <Text variant="paragraph2" sx={{ fontWeight: "bold" }}>
              Organizations
            </Text>
          </AccordionSummary>
          <AccordionContent>
            <Box ml={4}>
              {allOrgsAlpha
                ? allOrgsAlpha.map((org) => {
                    if (!org.label) {
                      return null;
                    }
                    return (
                      <NavItem
                        key={org.iri}
                        onClick={() => onToggleFilter(org)}
                        sx={{
                          fontWeight: orgFilter === org ? "bold" : "normal",
                        }}
                      >
                        {org.label}
                      </NavItem>
                    );
                  })
                : null}
            </Box>
          </AccordionContent>
        </Accordion>
      </Stack>
    </Flex>
  );
};

export const DatasetResults = ({
  fetching,
  data,
  resultProps,
}: {
  fetching: boolean;
  data: DataCubesQuery | undefined;
  resultProps?: Partial<ResultProps>;
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
              {...resultProps}
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

type ResultProps = {
  dataCube: Pick<
    DataCubesQuery["dataCubes"][0]["dataCube"],
    | "iri"
    | "publicationStatus"
    | "title"
    | "description"
    | "datePublished"
    | "themes"
    | "creator"
  >;
  highlightedTitle?: string | null;
  highlightedDescription?: string | null;
  showTags?: boolean;
};

export const DatasetResult = ({
  dataCube,
  highlightedTitle,
  highlightedDescription,
  showTags,
}: ResultProps) => {
  const [state, dispatch] = useConfiguratorState();
  const {
    iri,
    publicationStatus,
    title,
    description,
    themes,
    datePublished,
    creator,
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
      <Flex sx={{ justifyContent: "space-between" }}>
        <Stack spacing={1} direction="row">
          {isDraft && (
            <Tag>
              <Trans id="dataset.tag.draft">Draft</Trans>
            </Tag>
          )}
          {themes && showTags
            ? sortBy(themes, (t) => t.label).map((t) => (
                <Tag key={t.iri}>{t.label}</Tag>
              ))
            : null}
        </Stack>
        {showTags && creator ? <Tag>{creator.label}</Tag> : null}
      </Flex>
    </Button>
  );
};

DatasetResult.defaultProps = {
  showTags: true,
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
