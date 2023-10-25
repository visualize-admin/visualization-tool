import { Maybe } from "@graphql-tools/utils/types";
import { Plural, t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  ButtonBase,
  Link as MUILink,
  LinkProps as MUILinkProps,
  Stack,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Reorder } from "framer-motion";
import orderBy from "lodash/orderBy";
import pickBy from "lodash/pickBy";
import sortBy from "lodash/sortBy";
import Link from "next/link";
import { useRouter } from "next/router";
import { stringify } from "qs";
import React, { useMemo, useState } from "react";
import { UseQueryState } from "urql";

import Flex, { FlexProps } from "@/components/flex";
import { Checkbox, MinimalisticSelect, SearchField } from "@/components/form";
import { Loading, LoadingDataError } from "@/components/hint";
import {
  accordionPresenceProps,
  MotionBox,
  MotionCard,
  smoothPresenceProps,
} from "@/components/presence";
import Tag from "@/components/tag";
import useDisclosure from "@/components/use-disclosure";
import { truthy } from "@/domain/types";
import { useFormatDate } from "@/formatters";
import {
  DataCubeOrganization,
  DataCubeResultOrder,
  DataCubesQuery,
  DataCubeTheme,
  useOrganizationsQuery,
  useSubthemesQuery,
  useThemesQuery,
} from "@/graphql/query-hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import SvgIcCategories from "@/icons/components/IcCategories";
import SvgIcClose from "@/icons/components/IcClose";
import SvgIcOrganisations from "@/icons/components/IcOrganisations";
import { useLocale } from "@/locales/use-locale";
import { useDataSourceStore } from "@/stores/data-source";
import isAttrEqual from "@/utils/is-attr-equal";
import useEvent from "@/utils/use-event";

import {
  BrowseState,
  getBrowseParamsFromQuery,
  useBrowseContext,
} from "./context";
import { BrowseFilter } from "./filters";
import useDatasetCount from "./use-dataset-count";

export const SearchDatasetInput = ({
  browseState,
}: {
  browseState: BrowseState;
}) => {
  const [_, setShowDraftCheckbox] = useState<boolean>(false);
  const { inputRef, search, onSubmitSearch, onReset } = browseState;

  const searchLabel = t({
    id: "dataset.search.label",
    message: `Search datasets`,
  });

  const placeholderLabel = t({
    id: "dataset.search.placeholder",
    message: "Name, description, organization, theme, keyword",
  });

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputRef.current) {
      onSubmitSearch(inputRef.current.value);
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      onSubmitSearch(inputRef.current.value);
    }
  };

  return (
    <Flex sx={{ alignItems: "center", gap: 2, pt: 4 }}>
      <SearchField
        inputRef={inputRef}
        id="datasetSearch"
        label={searchLabel}
        defaultValue={search || ""}
        InputProps={{
          inputProps: {
            "data-testid": "datasetSearch",
          },
          onKeyPress: handleKeyPress,
          onReset: onReset,
          onFocus: () => setShowDraftCheckbox(true),
        }}
        placeholder={placeholderLabel}
        sx={{ width: "100%", maxWidth: 350 }}
      />
      <Button sx={{ px: 6 }} onClick={handleClick}>
        <Trans id="select.controls.filters.search">Search</Trans>
      </Button>
    </Flex>
  );
};

