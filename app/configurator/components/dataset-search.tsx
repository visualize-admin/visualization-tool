import { Maybe } from "@graphql-tools/utils/types";
import { Plural, t, Trans } from "@lingui/macro";
import { keyBy, sortBy } from "lodash";
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
  Card,
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
import {
  queryDatasetCountByOrganization,
  queryDatasetCountByTheme,
} from "../../rdf/query-cube-metadata";
import SvgIcClose from "../../icons/components/IcClose";

export type SearchFilter = DataCubeTheme | DataCubeOrganization;

export type NavState = {
  theme: {
    expanded: boolean;
  };
  organization: {
    expanded: boolean;
  };
};

const defaultNavState = {
  theme: {
    expanded: true,
  },
  organization: {
    expanded: true,
  },
};

export const useBrowseState = () => {
  const [query, setQuery] = useState<string>("");
  const [navState, setNavState] = useState<NavState>(defaultNavState);

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
      navState,
      setNavState,
    }),
    [
      filters,
      includeDrafts,
      order,
      query,
      removeFilter,
      addFilter,
      navState,
      setNavState,
    ]
  );
};

export type BrowseState = ReturnType<typeof useBrowseState>;
const BrowseContext = React.createContext<BrowseState | undefined>(undefined);

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

export const BrowseStateProvider = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: BrowseParams;
}) => {
  const browseState = useBrowseState();
  const { setFilters, setNavState } = browseState;
  const locale = useLocale();
  const [{ data: themeData }] = useThemesQuery({
    variables: { locale },
  });
  const [{ data: orgData }] = useOrganizationsQuery({
    variables: { locale },
  });

  // Connects browse state to router params
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
      setFilters(filters);
    }
    if (params.type && !params.iri) {
      setNavState({
        theme: { expanded: false },
        organization: { expanded: false },
        [params.type]: { expanded: true },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, themeData, orgData]);
  return (
    <BrowseContext.Provider value={browseState}>
      {children}
    </BrowseContext.Provider>
  );
};

export const useBrowseContext = () => {
  const ctx = useContext(BrowseContext);
  if (!ctx) {
    throw new Error(
      "To be able useBrowseContext, you must wrap it into a BrowseStateProvider"
    );
  }
  return ctx;
};

