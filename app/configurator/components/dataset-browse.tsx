import { Maybe } from "@graphql-tools/utils/types";
import { Plural, t, Trans } from "@lingui/macro";
import { filter, keyBy, mapValues, pickBy, sortBy } from "lodash";
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
  FlexProps,
  Link as ThemeUILink,
  LinkProps as ThemeUILinkProps,
  Card,
} from "theme-ui";
import { Router, useRouter } from "next/router";

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
  useSubthemesQuery,
  useThemesQuery,
} from "../../graphql/query-hooks";
import { DataCubePublicationStatus } from "../../graphql/resolver-types";
import { useLocale } from "../../locales/use-locale";
import Stack from "../../components/Stack";
import { useFormatDate } from "./ui-helpers";
import Tag from "./Tag";
import Link from "next/link";
import { BrowseParams } from "../../pages/browse";
import SvgIcClose from "../../icons/components/IcClose";
import SvgIcOrganisations from "../../icons/components/IcOrganisations";
import SvgIcCategories from "../../icons/components/IcCategories";
import isTypename from "../../utils/is-typename";
import useDatasetCount from "./use-dataset-count";
import qs from "qs";

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
  const [dataset, setDataset] = useState<string>();
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
      setQuery,
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
      dataset,
      setDataset,
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
      dataset,
      setDataset,
    ]
  );
};

export type BrowseState = ReturnType<typeof useBrowseState>;
const BrowseContext = React.createContext<BrowseState | undefined>(undefined);

/** Builds the state search filters from query params */
export const getFiltersFromParams = (
  params: BrowseParams,
  context: {
    themes: ThemesQuery["themes"];
    organizations: OrganizationsQuery["organizations"];
  }
) => {
  const filters: SearchFilter[] = [];
  const { type, subtype, iri, subiri } = params;
  for (const [t, i] of [
    [type, iri],
    [subtype, subiri],
  ]) {
    if (t && i && (t === "theme" || t === "organization")) {
      const container = context[
        t === "theme" ? "themes" : "organizations"
      ] as SearchFilter[];
      const obj = container?.find((f) => i === f.iri);
      if (obj) {
        filters.push(obj);
      } else {
        break;
      }
    }
  }
  return filters;
};

export const getFilterParamsFromQuery = (query: Router["query"]) => {
  const { type, iri, subtype, subiri } = query;

  return pickBy(
    mapValues({ type, iri, subtype, subiri }, (v) =>
      Array.isArray(v) ? v[0] : v
    ),
    Boolean
  );
};

/**
 * Provides browse context to children below
 * Responsible for connecting the router to the browsing state
 */
export const BrowseStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const browseState = useBrowseState();
  const { setFilters, setQuery, setDataset } = browseState;
  const locale = useLocale();
  const [{ data: themeData }] = useThemesQuery({
    variables: { locale },
  });
  const [{ data: orgData }] = useOrganizationsQuery({
    variables: { locale },
  });

  const router = useRouter();
  const { search } = router.query;

  const params = useMemo(
    () => getFilterParamsFromQuery(router.query),
    [router.query]
  );

  // Connects browseState to router params
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

    if (params?.type === "dataset" && params?.iri) {
      setDataset(params?.iri);
    } else {
      setDataset(undefined);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, themeData, orgData]);

  useEffect(() => {
    if (!search || search.length === 0) {
      return;
    }
    const searchStr = Array.isArray(search) ? search[0] : search;
    setQuery(searchStr);
  }, [search, setQuery]);
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
  activeBg: "category",
  activeTextColor: "white",
  textColor: "initial",
  countColor: "category",
  countBg: "categoryLight",
};

const organizationNavItemTheme = {
  activeBg: "organization",
  activeTextColor: "white",
  textColor: "initial",
  countColor: "organization",
  countBg: "organizationLight",
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
    const nextIndex = filters.findIndex((f) => f.iri === next.iri);
    const newFilters = nextIndex === 0 ? [] : filters.slice(0, 1);
    return "/browse/" + newFilters.map(encodeFilter).join("/");
  }, [filters, next]);
  return (
    <Box
      sx={{
        mb: 1,
        pl: 4,
        pr: 2,
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
          {count !== undefined ? (
            <NavChip color={theme.countColor} bg={theme.countBg}>
              {count}
            </NavChip>
          ) : null}
        </>
      )}
    </Box>
  );
};

const organizationIriToTermsetParentIri = {
  "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-umwelt-bafu":
    "https://register.ld.admin.ch/foen/theme",
} as Record<string, string>;