export const SearchDatasetControls = ({
  browseState,
  searchResult,
}: {
  browseState: BrowseState;
  searchResult: Maybe<DataCubesQuery>;
}) => {
  const {
    inputRef,
    search,
    onSubmitSearch,
    includeDrafts,
    setIncludeDrafts,
    order: stateOrder,
    onSetOrder,
  } = browseState;

  const order = stateOrder || DataCubeResultOrder.CreatedDesc;
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

  const isSearching = search !== "" && search !== undefined;

  const onToggleIncludeDrafts = useEvent(async () => {
    setIncludeDrafts(!includeDrafts);
    if (inputRef.current && inputRef.current.value.length > 0) {
      // We need to wait here otherwise the includeDrafts is reset :/
      await new Promise((resolve) => setTimeout(resolve, 200));
      onSubmitSearch(inputRef.current.value);
    }
  });

  return (
    <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Typography
        variant="body2"
        fontWeight={700}
        aria-live="polite"
        data-testid="search-results-count"
      >
        {searchResult && searchResult.dataCubes.length > 0 && (
          <Plural
            id="dataset.results"
            value={searchResult.dataCubes.length}
            zero="No datasets"
            one="# dataset"
            other="# datasets"
          />
        )}
      </Typography>

      <Flex sx={{ alignItems: "center" }}>
        <Checkbox
          label={t({
            id: "dataset.includeDrafts",
            message: "Include draft datasets",
          })}
          name="dataset-include-drafts"
          value="dataset-include-drafts"
          checked={includeDrafts}
          disabled={false}
          onChange={onToggleIncludeDrafts}
        />
        <label htmlFor="datasetSort">
          <Typography variant="body2" fontWeight={700}>
            <Trans id="dataset.sortby">Sort by</Trans>
          </Typography>
        </label>

        <MinimalisticSelect
          id="datasetSort"
          smaller
          autoWidth
          value={order}
          data-testid="datasetSort"
          options={isSearching ? options : options.slice(1)}
          onChange={(e) => {
            onSetOrder(e.target.value as DataCubeResultOrder);
          }}
        />
      </Flex>
    </Flex>
  );
};

const defaultNavItemTheme = {
  activeTextColor: "white",
  activeBg: "primary.main",
  textColor: "text.primary",
  countColor: "grey.800",
  countBg: "grey.300",
};

const themeNavItemTheme = {
  activeBg: "category.main",
  activeTextColor: "white",
  textColor: "text.primary",
  countColor: "category.main",
  countBg: "category.light",
};

const organizationNavItemTheme = {
  activeBg: "organization.main",
  activeTextColor: "white",
  textColor: "text.primary",
  countColor: "organization.main",
  countBg: "organization.light",
};

const useStyles = makeStyles(() => ({
  navChip: {
    minWidth: 32,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2,
  },
  removeFilterButton: {
    minWidth: 16,
    minHeight: 16,
    height: "auto",
    alignItems: "center",
    display: "flex",
    width: "auto",
    padding: 0,
    borderRadius: 2,
    marginRight: 2,
    "&:hover": {
      background: "rgba(0, 0, 0, 0.25)",
    },
  },
  navItem: {
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
    borderRadius: 2,
    width: "100%",
    display: "flex",
    transition: "background 0.1s ease",
  },
}));