export const SearchDatasetBox = ({
  browseState,
  searchResult,
}: {
  browseState: BrowseState;
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
  } = browseState;
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
      <Box sx={{ pt: 4 }}>
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
        <Box sx={{ pt: 4 }}>
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

      <Flex sx={{ py: 2, justifyContent: "space-between" }}>
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

const defaultNavItemTheme = {
  activeTextColor: "white",
  activeBg: "primary",
  textColor: "initial",
  countColor: "monochrome800",
  countBg: "monochrome300",
};

const themeNavItemTheme = {
  activeBg: "success",
  activeTextColor: "white",
  textColor: "initial",
  countColor: "success",
  countBg: "successLight",
};

const organizationNavItemTheme = {
  activeBg: "primary",
  activeTextColor: "white",
  textColor: "initial",
  countColor: "primary",
  countBg: "primaryLight",
};

const NavChip = ({
  children,
  color,
  bg,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
}) => {
  return (
    <Flex
      sx={{
        width: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 4,
        color: color,
        bg: bg,
        fontSize: "small",
      }}
    >
      {children}
    </Flex>
  );
};

const encodeFilter = (filter: SearchFilter) => {
  const { iri, __typename } = filter;
  return `${
    __typename === "DataCubeTheme" ? "theme" : "organization"
  }/${encodeURIComponent(iri)}`;
};

const NavItem = ({
  children,
  filters,
  next,
  count,
  active,
  theme = defaultNavItemTheme,
  ...props
}: {
  children: React.ReactNode;
  filters: SearchFilter[];
  next: SearchFilter;
  count?: number;
  active: boolean;
  theme: typeof defaultNavItemTheme;
} & ThemeUILinkProps) => {
  const path = useMemo(() => {
    const newFilters = [...filters].filter(
      (f) => f.__typename !== next.__typename
    );
    newFilters.push(next);
    return "/browse/" + newFilters.map(encodeFilter).join("/");
  }, [filters, next]);
  const removeFilterPath = useMemo(() => {
    const newFilters = [...filters].filter(
      (f) => f.__typename !== next.__typename
    );
    return "/browse/" + newFilters.map(encodeFilter).join("/");
  }, [filters, next]);
  return (
    <Box
      sx={{
        mb: 1,
        px: 4,
        py: 1,
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 4,
        width: "100%",
        display: "flex",
        bg: active ? theme.activeBg : "transparent",
        color: active ? theme.activeTextColor : theme.textColor,
      }}
    >
      {active ? (
        <>
          <Text variant="paragraph2">{children}</Text>
          <Link href={removeFilterPath} passHref>
            <Button
              as="a"
              sx={{
                bg: theme.activeBg,
                color: theme.activeTextColor,
                minWidth: "16px",
                minHeight: "16px",
                display: "block",
                height: "auto",
                width: "auto",
                padding: 0,
                "&:hover": {
                  background: "rgba(0, 0, 0, 0.25)",
                },
              }}
            >
              <SvgIcClose width={24} height={24} />
            </Button>
          </Link>
        </>
      ) : (
        <>
          <Link href={path} passHref>
            <ThemeUILink variant="initial">{children}&nbsp;&nbsp;</ThemeUILink>
          </Link>
          <NavChip color={theme.countColor} bg={theme.countBg}>
            {count !== undefined ? `${count}` : ""}
          </NavChip>
        </>
      )}
    </Box>
  );
};

const useQuery = <
  TData extends unknown,
  TError extends unknown,
  TOutput extends unknown = TData
>(
  fetcher: () => Promise<TData>,
  transformer?: (input: TData) => TOutput
) => {
  const [data, setData] = useState<TData | TOutput>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TError>();
  useEffect(() => {
    const load = async () => {
      setError(undefined);
      setLoading(true);
      try {
        const result = await fetcher();
        setData(transformer ? await transformer(result) : result);
      } catch (e) {
        setError(e as TError);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetcher, transformer]);
  return useMemo(() => ({ data, loading, error }), [data, loading, error]);
};

const countListToIndexedCount = (l: { count: number; iri: string }[]) =>
  Object.fromEntries(l.map((o) => [o.iri, o.count]));

const useDatasetCount = (filters: SearchFilter[]): Record<string, number> => {
  const fetchOrgDatasetCount = useCallback(() => {
    return queryDatasetCountByOrganization({
      theme:
        filters?.[0]?.__typename === "DataCubeTheme"
          ? filters[0].iri
          : undefined,
    });
  }, [filters]);
  const fetchThemeDatasetCount = useCallback(() => {
    return queryDatasetCountByTheme({
      organization:
        filters?.[0]?.__typename === "DataCubeOrganization"
          ? filters[0].iri
          : undefined,
    });
  }, [filters]);

  const { data: datasetCountByOrganization } = useQuery(
    fetchOrgDatasetCount,
    countListToIndexedCount
  );
  const { data: datasetCountByTheme } = useQuery(
    fetchThemeDatasetCount,
    countListToIndexedCount
  );
  return useMemo(
    () =>
      ({ ...datasetCountByOrganization, ...datasetCountByTheme } as Record<
        string,
        number
      >),
    [datasetCountByTheme, datasetCountByOrganization]
  );
};

export const SearchFilters = () => {
  const locale = useLocale();
  const { filters, onResetFilters, onRemoveFilter, navState } =
    useBrowseContext();
  const [{ data: allThemes }] = useThemesQuery({
    variables: { locale },
  });
  const [{ data: allOrgs }] = useOrganizationsQuery({
    variables: { locale },
  });

  const counts = useDatasetCount(filters);

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

  const themeNav = (
    <Accordion
      initialExpanded
      expanded={navState.theme.expanded}
      theme={{ bg: "successLight", borderColor: "categoryGreen" }}
    >
      <AccordionSummary sx={{ mb: "block" }}>
        <Link passHref href="/browse/theme">
          <ThemeUILink variant="initial">
            <Text variant="paragraph2" sx={{ fontWeight: "bold" }}>
              Themes
            </Text>
          </ThemeUILink>
        </Link>
      </AccordionSummary>
      <AccordionContent>
        <Box>
          {allThemesAlpha
            ? allThemesAlpha.map((theme) => {
                if (!theme.label) {
                  return null;
                }
                if (!counts[theme.iri]) {
                  return null;
                }
                if (themeFilter && themeFilter !== theme) {
                  return null;
                }
                return (
                  <NavItem
                    active={themeFilter === theme}
                    filters={filters}
                    key={theme.iri}
                    next={theme}
                    count={counts[theme.iri]}
                    theme={themeNavItemTheme}
                  >
                    {theme.label}
                  </NavItem>
                );
              })
            : null}
        </Box>
      </AccordionContent>
    </Accordion>
  );

  const orgNav = (
    <Accordion
      initialExpanded
      expanded={navState.organization.expanded}
      theme={{ bg: "primaryLight", borderColor: "organisationBlue" }}
    >
      <AccordionSummary sx={{ mb: 2 }}>
        <Link passHref href="/browse/organization">
          <ThemeUILink variant="initial">
            <Text variant="paragraph2" sx={{ fontWeight: "bold" }}>
              Organizations
            </Text>
          </ThemeUILink>
        </Link>
      </AccordionSummary>
      <AccordionContent>
        <Box>
          {allOrgsAlpha
            ? allOrgsAlpha.map((org) => {
                if (!org.label) {
                  return null;
                }
                if (!counts[org.iri]) {
                  return null;
                }
                if (orgFilter && orgFilter !== org) {
                  return null;
                }
                return (
                  <NavItem
                    key={org.iri}
                    filters={filters}
                    active={orgFilter === org}
                    next={org}
                    count={counts[org.iri]}
                    theme={organizationNavItemTheme}
                  >
                    {org.label}
                  </NavItem>
                );
              })
            : null}
        </Box>
      </AccordionContent>
    </Accordion>
  );

  let navs = [themeNav, orgNav];
  if (filters[0]?.__typename === "DataCubeTheme") {
    navs = [themeNav, orgNav];
  } else if (filters[0]?.__typename === "DataCubeOrganization") {
    navs = [orgNav, themeNav];
  }

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
        {/* Theme tree */}
        <Stack spacing={4}>
          {navs[0]}
          <Box ml={filters.length > 0 ? 2 : 0}>{navs[1]}</Box>
        </Stack>
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
    <Card
      variant="reset"
      onClick={() => dispatch({ type: "DATASET_SELECTED", dataSet: iri })}
      sx={{
        position: "relative",
        color: "monochrome700",
        cursor: "pointer",
        textAlign: "left",
        py: 4,
        px: 5,
        borderRadius: 10,
        boxShadow: "primary",
        bg: "monochrome100",
        mb: 3,
      }}
    >
      <Stack spacing={2}>
        <Text variant="paragraph2" color="monochrome600">
          {datePublished ? <DateFormat date={datePublished} /> : null}
        </Text>
        <Text as="div" variant="paragraph1" pb={1}>
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
          {creator ? (
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
        </Stack>
      </Stack>
    </Card>
  );
};

DatasetResult.defaultProps = {
  showTags: true,
};
