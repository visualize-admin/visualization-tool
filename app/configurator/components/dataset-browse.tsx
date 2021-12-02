import { Maybe } from "@graphql-tools/utils/types";
import { Plural, t, Trans } from "@lingui/macro";
import { mapValues, pick, pickBy, sortBy } from "lodash";
import Link from "next/link";
import { Router, useRouter } from "next/router";
import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  FlexProps,
  Link as ThemeUILink,
  LinkProps as ThemeUILinkProps,
  Text,
} from "theme-ui";
import { Checkbox, MiniSelect, SearchField } from "../../components/form";
import { Loading } from "../../components/hint";
import Stack from "../../components/Stack";
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
import SvgIcCategories from "../../icons/components/IcCategories";
import SvgIcClose from "../../icons/components/IcClose";
import SvgIcOrganisations from "../../icons/components/IcOrganisations";
import { useLocale } from "../../locales/use-locale";
import { BrowseParams } from "../../pages/browse";
import isAttrEqual from "../../utils/is-attr-equal";
import Tag from "./Tag";
import { useFormatDate } from "./ui-helpers";
import useDatasetCount from "./use-dataset-count";

export type DataCubeAbout = {
  __typename: "DataCubeAbout";
  iri: string;
};

export type BrowseFilter = DataCubeTheme | DataCubeOrganization | DataCubeAbout;

/** Builds the state search filters from query params */
export const getFiltersFromParams = (
  params: BrowseParams,
  context: {
    themes?: ThemesQuery["themes"];
    organizations?: OrganizationsQuery["organizations"];
  }
) => {
  const filters: BrowseFilter[] = [];
  const { type, subtype, iri, subiri, topic } = params;
  for (const [t, i] of [
    [type, iri],
    [subtype, subiri],
  ]) {
    if (t && i && (t === "theme" || t === "organization")) {
      const container = context[
        t === "theme" ? "themes" : "organizations"
      ] as BrowseFilter[];
      const obj = container?.find((f) => i === f.iri);
      if (obj) {
        filters.push(obj);
      } else {
        break;
      }
    }
  }
  if (topic) {
    filters.push({
      __typename: "DataCubeAbout",
      iri: topic,
    });
  }

  return filters;
};

export const getBrowseParamsFromQuery = (query: Router["query"]) => {
  const values = mapValues(
    pick(query, [
      "type",
      "iri",
      "subtype",
      "subiri",
      "topic",
      "includeDrafts",
      "order",
      "search",
      "dataset",
    ]),
    (v) => (Array.isArray(v) ? v[0] : v)
  );

  return pickBy(
    {
      ...values,
      includeDrafts: values.includeDrafts
        ? JSON.parse(values.includeDrafts)
        : false,
    },
    Boolean
  );
};

export const buildURLFromBrowseState = (browseState: BrowseParams) => {
  const { type, iri, subtype, subiri, ...queryParams } = browseState;

  const typePart =
    type && iri
      ? `${encodeURIComponent(type)}/${encodeURIComponent(iri)}`
      : undefined;
  const subtypePart =
    subtype && subiri
      ? `${encodeURIComponent(subtype)}/${encodeURIComponent(subiri)}`
      : undefined;

  const pathname = ["/browse", typePart, subtypePart].filter(Boolean).join("/");
  return {
    pathname,
    query: queryParams,
  } as React.ComponentProps<typeof Link>["href"];
};

