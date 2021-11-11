import { Maybe } from "@graphql-tools/utils/types";
import { Plural, t, Trans } from "@lingui/macro";
import { sortBy } from "lodash";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useContext,
  useEffect,
} from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  TextProps,
  Link as ThemeUILink,
  LinkProps as ThemeUILinkProps,
} from "theme-ui";
import { useRouter } from "next/router";

import { useConfiguratorState } from "..";
import { Checkbox, MiniSelect, SearchField } from "../../components/form";
import { Loading } from "../../components/hint";
import {
  DataCubeOrganization,
  DataCubeResultOrder,
  DataCubesQuery,
  DataCubeTheme,
  OrganizationsQuery,
  ThemesQuery,
  useOrganizationsQuery,
  useThemesQuery,
} from "../../graphql/query-hooks";
import { DataCubePublicationStatus } from "../../graphql/resolver-types";
import { useLocale } from "../../locales/use-locale";
import Stack from "../../components/Stack";
import { useFormatDate } from "./ui-helpers";
import { Accordion, AccordionSummary, AccordionContent } from "./Accordion";
import Tag from "./Tag";
import Link from "next/link";
import { BrowseParams } from "../../pages/browse";
import Inspector from "react-inspector";
import { theme } from "../../themes/dark";

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

  const addFilter = useCallback(
    (cat: SearchFilter) => {
      const type = cat.__typename;
      const existingFilterIndex = filters.findIndex(
        (f) => f.__typename === type
      );
      if (existingFilterIndex === -1) {
        setFilters(Array.from(new Set([...filters, cat])));
      } else {
        setFilters(
          Array.from(new Set([...filters.slice(0, existingFilterIndex), cat]))
        );
      }
    },
    [filters]
  );

  const removeFilter = useCallback((cat: SearchFilter) => {
    setFilters(
      Array.from(new Set([...filters.filter((c) => c.iri !== cat.iri)]))
    );
  }, []);

  return useMemo(
    () => ({
      includeDrafts,
      setIncludeDrafts,
      onReset: () => {
        setQuery("");
        setOrder(previousOrderRef.current);
      },
      onResetFilters: () => {
        setFilters([]);
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
      onNavigateFilter: (filter: SearchFilter) => {
        // breadcrumbs are in the form [rootNode, ...filters], this is why
        // we need to substract 1 to breadcrumb index to get the filter index.
        const filterIndex = filters.findIndex((f) => f.iri === filter.iri);
        if (filterIndex === filters.length - 1) {
          setFilters([filters[filterIndex]]);
        } else {
          setFilters(filters.slice(0, filterIndex + 1));
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
    [filters, includeDrafts, order, query, removeFilter, addFilter]
  );
};

export type SearchQueryState = ReturnType<typeof useSearchQueryState>;
const SearchStateContext = React.createContext<SearchQueryState | undefined>(
  undefined
);

/** Builds the state search filters from query params */
const getFiltersFromParams = (
  params: BrowseParams,
  context: {
    themes: ThemesQuery["themes"];
    organizations: OrganizationsQuery["organizations"];
  }
) => {
  const filters: SearchFilter[] = [];
  const { type, subtype, iri, subiri } = params;
  // A bit ugly
  // @TODO refactor ?
  if (type && iri) {
    const container = context[
      type === "theme" ? "themes" : "organizations"
    ] as SearchFilter[];
    const obj = container?.find((f) => iri === f.iri);
    if (obj) {
      filters.push(obj);
      if (subtype && subiri) {
        const container = context[
          subtype === "theme" ? "themes" : "organizations"
        ] as SearchFilter[];
        const subobj = container?.find((f) => subiri === f.iri);
        if (subobj) {
          filters.push(subobj);
        }
      }
    }
  }
  return filters;
};

export const SearchStateProvider = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: BrowseParams;
}) => {
  const state = useSearchQueryState();
  const locale = useLocale();
  const [{ data: themeData }] = useThemesQuery({
    variables: { locale },
  });
  const [{ data: orgData }] = useOrganizationsQuery({
    variables: { locale },
  });

  // Connects search state to router params
  // @TODO brings closer to router ?
  useEffect(() => {
    if (!params || !themeData?.themes || !orgData?.organizations) {
      return;
    }

    const filters = getFiltersFromParams(params, {
      themes: themeData?.themes,
      organizations: orgData?.organizations,
    });
    if (filters) {
      state.setFilters(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, themeData, orgData]);
  return (
    <SearchStateContext.Provider value={state}>
      <div style={{ position: "fixed" }}>
        Hello
        {typeof window !== "undefined" ? (
          <Inspector data={state.filters} />
        ) : null}
      </div>
      {children}
    </SearchStateContext.Provider>
  );
};

export const useSearchContext = () => {
  const ctx = useContext(SearchStateContext);
  if (!ctx) {
    throw new Error(
      "To be able useSearchContext, you msut wrap it into a SearchStateProvider"
    );
  }
  return ctx;
};

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
  filters,
  next,
  ...props
}: {
  children: React.ReactNode;
  filters: SearchFilter[];
  next: SearchFilter;
} & ThemeUILinkProps) => {
  const path = [...filters, next]
    .map((f) => {
      return `${
        f.__typename === "DataCubeTheme" ? "theme" : "organization"
      }/${encodeURIComponent(f.iri)}`;
    })
    .join("/");
  return (
    <Box sx={{ mb: 2 }}>
      <Link href={`/browse/${path}`} passHref>
        <ThemeUILink variant="initial">{children}</ThemeUILink>
      </Link>
    </Box>
  );
};

export const SearchFilters = () => {
  const locale = useLocale();
  const { filters, onToggleFilter, onNavigateFilter, onResetFilters } =
    useSearchContext();
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

  const [, dispatch] = useConfiguratorState();

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
      key={filters.length}
    >
      <Stack>
        <Box>
          {filters.length > -1 ? (
            <Link href="/browse" passHref>
              <ThemeUILink
                variant="initial"
                onClick={onResetFilters}
                sx={{ cursor: "pointer" }}
              >
                Home
              </ThemeUILink>
            </Link>
          ) : null}
        </Box>
        {filters.map((f, i) => {
          return (
            <Box key={f.iri} ml={(i + 1) * 2}>
              <Link
                href={`/browse/${
                  f.__typename === "DataCubeTheme" ? "theme" : "organization"
                }/${encodeURIComponent(f.iri)}`}
                passHref
              >
                <ThemeUILink
                  variant="initial"
                  color={i === filters.length - 1 ? "primary" : undefined}
                  sx={{
                    cursor: "pointer",
                    fontWeight: i === filters.length - 1 ? "bold" : "normal",
                  }}
                >
                  {f.label}
                </ThemeUILink>
              </Link>
            </Box>
          );
        })}
        {themeFilter ? null : (
          <Accordion initialExpanded={filters.length === 1}>
            {filters.length === 1 ? null : (
              <AccordionSummary>
                <Text variant="paragraph2" sx={{ fontWeight: "bold" }}>
                  Themes
                </Text>
              </AccordionSummary>
            )}
            <AccordionContent>
              <Box ml={4}>
                {allThemesAlpha
                  ? allThemesAlpha.map((theme) => {
                      if (!theme.label) {
                        return null;
                      }
                      return (
                        <NavItem filters={filters} key={theme.iri} next={theme}>
                          {theme.label}
                        </NavItem>
                      );
                    })
                  : null}
              </Box>
            </AccordionContent>
          </Accordion>
        )}
        {orgFilter ? null : (
          <Accordion initialExpanded={filters.length === 1}>
            {filters.length === 1 ? null : (
              <AccordionSummary>
                <Text variant="paragraph2" sx={{ fontWeight: "bold" }}>
                  Organizations
                </Text>
              </AccordionSummary>
            )}
            <AccordionContent>
              <Box ml={4}>
                {allOrgsAlpha
                  ? allOrgsAlpha.map((org) => {
                      if (!org.label) {
                        return null;
                      }
                      return (
                        <Link
                          key={org.iri}
                          href={`/browse/organization/${encodeURIComponent(
                            org.iri
                          )}`}
                          passHref
                        >
                          <ThemeUILink variant="initial">
                            <NavItem key={org.iri} filters={filters} next={org}>
                              {org.label}
                            </NavItem>
                          </ThemeUILink>
                        </Link>
                      );
                    })
                  : null}
              </Box>
            </AccordionContent>
          </Accordion>
        )}
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

  return (
    <Button
      variant="reset"
      onClick={() => dispatch({ type: "DATASET_SELECTED", dataSet: iri })}
      sx={{
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
      }}
    >
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
            <Tag type="draft">
              <Trans id="dataset.tag.draft">Draft</Trans>
            </Tag>
          )}
          {themes && showTags
            ? sortBy(themes, (t) => t.label).map((t) => (
                <Link
                  key={t.iri}
                  passHref
                  href={`/browse/theme/${encodeURIComponent(t.iri)}`}
                >
                  <ThemeUILink variant="initial">
                    <Tag type={t.__typename}>{t.label}</Tag>
                  </ThemeUILink>
                </Link>
              ))
            : null}
        </Stack>
        {showTags && creator ? (
          <Link
            key={creator.iri}
            passHref
            href={`/browse/organization/${encodeURIComponent(creator.iri)}`}
          >
            <ThemeUILink variant="initial">
              <Tag type={creator.__typename}>{creator.label}</Tag>
            </ThemeUILink>
          </Link>
        ) : null}
      </Flex>
    </Button>
  );
};

DatasetResult.defaultProps = {
  showTags: true,
};