const NavChip = ({
  children,
  color,
  backgroundColor,
}: {
  children: React.ReactNode;
  color: string;
  backgroundColor: string;
}) => {
  const classes = useStyles();
  return (
    <Flex
      data-testid="navChip"
      className={classes.navChip}
      sx={{ typography: "caption", color, backgroundColor }}
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
}: {
  children: React.ReactNode;
  filters: BrowseFilter[];
  next: BrowseFilter;
  count?: number;
  active: boolean;
  theme: typeof defaultNavItemTheme;
  /** Level is there to differentiate between organizations and organization subtopics */
  level?: number;
} & MUILinkProps) => {
  const { includeDrafts, search } = useBrowseContext();

  const path = useMemo(() => {
    const extraURLParams = stringify(
      pickBy(
        {
          includeDrafts,
          search,
          topic: level === 2 ? next.iri : undefined,
        },
        Boolean
      )
    );
    const newFilters = [...filters].filter((f) =>
      level === 1 ? f.__typename !== next.__typename : true
    );
    if (level === 1) {
      newFilters.push(next);
    }
    return (
      "/browse/" + newFilters.map(encodeFilter).join("/") + `?${extraURLParams}`
    );
  }, [includeDrafts, search, level, next, filters]);

  const removeFilterPath = useMemo(() => {
    const extraURLParams = stringify(
      pickBy(
        {
          includeDrafts,
          search,
        },
        Boolean
      )
    );
    const nextIndex = filters.findIndex((f) => f.iri === next.iri);
    const newFilters = nextIndex === 0 ? [] : filters.slice(0, 1);
    return (
      "/browse?" + newFilters.map(encodeFilter).join("&") + `&${extraURLParams}`
    );
  }, [includeDrafts, search, filters, next.iri]);

  const classes = useStyles();
  const removeFilterButton = (
    <Link href={removeFilterPath} passHref legacyBehavior>
      <ButtonBase
        component="a"
        className={classes.removeFilterButton}
        sx={{
          backgroundColor: level === 1 ? theme.activeBg : "transparent",
          color: level === 1 ? theme.activeTextColor : theme.activeBg,
        }}
      >
        <SvgIcClose width={24} height={24} />
      </ButtonBase>
    </Link>
  );
  const countChip =
    count !== undefined ? (
      <NavChip color={theme.countColor} backgroundColor={theme.countBg}>
        {count}
      </NavChip>
    ) : null;
  return (
    <MotionBox
      {...accordionPresenceProps}
      className={classes.navItem}
      data-testid="navItem"
      sx={{
        mb: 1,
        pl: 4,
        backgroundColor: active && level === 1 ? theme.activeBg : "transparent",
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
          <Typography variant="body2" sx={{ py: 1 }}>
            {children}
          </Typography>
          {level === 1 ? removeFilterButton : countChip}
        </>
      ) : (
        <>
          <Link href={path} passHref legacyBehavior>
            <MUILink
              sx={{ flexGrow: 1, py: 1 }}
              underline="none"
              variant="body2"
            >
              {children}
            </MUILink>
          </Link>
          {countChip}
        </>
      )}
    </MotionBox>
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
  const { dataSource } = useDataSourceStore();
  const locale = useLocale();
  const [{ data: subthemes }] = useSubthemesQuery({
    variables: {
      parentIri: termsetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
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
  backgroundColor: string;
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
        backgroundColor: theme.backgroundColor,
        borderRadius: 2,
        height: "2.5rem",
        mb: 2,
      }}
    >
      {children}
    </Flex>
  );
};

const NavSection = ({
  label,
  icon,
  items,
  theme,
  navItemTheme,
  currentFilter,
  filters,
  counts,
  extra,
}: {
  label: React.ReactNode;
  icon: React.ReactNode;
  items: (DataCubeTheme | DataCubeOrganization)[];
  theme: { backgroundColor: string; borderColor: string };
  navItemTheme: typeof themeNavItemTheme;
  currentFilter?: DataCubeTheme | DataCubeOrganization | null;
  filters: BrowseFilter[];
  counts: Record<string, number>;
  extra?: React.ReactNode;
}) => {
  const topItems = useMemo(() => {
    return sortBy(
      orderBy(items, (item) => counts[item.iri], "desc").slice(0, 7),
      (item) => item.label
    );
  }, [counts, items]);
  const { isOpen, open, close } = useDisclosure();
  return (
    <div>
      <NavSectionTitle theme={theme} sx={{ mb: "block" }}>
        <Box component="span" color={navItemTheme.countColor} mr={2}>
          {icon}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          {label}
        </Typography>
      </NavSectionTitle>
      <Reorder.Group
        axis="y"
        as="div"
        onReorder={() => {}}
        values={isOpen ? items : topItems}
      >
        {(isOpen ? items : topItems).map((item) => {
          return (
            <Reorder.Item drag={false} value={item} key={item.iri} as="div">
              <NavItem
                active={currentFilter === item}
                filters={filters}
                next={item}
                count={counts[item.iri]}
                theme={navItemTheme}
              >
                {item.label}
              </NavItem>
            </Reorder.Item>
          );
        })}
        {topItems.length !== items.length ? (
          <Box textAlign="center">
            {isOpen ? (
              <Button
                variant="text"
                sx={{
                  color: navItemTheme.countColor,
                  "&:hover": { color: navItemTheme.countColor },
                  fontWeight: "bold",
                }}
                color="inherit"
                onClick={close}
              >
                Show less
              </Button>
            ) : (
              <Button
                variant="text"
                sx={{
                  color: navItemTheme.countColor,
                  "&:hover": { color: navItemTheme.countColor },
                  fontWeight: "bold",
                }}
                color="inherit"
                onClick={open}
              >
                <Trans id="show.all">Show all</Trans>
              </Button>
            )}
          </Box>
        ) : null}
      </Reorder.Group>
      {extra}
    </div>
  );
};

export const SearchFilters = ({ data }: { data?: DataCubesQuery }) => {
  const { dataSource } = useDataSourceStore();
  const locale = useLocale();
  const { filters, search, includeDrafts } = useBrowseContext();
  const [{ data: allThemes }] = useThemesQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const [{ data: allOrgs }] = useOrganizationsQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });

  const allCounts = useDatasetCount(filters, includeDrafts);
  const resultsCounts = useMemo(() => {
    if (!data?.dataCubes) {
      return {};
    } else {
      const res = {} as Record<string, number>;
      for (const cube of data.dataCubes) {
        const countables = [
          ...cube.dataCube.themes,
          cube.dataCube.creator,
        ].filter(truthy);
        for (const item of countables) {
          res[item.iri] = res[item.iri] || 0;
          res[item.iri] += 1;
        }
      }
      return res;
    }
  }, [data]);
  const total = Object.values(resultsCounts).reduce((acc, n) => acc + n, 0);

  const counts =
    search && search != "" && total > 0 ? resultsCounts : allCounts;

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

  const displayedThemes = allThemesAlpha?.filter((theme) => {
    if (!theme.label) {
      return false;
    }
    if (!counts[theme.iri]) {
      return false;
    }
    if (themeFilter && themeFilter !== theme) {
      return false;
    }
    return true;
  });

  const displayedOrgs = allOrgsAlpha?.filter((org) => {
    if (!org.label) {
      return false;
    }
    if (!counts[org.iri] && orgFilter !== org) {
      return false;
    }
    if (orgFilter && orgFilter !== org) {
      return false;
    }
    return true;
  });

  const themeNav =
    displayedThemes && displayedThemes.length > 0 ? (
      <NavSection
        items={displayedThemes}
        theme={{
          backgroundColor: "category.light",
          borderColor: "category.main",
        }}
        navItemTheme={themeNavItemTheme}
        currentFilter={themeFilter}
        counts={counts}
        filters={filters}
        icon={<SvgIcCategories width={20} height={20} />}
        label={<Trans id="browse-panel.themes">Themes</Trans>}
        extra={null}
      />
    ) : null;

  const orgNav =
    displayedOrgs && displayedOrgs.length > 0 ? (
      <NavSection
        items={displayedOrgs}
        theme={{
          backgroundColor: "organization.light",
          borderColor: "organization.main",
        }}
        navItemTheme={organizationNavItemTheme}
        currentFilter={orgFilter}
        counts={counts}
        filters={filters}
        icon={<SvgIcOrganisations width={20} height={20} />}
        label={<Trans id="browse-panel.organizations">Organizations</Trans>}
        extra={
          orgFilter && filters[0] === orgFilter ? (
            <Subthemes
              organization={orgFilter}
              filters={filters}
              counts={counts}
            />
          ) : null
        }
      />
    ) : null;
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
      pt="0.75rem"
      role="search"
      key={filters.length}
    >
      {/* Theme tree */}
      <Stack spacing={5}>
        {navs[0]}
        {navs[1]}
      </Stack>
    </Flex>
  );
};

