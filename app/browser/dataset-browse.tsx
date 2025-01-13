import { Plural, t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  ButtonBase,
  CardProps,
  Link as MUILink,
  LinkProps as MUILinkProps,
  Stack,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { AnimatePresence, Reorder } from "framer-motion";
import keyBy from "lodash/keyBy";
import orderBy from "lodash/orderBy";
import pickBy from "lodash/pickBy";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import Link from "next/link";
import { useRouter } from "next/router";
import { stringify } from "qs";
import React, { ComponentProps, ReactNode, useMemo, useState } from "react";

import Flex, { FlexProps } from "@/components/flex";
import {
  Checkbox,
  MinimalisticSelect,
  SearchField,
  SearchFieldProps,
} from "@/components/form";
import { Loading, LoadingDataError } from "@/components/hint";
import { InfoIconTooltip } from "@/components/info-icon-tooltip";
import MaybeLink from "@/components/maybe-link";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import {
  accordionPresenceProps,
  MotionBox,
  MotionCard,
  smoothPresenceProps,
} from "@/components/presence";
import Tag from "@/components/tag";
import useDisclosure from "@/components/use-disclosure";
import { SearchCube } from "@/domain/data";
import { truthy } from "@/domain/types";
import { useFormatDate } from "@/formatters";
import {
  DataCubeOrganization,
  DataCubeTermset,
  DataCubeTheme,
  SearchCubeResultOrder,
} from "@/graphql/query-hooks";
import {
  DataCubePublicationStatus,
  SearchCubeResult,
} from "@/graphql/resolver-types";
import SvgIcCategories from "@/icons/components/IcCategories";
import SvgIcClose from "@/icons/components/IcClose";
import SvgIcOrganisations from "@/icons/components/IcOrganisations";
import useEvent from "@/utils/use-event";

import {
  BrowseState,
  getBrowseParamsFromQuery,
  useBrowseContext,
} from "./context";
import { BrowseFilter } from "./filters";

const useStyles = makeStyles<Theme>(() => ({
  navChip: {
    minWidth: 32,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2,
  },

  searchInput: {
    width: "100%",
    maxWidth: 350,
  },
}));

const useNavItemStyles = makeStyles<
  Theme,
  { level: number; navItemTheme: NavItemTheme }
>((theme) => ({
  navItem: {
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
    borderRadius: 2,
    width: "100%",
    display: "flex",
    transition: "background 0.1s ease",
  },
  link: {
    cursor: "pointer",
    flexGrow: 1,
    padding: theme.spacing(1, 0),
  },
  removeFilterButton: ({ level, navItemTheme }) => ({
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

    backgroundColor: level === 1 ? navItemTheme.activeBg : "transparent",
    color:
      level === 1
        ? (navItemTheme.closeColor ?? navItemTheme.activeTextColor)
        : navItemTheme.activeBg,
  }),
}));

export const SearchDatasetInput = ({
  browseState,
  searchFieldProps,
}: {
  browseState: BrowseState;
  searchFieldProps?: Partial<SearchFieldProps>;
}) => {
  const classes = useStyles();
  const [_, setShowDraftCheckbox] = useState<boolean>(false);
  const { inputRef, search, onSubmitSearch, onReset } = browseState;

  const searchLabel = t({
    id: "dataset.search.label",
    message: "Search",
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
        key={search}
        inputRef={inputRef}
        id="datasetSearch"
        label={searchLabel}
        defaultValue={search ?? ""}
        InputProps={{
          inputProps: {
            "data-testid": "datasetSearch",
          },
          onKeyPress: handleKeyPress,
          onReset,
          onFocus: () => setShowDraftCheckbox(true),
        }}
        placeholder={placeholderLabel}
        {...searchFieldProps}
        className={clsx(classes.searchInput, searchFieldProps?.className)}
      />
      <Button sx={{ px: 6 }} onClick={handleClick}>
        <Trans id="select.controls.filters.search">Search</Trans>
      </Button>
    </Flex>
  );
};

export const SearchDatasetControls = ({
  browseState,
  cubes,
}: {
  browseState: BrowseState;
  cubes: SearchCubeResult[];
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

  const order = stateOrder ?? SearchCubeResultOrder.CreatedDesc;
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
      <SearchDatasetResultsCount cubes={cubes} />
      <Flex sx={{ alignItems: "center" }}>
        <SearchDatasetDraftsControl
          checked={includeDrafts}
          onChange={onToggleIncludeDrafts}
        />
        <SearchDatasetSortControl
          value={order}
          onChange={onSetOrder}
          disableScore={!isSearching}
        />
      </Flex>
    </Flex>
  );
};

export const SearchDatasetResultsCount = ({
  cubes,
}: {
  cubes: SearchCubeResult[];
}) => {
  return (
    <Typography
      variant="body2"
      fontWeight={700}
      aria-live="polite"
      data-testid="search-results-count"
      color="secondary.main"
    >
      {cubes.length > 0 && (
        <Plural
          id="dataset.results"
          value={cubes.length}
          zero="No datasets"
          one="# dataset"
          other="# datasets"
        />
      )}
    </Typography>
  );
};

export const SearchDatasetDraftsControl = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) => {
  return (
    <Checkbox
      label={t({
        id: "dataset.includeDrafts",
        message: "Include draft datasets",
      })}
      name="dataset-include-drafts"
      value="dataset-include-drafts"
      checked={checked}
      onChange={() => onChange(!checked)}
    />
  );
};

export const SearchDatasetSortControl = ({
  value,
  onChange,
  disableScore,
}: {
  value: SearchCubeResultOrder;
  onChange: (order: SearchCubeResultOrder) => void;
  disableScore?: boolean;
}) => {
  const options = useMemo(() => {
    const options = [
      {
        value: SearchCubeResultOrder.Score,
        label: t({ id: "dataset.order.relevance", message: "Relevance" }),
      },
      {
        value: SearchCubeResultOrder.TitleAsc,
        label: t({ id: "dataset.order.title", message: "Title" }),
      },
      {
        value: SearchCubeResultOrder.CreatedDesc,
        label: t({ id: "dataset.order.newest", message: "Newest" }),
      },
    ];

    return disableScore
      ? options.filter((o) => o.value !== SearchCubeResultOrder.Score)
      : options;
  }, [disableScore]);

  return (
    <Box style={{ display: "flex", alignItems: "center", gap: 1 }}>
      <label htmlFor="datasetSort">
        <Typography variant="body2" fontWeight={700}>
          <Trans id="dataset.sortby">Sort by</Trans>
        </Typography>
      </label>
      <MinimalisticSelect
        id="datasetSort"
        data-testid="datasetSort"
        smaller
        autoWidth
        value={value}
        options={options}
        onChange={(e) => {
          onChange(e.target.value as SearchCubeResultOrder);
        }}
      />
    </Box>
  );
};

type NavItemTheme = {
  activeBg: string;
  activeTextColor: string;
  textColor: string;
  countColor: string;
  countBg: string;
  closeColor?: string;
  iconColor?: string;
  showAllColor?: string;
};

const defaultNavItemTheme: NavItemTheme = {
  activeTextColor: "white",
  activeBg: "primary.main",
  textColor: "text.primary",
  countColor: "grey.800",
  countBg: "grey.300",
};

const themeNavItemTheme: NavItemTheme = {
  activeBg: "category.main",
  activeTextColor: "white",
  textColor: "text.primary",
  countColor: "category.main",
  countBg: "category.light",
};

const organizationNavItemTheme: NavItemTheme = {
  activeBg: "organization.main",
  activeTextColor: "white",
  textColor: "text.primary",
  countColor: "organization.main",
  countBg: "organization.light",
};

const termsetNavItemTheme: NavItemTheme = {
  activeBg: "grey.300",
  activeTextColor: "grey.900",
  textColor: "grey.700",
  countColor: "grey.800",
  countBg: "grey.300",
  closeColor: "grey.700",
  showAllColor: "grey.600",
  iconColor: "grey.700",
};

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
  const folder = (() => {
    switch (__typename) {
      case "DataCubeTheme":
        return "theme";
      case "DataCubeOrganization":
        return "organization";
      case "DataCubeAbout":
        return "topic";
      case "DataCubeTermset":
        return "termset";
      default:
        const check: never = __typename;
        throw Error('Unknown filter type "' + check + '"');
    }
  })();
  return `${folder}/${encodeURIComponent(iri)}`;
};