export const useBrowseState = () => {
  const router = useRouter();
  const locale = useLocale();
  const [{ data: themeData }] = useThemesQuery({
    variables: { locale },
  });
  const [{ data: orgData }] = useOrganizationsQuery({
    variables: { locale },
  });

  const setParam = useCallback(
    (param: keyof BrowseParams, newValue: string | boolean) => {
      const state = getBrowseParamsFromQuery(router.query);
      const newState = { ...state, [param]: newValue } as BrowseParams;
      router.replace(buildURLFromBrowseState(newState), undefined, {
        shallow: true,
      });
    },
    [router]
  );

  const browseParams = getBrowseParamsFromQuery(router.query);
  const { search, type, order, iri, includeDrafts } = browseParams;
  const dataset = type === "dataset" ? iri : null;
  const filters = getFiltersFromParams(browseParams, {
    themes: themeData?.themes,
    organizations: orgData?.organizations,
  });

  const setSearch = useCallback(
    (v: string) => setParam("search", v),
    [setParam]
  );
  const setIncludeDrafts = useCallback(
    (v: boolean) => setParam("includeDrafts", v),
    [setParam]
  );
  const setOrder = useCallback((v: string) => setParam("order", v), [setParam]);
  const setDataset = useCallback(
    (v: string) => setParam("dataset", v),
    [setParam]
  );

  const previousOrderRef = useRef<DataCubeResultOrder>(
    DataCubeResultOrder.TitleAsc
  );

  return useMemo(
    () => ({
      includeDrafts,
      setIncludeDrafts,
      onReset: () => {
        setParam("search", "");
        setOrder(previousOrderRef.current);
      },
      onTypeSearch: (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.currentTarget.value);
        if (search === "" && e.currentTarget.value !== "") {
          previousOrderRef.current = order;
          setOrder(DataCubeResultOrder.Score);
        }
        if (search !== "" && e.currentTarget.value === "") {
          setOrder(previousOrderRef.current);
        }
      },
      search,
      order,
      onSetOrder: (order: DataCubeResultOrder) => {
        previousOrderRef.current = order;
        setOrder(order);
      },
      setSearch,
      setOrder,
      dataset,
      setDataset,
      filters,
    }),
    [
      includeDrafts,
      setIncludeDrafts,
      search,
      order,
      setSearch,
      setOrder,
      dataset,
      setDataset,
      filters,
      setParam,
    ]
  );
};

export type BrowseState = ReturnType<typeof useBrowseState>;
const BrowseContext = React.createContext<BrowseState | undefined>(undefined);

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
    search,
    onTypeSearch,
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

  const isSearching = search !== "";

  const onToggleIncludeDrafts = useCallback(() => {
    setIncludeDrafts(!includeDrafts);
  }, [includeDrafts, setIncludeDrafts]);

  return (
    <Box>
      <Box sx={{ pt: 4 }}>
        <SearchField
          id="datasetSearch"
          label={searchLabel}
          value={search}
          onChange={onTypeSearch}
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

const encodeFilter = (filter: BrowseFilter) => {
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
  level = 1,
  ...props
}: {
  children: React.ReactNode;
  filters: BrowseFilter[];
  next: BrowseFilter;
  count?: number;
  active: boolean;
  theme: typeof defaultNavItemTheme;
  /** Level is there to differentiate between organizations and organization subtopics */
  level?: number;
} & ThemeUILinkProps) => {
  const path = useMemo(() => {
    const newFilters = [...filters].filter((f) =>
      level === 1 ? f.__typename !== next.__typename : true
    );
    if (level === 1) {
      newFilters.push(next);
    }
    return (
      "/browse/" +
      newFilters.map(encodeFilter).join("/") +
      (level === 2 ? `?topic=${encodeURIComponent(next.iri)}` : "")
    );
  }, [filters, next, level]);

  const removeFilterPath = useMemo(() => {
    const nextIndex = filters.findIndex((f) => f.iri === next.iri);
    const newFilters = nextIndex === 0 ? [] : filters.slice(0, 1);
    return "/browse/" + newFilters.map(encodeFilter).join("/");
  }, [filters, next]);

  const removeFilterButton = (
    <Link href={removeFilterPath} passHref>
      <Button
        as="a"
        sx={{
          bg: level === 1 ? theme.activeBg : "transparent",
          color: level === 1 ? theme.activeTextColor : theme.activeBg,
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
  );
  const countChip =
    count !== undefined ? (
      <NavChip color={theme.countColor} bg={theme.countBg}>
        {count}
      </NavChip>
    ) : null;
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
        bg: active && level === 1 ? theme.activeBg : "transparent",
        transition: "background 0.1s ease",
        "&:hover": {
          background: active ? undefined : "rgba(0, 0, 0, 0.05)",
        },
        color: active
          ? level === 1
            ? theme.activeTextColor
            : theme.activeBg
          : theme.textColor,
      }}
    >
      {active ? (
        <>
          <Text variant="paragraph2">{children}</Text>
          {level === 1 ? removeFilterButton : countChip}
        </>
      ) : (
        <>
          <Link href={path} passHref>
            <ThemeUILink variant="initial" sx={{ flexGrow: 1 }}>
              {children}&nbsp;&nbsp;
            </ThemeUILink>
          </Link>
          {countChip}
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
  filters: BrowseFilter[];
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
            active={filters[filters.length - 1]?.iri === x.iri}
            level={2}
            count={count}
          >
            {x.label}
          </NavItem>
        );
      })}
    </>
  );
};