export const DatasetResults = ({
  resultProps,
  query,
}: {
  resultProps?: Partial<ResultProps>;
  query: UseQueryState<DataCubesQuery>;
}) => {
  const { fetching, data, error } = query;
  if (fetching) {
    return (
      <Box sx={{ alignItems: "center" }}>
        <Loading />
      </Box>
    );
  }

  if (error) {
    return (
      <LoadingDataError
        message={error instanceof Error ? error.message : error}
      />
    );
  }

  if ((data && data.dataCubes.length === 0) || !data) {
    return (
      <Typography
        variant="h2"
        sx={{ color: "grey.600", mt: 8, textAlign: "center" }}
      >
        <Trans id="No results" />
      </Typography>
    );
  }

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
};

const useResultStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "relative",
    color: theme.palette.grey[700],
    textAlign: "left",
    padding: `${theme.spacing(4)} 0`,
    borderTopColor: theme.palette.grey[300],
    borderTopStyle: "solid",
    borderTopWidth: 1,
    boxShadow: "none",
  },

  title: {
    display: "inline-block",
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));

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

  const handleClick = useEvent(() => {
    const browseParams = getBrowseParamsFromQuery(router.query);
    router.push(
      {
        pathname: `/browse`,
        query: {
          previous: JSON.stringify(browseParams),
          dataset: iri,
        },
      },
      undefined,
      { shallow: true, scroll: false }
    );
  });
  const classes = useResultStyles();
  return (
    <MotionCard {...smoothPresenceProps} elevation={1} className={classes.root}>
      <Stack spacing={2} sx={{ mb: 6, alignItems: "flex-start" }}>
        <Flex sx={{ justifyContent: "space-between", width: "100%" }}>
          <Typography variant="body2" fontWeight={700} gutterBottom={false}>
            {datePublished ? <DateFormat date={datePublished} /> : null}
          </Typography>
          {isDraft && (
            <Tag type="draft">
              <Trans id="dataset.tag.draft">Draft</Trans>
            </Tag>
          )}
        </Flex>
        <Typography
          component="div"
          variant="body1"
          onClick={handleClick}
          color="primary.main"
          className={classes.title}
        >
          {highlightedTitle ? (
            <Box
              component="span"
              sx={{ "& > strong": { backgroundColor: "primary.light" } }}
              dangerouslySetInnerHTML={{ __html: highlightedTitle }}
            />
          ) : (
            title
          )}
        </Typography>
        <Typography
          variant="body2"
          color="grey.600"
          sx={
            {
              WebkitLineClamp: 2,
              lineHeight: 1.57,
              WebkitBoxOrient: "vertical",
              display: "-webkit-box",
              overflow: "hidden",
            } as $IntentionalAny
          }
          title={description ?? ""}
        >
          {highlightedDescription ? (
            <Box
              component="span"
              sx={{ "& > b": { backgroundColor: "primary.light" } }}
              dangerouslySetInnerHTML={{ __html: highlightedDescription }}
            />
          ) : (
            description
          )}
        </Typography>
      </Stack>
      <Flex sx={{ flexWrap: "wrap", gap: "6px" }}>
        {themes && showTags
          ? sortBy(themes, (t) => t.label).map((t) => (
              <Link
                key={t.iri}
                href={`/browse/theme/${encodeURIComponent(t.iri)}`}
                passHref
                legacyBehavior
              >
                <MUILink
                  color="inherit"
                  // The whole card is a link too, so we have to stop propagating the
                  // event, otherwise we go first to <tag> page then to <result> page
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <Tag type={t.__typename}>{t.label}</Tag>
                </MUILink>
              </Link>
            ))
          : null}
        {creator && creator.label ? (
          <Link
            key={creator.iri}
            href={`/browse/organization/${encodeURIComponent(creator.iri)}`}
            passHref
            legacyBehavior
          >
            <MUILink
              color="inherit"
              // The whole card is a link too, so we have to stop propagating the
              // event, otherwise we go first to <tag> page then to <result> page
              onClick={(ev) => ev.stopPropagation()}
            >
              <Tag type={creator.__typename}>{creator.label}</Tag>
            </MUILink>
          </Link>
        ) : null}
      </Flex>
    </MotionCard>
  );
};

DatasetResult.defaultProps = {
  showTags: true,
};