const NavItem = ({
  children,
  filters,
  next,
  count,
  active,
  theme = defaultNavItemTheme,
  level = 1,
  disableLink,
}: {
  children: ReactNode;
  filters: BrowseFilter[];
  next: BrowseFilter;
  count?: number;
  active: boolean;
  theme: typeof defaultNavItemTheme;
  /** Level is there to differentiate between organizations and organization subtopics */
  level?: number;
  disableLink?: boolean;
} & MUILinkProps) => {
  const { includeDrafts, search, setFilters } = useBrowseContext();
  const classes = useNavItemStyles({ level, navItemTheme: theme });

  const [newFiltersAdd, path] = useMemo(() => {
    const extraURLParams = stringify(
      pickBy(
        {
          includeDrafts,
          search,
          topic: level === 2 && !disableLink ? next.iri : undefined,
        },
        Boolean
      )
    );
    const newFilters = [...filters].filter(
      (f) =>
        (disableLink ? true : f.__typename !== "DataCubeAbout") &&
        (level === 1 ? f.__typename !== next.__typename : true)
    );

    if (level === 1 || disableLink) {
      newFilters.push(next);
    }

    return [
      newFilters,
      `/browse/${newFilters.map(encodeFilter).join("/")}?${extraURLParams}`,
    ] as const;
  }, [includeDrafts, search, level, next, filters, disableLink]);

  const [newFiltersRemove, removeFilterPath] = useMemo(() => {
    const extraURLParams = stringify(
      pickBy(
        {
          includeDrafts,
          search,
        },
        Boolean
      )
    );
    const newFilters = filters.filter(
      (f) => f.__typename !== "DataCubeAbout" && f.iri !== next.iri
    );

    return [
      newFilters,
      `/browse/${newFilters.map(encodeFilter).join("/")}?${extraURLParams}`,
    ] as const;
  }, [includeDrafts, search, filters, next.iri]);

  const removeFilterButton = (
    <MaybeLink
      href={removeFilterPath}
      passHref
      legacyBehavior
      disabled={!!disableLink}
      scroll={false}
      shallow
    >
      <ButtonBase
        className={classes.removeFilterButton}
        onClick={
          disableLink
            ? (e) => {
                e.preventDefault();
                setFilters(newFiltersRemove);
              }
            : undefined
        }
      >
        <SvgIcClose width={24} height={24} />
      </ButtonBase>
    </MaybeLink>
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
          <MaybeLink
            href={path}
            passHref
            legacyBehavior
            disabled={!!disableLink}
            scroll={false}
            shallow
          >
            <MUILink
              className={classes.link}
              href={disableLink ? undefined : path}
              underline="none"
              variant="body2"
              onClick={
                disableLink
                  ? (e) => {
                      e.preventDefault();
                      setFilters(newFiltersAdd);
                    }
                  : undefined
              }
            >
              {children}
            </MUILink>
          </MaybeLink>
          {countChip}
        </>
      )}
    </MotionBox>
  );
};