type NavSectionTitleTheme = {
  bg: string;
  borderColor: string;
};

export const NavSectionTitle = ({
  children,
  theme,
  ...flexProps
}: {
  children: React.ReactNode;
  theme: NavSectionTitleTheme;
} & FlexProps) => {
  return (
    <Flex
      {...flexProps}
      sx={{
        alignItems: "center",
        p: 3,
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

  const themeFilter = filters.find(isAttrEqual("__typename", "DataCubeTheme"));
  const orgFilter = filters.find(
    isAttrEqual("__typename", "DataCubeOrganization")
  );

  const [allThemesAlpha, allOrgsAlpha] = useMemo(() => {
    return [
      allThemes ? sortBy(allThemes.themes, (x) => x?.label) : null,
      allOrgs ? sortBy(allOrgs.organizations, (x) => x?.label) : null,
    ];
  }, [allThemes, allOrgs]);

  const themeNav = (
    <div>
      <NavSectionTitle
        theme={{ bg: "categoryLight", borderColor: "category" }}
        sx={{ mb: "block" }}
      >
        <Box as="span" color="category" mr={2}>
          <SvgIcCategories width={24} height={24} />
        </Box>
        <Text variant="paragraph2" sx={{ fontWeight: "bold" }}>
          <Trans id="browse-panel.themes">Themes</Trans>
        </Text>
      </NavSectionTitle>
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
    </div>
  );

  const orgNav = (
    <div>
      <NavSectionTitle
        theme={{ bg: "organizationLight", borderColor: "organization" }}
        sx={{ mb: 2 }}
      >
        <Box as="span" color="organization" mr={2}>
          <SvgIcOrganisations width={24} height={24} />
        </Box>
        <Text variant="paragraph2" sx={{ fontWeight: "bold" }}>
          <Trans id="browse-panel.organizations">Organizations</Trans>
        </Text>
      </NavSectionTitle>
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
    </div>
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
        <Stack spacing={5}>
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

  const browseState = useBrowseContext();
  const { search, includeDrafts, order } = browseState;
  const browseParams = useMemo(() => {
    return getBrowseParamsFromQuery(router.query);
  }, [router]);
  const filterParams = useMemo(() => {
    return {
      previous: JSON.stringify(browseParams),
    };
  }, [browseParams]);
  const handleClick = useCallback(() => {
    router.push(
      {
        pathname: `/browse/dataset/${encodeURIComponent(iri)}`,
        query: filterParams,
      },
      undefined,
      { shallow: true }
    );
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
                  <ThemeUILink
                    variant="initial"
                    // The whole card is a link too, so we have to stop propagating the
                    // event, otherwise we go first to <tag> page then to <result> page
                    onClick={(ev) => ev.stopPropagation()}
                  >
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
              <ThemeUILink
                variant="initial"
                // The whole card is a link too, so we have to stop propagating the
                // event, otherwise we go first to <tag> page then to <result> page
                onClick={(ev) => ev.stopPropagation()}
              >
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