export const Subthemes = ({
  organization,
  filters,
  counts,
}: {
  organization: DataCubeOrganization;
  filters: SearchFilter[];
  counts: ReturnType<typeof useDatasetCount>;
}) => {
  const termsetIri = organizationIriToTermsetParentIri[organization.iri];
  const locale = useLocale();
  const [{ data: subthemes }] = useSubthemesQuery({
    variables: {
      locale,
      parentIri: termsetIri,
    },
    pause: !termsetIri,
  });
  const alphaSubthemes = useMemo(
    () => sortBy(subthemes?.subthemes, (x) => x.label),
    [subthemes]
  );
  return (
    <>
      {alphaSubthemes.map((x) => {
        const count = counts[x.iri];
        if (!count) {
          return null;
        }
        return (
          <NavItem
            key={x.iri}
            next={x}
            filters={filters}
            theme={organizationNavItemTheme}
            active={false}
            count={count}
          >
            {x.label}
          </NavItem>
        );
      })}
    </>
  );
};

type NavBoxTheme = {
  bg: string;
  borderColor: string;
};

export const NavBox = ({
  children,
  theme,
  ...flexProps
}: {
  children: React.ReactNode;
  theme: NavBoxTheme;
} & FlexProps) => {
  return (
    <Flex
      {...flexProps}
      sx={{
        alignItems: "center",
        p: 3,
        justifyContent: "space-between",
        cursor: "pointer",
        // border: "1px solid",
        // borderColor: theme.borderColor,
        bg: theme.bg,
        borderRadius: 4,
        height: "2.5rem",
        mb: 2,
      }}
    >
      {children}
    </Flex>
  );
};

export const SearchFilters = () => {
  const locale = useLocale();
  const { filters } = useBrowseContext();
  const [{ data: allThemes }] = useThemesQuery({
    variables: { locale },
  });
  const [{ data: allOrgs }] = useOrganizationsQuery({
    variables: { locale },
  });

  const counts = useDatasetCount(filters);

  const themeFilter = filters.find(
    isTypename("DataCubeTheme" as DataCubeTheme["__typename"])
  );
  const orgFilter = filters.find(
    isTypename("DataCubeOrganization" as DataCubeOrganization["__typename"])
  );

  const [allThemesAlpha, allOrgsAlpha] = useMemo(() => {
    return [
      allThemes ? sortBy(allThemes.themes, (x) => x?.label) : null,
      allOrgs ? sortBy(allOrgs.organizations, (x) => x?.label) : null,
    ];
  }, [allThemes, allOrgs]);

  const themeNav = (
    <>
      <NavBox
        theme={{ bg: "categoryLight", borderColor: "category" }}
        sx={{ mb: "block" }}
      >
        <Link passHref href="/browse/theme">
          <ThemeUILink
            variant="initial"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box as="span" color="category" mr={2}>
              <SvgIcCategories width={24} height={24} />
            </Box>
            <Text variant="paragraph2" sx={{ fontWeight: "bold" }}>
              <Trans id="browse-panel.themes">Themes</Trans>
            </Text>
          </ThemeUILink>
        </Link>
      </NavBox>
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
    </>
  );

  const orgNav = (
    <>
      <NavBox
        theme={{ bg: "organizationLight", borderColor: "organization" }}
        sx={{ mb: 2 }}
      >
        <Link passHref href="/browse/organization">
          <ThemeUILink
            variant="initial"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box as="span" color="organization" mr={2}>
              <SvgIcOrganisations width={24} height={24} />
            </Box>
            <Text variant="paragraph2" sx={{ fontWeight: "bold" }}>
              <Trans id="browse-panel.organizations">Organizations</Trans>
            </Text>
          </ThemeUILink>
        </Link>
      </NavBox>
      <Box>
        {allOrgsAlpha
          ? allOrgsAlpha.map((org) => {
              if (!org.label) {
                return null;
              }
              if (!counts[org.iri] && orgFilter !== org) {
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
        {orgFilter && filters[0] === orgFilter ? (
          <Subthemes
            organization={orgFilter}
            filters={filters}
            counts={counts}
          />
        ) : null}
      </Box>
    </>
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
          {navs[1]}
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
  const router = useRouter();

  const filterParams = useMemo(() => {
    return qs.stringify({
      previous: JSON.stringify(getFilterParamsFromQuery(router.query)),
    });
  }, [router.query]);
  const handleClick = useCallback(() => {
    router.push(`/browse/dataset/${encodeURIComponent(iri)}?${filterParams}`);
  }, [router, iri, filterParams]);
  return (
    <Card
      variant="reset"
      onClick={handleClick}
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
        <Flex sx={{ justifyContent: "space-between" }}>
          <Text variant="paragraph2" color="monochrome600">
            {datePublished ? <DateFormat date={datePublished} /> : null}
          </Text>
          {isDraft && (
            <Tag type="draft">
              <Trans id="dataset.tag.draft">Draft</Trans>
            </Tag>
          )}
        </Flex>
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