const Subthemes = ({
  subthemes,
  filters,
  counts,
  disableLinks,
}: {
  subthemes: SearchCube["subthemes"];
  filters: BrowseFilter[];
  counts: Record<string, number>;
  disableLinks?: boolean;
}) => {
  return (
    <>
      {subthemes.map((d) => {
        const count = counts[d.iri];

        if (!count) {
          return null;
        }

        return (
          <NavItem
            key={d.iri}
            next={{ __typename: "DataCubeAbout", ...d }}
            filters={filters}
            theme={organizationNavItemTheme}
            active={filters[filters.length - 1]?.iri === d.iri}
            level={2}
            count={count}
            disableLink={disableLinks}
          >
            {d.label}
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

const NavSectionTitle = ({
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
  disableLinks,
}: {
  label: React.ReactNode;
  icon: React.ReactNode;
  items: (DataCubeTheme | DataCubeOrganization | DataCubeTermset)[];
  theme: { backgroundColor: string; borderColor: string };
  navItemTheme: NavItemTheme;
  currentFilter?: DataCubeTheme | DataCubeOrganization | DataCubeTermset;
  filters: BrowseFilter[];
  counts: Record<string, number>;
  extra?: React.ReactNode;
  disableLinks?: boolean;
}) => {
  const topItems = useMemo(() => {
    return sortBy(
      orderBy(items, (item) => counts[item.iri], "desc").slice(0, 7),
      (item) => item.label
    );
  }, [counts, items]);
  const { isOpen, open, close } = useDisclosure(!!currentFilter);

  return (
    <div>
      <NavSectionTitle theme={theme} sx={{ mb: "block" }}>
        <Box
          component="span"
          color={navItemTheme.iconColor ?? navItemTheme.countColor}
          mr={2}
        >
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
                active={currentFilter?.iri === item.iri}
                filters={filters}
                next={item}
                count={counts[item.iri]}
                theme={navItemTheme}
                disableLink={disableLinks}
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
                  color: navItemTheme.showAllColor ?? navItemTheme.countColor,
                  "&:hover": {
                    color: navItemTheme.showAllColor ?? navItemTheme.countColor,
                  },
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

const navOrder: Record<BrowseFilter["__typename"], number> = {
  DataCubeTheme: 1,
  DataCubeOrganization: 2,
  DataCubeTermset: 3,
  // Not used in the nav
  DataCubeAbout: 4,
};

export const SearchFilters = ({
  cubes,
  themes,
  orgs,
  termsets,
  disableNavLinks = false,
}: {
  cubes: SearchCubeResult[];
  themes: DataCubeTheme[];
  orgs: DataCubeOrganization[];
  termsets: DataCubeTermset[];
  disableNavLinks?: boolean;
}) => {
  const { filters } = useBrowseContext();
  const counts = useMemo(() => {
    const result: Record<string, number> = {};

    for (const { cube } of cubes) {
      const countable = [
        ...cube.themes,
        ...cube.subthemes,
        ...cube.termsets,
        cube.creator,
      ].filter(truthy);

      for (const { iri } of countable) {
        if (iri) {
          result[iri] = (result[iri] ?? 0) + 1;
        }
      }
    }

    return result;
  }, [cubes]);

  const {
    DataCubeTheme: themeFilter,
    DataCubeOrganization: orgFilter,
    DataCubeTermset: termsetFilter,
  } = useMemo(() => {
    const result = keyBy(filters, (f) => f.__typename) as {
      [K in BrowseFilter["__typename"]]?: BrowseFilter;
    };
    return {
      DataCubeTheme: result.DataCubeTheme as DataCubeTheme | undefined,
      DataCubeOrganization: result.DataCubeOrganization as
        | DataCubeOrganization
        | undefined,
      DataCubeTermset: result.DataCubeTermset as DataCubeTermset | undefined,
    };
  }, [filters]);

  const displayedThemes = themes.filter((theme) => {
    if (!theme.label) {
      return false;
    }

    if (!counts[theme.iri]) {
      return false;
    }

    if (themeFilter && themeFilter.iri !== theme.iri) {
      return false;
    }

    return true;
  });

  const displayedOrgs = orgs.filter((org) => {
    if (!org.label) {
      return false;
    }

    if (!counts[org.iri] && orgFilter?.iri !== org.iri) {
      return false;
    }

    if (orgFilter && orgFilter.iri !== org.iri) {
      return false;
    }

    return true;
  });

  const displayedTermsets = termsets.filter((termset) => {
    if (!termset.label) {
      return false;
    }

    if (!counts[termset.iri] && termsetFilter?.iri !== termset.iri) {
      return false;
    }

    if (termsetFilter && termsetFilter.iri !== termset.iri) {
      return false;
    }

    return true;
  });

  const themeNav =
    displayedThemes && displayedThemes.length > 0 ? (
      <NavSection
        key="themes"
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
        disableLinks={disableNavLinks}
      />
    ) : null;

  const subthemes = useMemo(() => {
    return sortBy(
      uniqBy(
        cubes.flatMap((d) => d.cube.subthemes),
        (d) => d.iri
      ),
      (d) => d.label
    );
  }, [cubes]);

  const orgNav =
    displayedOrgs && displayedOrgs.length > 0 ? (
      <NavSection
        key="orgs"
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
          orgFilter && filters.map((d) => d.iri).includes(orgFilter.iri) ? (
            <Subthemes
              subthemes={subthemes}
              filters={filters}
              counts={counts}
              disableLinks={disableNavLinks}
            />
          ) : null
        }
        disableLinks={disableNavLinks}
      />
    ) : null;

  const termsetNav =
    termsets.length === 0 ? null : (
      <NavSection
        key="termsets"
        items={displayedTermsets}
        theme={{
          backgroundColor: "grey.300",
          borderColor: "grey.800",
        }}
        navItemTheme={termsetNavItemTheme}
        currentFilter={termsetFilter}
        counts={counts}
        filters={filters}
        icon={<SvgIcOrganisations width={20} height={20} />}
        label={
          <Stack direction="row" gap={2} alignItems="center">
            <Trans id="browse-panel.termsets">Concepts</Trans>
            <InfoIconTooltip
              variant="secondary"
              placement="right"
              title={
                <Trans id="browse-panel.termsets.explanation">
                  Concepts represent values that can be shared across different
                  dimensions and datasets.
                </Trans>
              }
            />
          </Stack>
        }
        extra={null}
        disableLinks={disableNavLinks}
      />
    );
  const baseNavs: {
    element: ReactNode;
    __typename: BrowseFilter["__typename"];
  }[] = [
    { element: themeNav, __typename: "DataCubeTheme" },
    { element: orgNav, __typename: "DataCubeOrganization" },
    { element: termsetNav, __typename: "DataCubeTermset" },
  ];
  const navs = sortBy(baseNavs, (x) => {
    const i = filters.findIndex((f) => f.__typename === x.__typename);
    return i === -1
      ? // If the filter is not in the list, we want to put it at the end
        navOrder[x.__typename as BrowseFilter["__typename"]] +
          Object.keys(navOrder).length
      : i;
  });

  return (
    <Flex
      key={filters.length}
      role="search"
      sx={{ height: "100%", px: 4, pt: "0.75rem" }}
    >
      {/* Need to "catch" the Reorder items here, as otherwise there is an exiting
          bug as they get picked by parent AnimatePresence. Probably related to
          https://github.com/framer/motion/issues/1619. */}
      <AnimatePresence>
        <Flex sx={{ flexDirection: "column", gap: 5, width: "100%" }}>
          {navs.map((x) => x.element)}
        </Flex>
      </AnimatePresence>
    </Flex>
  );
};

export const DatasetResults = ({
  fetching,
  error,
  cubes,
  datasetResultProps,
}: {
  fetching: boolean;
  error: any;
  cubes: SearchCubeResult[];
  datasetResultProps?: ({
    cube,
  }: {
    cube: SearchCube;
  }) => Partial<DatasetResultProps>;
}) => {
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

  if (cubes.length === 0) {
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
    <div>
      {cubes.map(({ cube, highlightedTitle, highlightedDescription }) => (
        <DatasetResult
          key={cube.iri}
          dataCube={cube}
          highlightedTitle={highlightedTitle}
          highlightedDescription={highlightedDescription}
          {...datasetResultProps?.({ cube })}
        />
      ))}
    </div>
  );
};

export type DatasetResultsProps = React.ComponentProps<typeof DatasetResults>;

const useResultStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "relative",
    color: theme.palette.grey[700],
    textAlign: "left",
    padding: `${theme.spacing(4)} 0`,
    boxShadow: "none",

    "&:first-child": {
      borderTop: `1px solid ${theme.palette.grey[300]}`,
    },
    "&:not(:first-child)": {
      borderTop: `2px solid ${theme.palette.grey[300]}`,
    },
  },

  titleClickable: {
    display: "inline-block",
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));

const DateFormat = ({ date }: { date: string }) => {
  const formatter = useFormatDate();
  const formatted = useMemo(() => {
    return formatter(date);
  }, [formatter, date]);
  return <>{formatted}</>;
};

export type PartialSearchCube = Pick<
  SearchCube,
  | "iri"
  | "publicationStatus"
  | "title"
  | "description"
  | "datePublished"
  | "themes"
  | "creator"
  | "dimensions"
>;
type ResultProps = {
  dataCube: PartialSearchCube;
  highlightedTitle?: string | null;
  highlightedDescription?: string | null;
  showTags?: boolean;
  rowActions?: (r: PartialSearchCube) => React.ReactNode;
  disableTitleLink?: boolean;
  showDimensions?: boolean;
  onClickTitle?: (ev: React.MouseEvent<HTMLDivElement>, iri: string) => void;
};

export const DatasetResult = ({
  dataCube,
  highlightedTitle,
  highlightedDescription,
  showTags,
  rowActions,
  disableTitleLink,
  showDimensions,
  onClickTitle,
  ...cardProps
}: ResultProps & CardProps) => {
  const {
    iri,
    publicationStatus,
    title,
    description,
    themes,
    datePublished,
    creator,
    dimensions,
  } = dataCube;
  const isDraft = publicationStatus === DataCubePublicationStatus.Draft;
  const router = useRouter();

  const handleTitleClick = useEvent((ev: React.MouseEvent<HTMLDivElement>) => {
    onClickTitle?.(ev, iri);
    if (ev.defaultPrevented) {
      return;
    }

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
    <MotionCard
      elevation={1}
      {...smoothPresenceProps}
      {...cardProps}
      className={`${classes.root} ${cardProps.className ?? ""}`}
    >
      <Stack spacing={2} sx={{ mb: 6, alignItems: "flex-start" }}>
        <Flex
          sx={{
            justifyContent: "space-between",
            width: "100%",
            // To account for the space taken by the draft tag
            minHeight: 24,
          }}
        >
          <Typography variant="body2" fontWeight={700} gutterBottom={false}>
            {datePublished && <DateFormat date={datePublished} />}
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
          onClick={disableTitleLink ? undefined : handleTitleClick}
          color={disableTitleLink ? "text.primary" : "primary.main"}
          className={disableTitleLink ? "" : `${classes.titleClickable}`}
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
          ? sortBy(themes, (t) => t.label).map(
              (t) =>
                t.iri &&
                t.label && (
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
                      <Tag type="theme">{t.label}</Tag>
                    </MUILink>
                  </Link>
                )
            )
          : null}

        {creator?.label ? (
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
              <Tag type="organization">{creator.label}</Tag>
            </MUILink>
          </Link>
        ) : null}
      </Flex>
      <Flex alignItems="center" width="100%">
        <Box flexGrow={1}>
          {showDimensions &&
            dimensions?.length !== undefined &&
            dimensions.length > 0 && (
              <Flex alignItems="center" mt={1} flexWrap="wrap" gap="0.25rem">
                <Typography variant="body2" sx={{ mr: 1 }}>
                  <Trans id="dataset-result.shared-dimensions">
                    Shared dimensions:
                  </Trans>
                </Typography>
                {sortBy(dimensions, (t) => t.label).map((dimension) => {
                  return (
                    <MaybeTooltip
                      key={dimension.id}
                      title={
                        dimension.termsets.length > 0 ? (
                          <>
                            <Typography variant="body2">
                              <Trans id="dataset-result.dimension-joined-by">
                                Joined by
                              </Trans>
                              <Stack gap={1} flexDirection="row" mt={1}>
                                {dimension.termsets.map((termset) => {
                                  return (
                                    <Tag
                                      key={termset.iri}
                                      type="termset"
                                      sx={{ flexShrink: 0 }}
                                    >
                                      {termset.label}
                                    </Tag>
                                  );
                                })}
                              </Stack>
                            </Typography>
                          </>
                        ) : undefined
                      }
                    >
                      <Tag sx={{ cursor: "default" }} type="dimension">
                        {dimension.label}
                      </Tag>
                    </MaybeTooltip>
                  );
                })}
              </Flex>
            )}
        </Box>
        <Box flexShrink={1}>{rowActions?.(dataCube)}</Box>
      </Flex>
    </MotionCard>
  );
};

type DatasetResultProps = ComponentProps<typeof DatasetResult>;

DatasetResult.defaultProps = {
  showTags: true,
};
