import { Plural, t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  ButtonBase,
  CardProps,
  Divider,
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

import Flex from "@/components/flex";
import {
  Checkbox,
  SearchField,
  SearchFieldProps,
  Select,
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
import { PartialSearchCube, SearchCube } from "@/domain/data";
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
import { Icon } from "@/icons";
import SvgIcClose from "@/icons/components/IcClose";
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
    borderRadius: 999,
  },
  searchInput: {
    width: "100%",
    maxWidth: 820,
  },
}));

const useNavItemStyles = makeStyles<Theme, { level: number }>((theme) => ({
  navItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(3),
    width: "100%",
    padding: theme.spacing(2),
    borderRadius: 2,
    transition: "background-color 0.1s ease",
    "&:hover": {
      backgroundColor: theme.palette.cobalt[50],
    },
  },
  removeFilterButton: ({ level }) => ({
    display: "flex",
    alignItems: "center",
    width: "auto",
    height: "auto",
    minWidth: 16,
    minHeight: 16,
    marginRight: 2,
    padding: 0,
    borderRadius: 2,
    backgroundColor: level === 1 ? "cobalt.50" : "transparent",
    color: level === 1 ? theme.palette.text.primary : "cobalt.50",
    transition: "background-color 0.1s ease",
    "&:hover": {
      backgroundColor: theme.palette.cobalt[100],
    },
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
      <Flex sx={{ alignItems: "center", gap: 5 }}>
        <SearchDatasetDraftsControl
          checked={includeDrafts}
          onChange={onToggleIncludeDrafts}
        />
        <Divider flexItem orientation="vertical" />
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
      variant="h5"
      component="p"
      aria-live="polite"
      data-testid="search-results-count"
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
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <label htmlFor="datasetSort">
        <Typography variant="body3">
          <Trans id="dataset.sortby">Sort by</Trans>
        </Typography>
      </label>
      <Select
        id="datasetSort"
        data-testId="datasetSort"
        variant="standard"
        size="sm"
        onChange={(e) => {
          onChange(e.target.value as SearchCubeResultOrder);
        }}
        value={value}
        options={options}
        sortOptions={false}
        sx={{ width: "fit-content" }}
      />
    </Box>
  );
};

const NavChip = ({
  children,
  backgroundColor,
}: {
  children: ReactNode;
  backgroundColor: string;
}) => {
  const classes = useStyles();

  return (
    <Flex
      data-testid="navChip"
      className={classes.navChip}
      sx={{ typography: "caption", backgroundColor }}
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
  level = 1,
  disableLink,
  countBg,
}: {
  children: ReactNode;
  filters: BrowseFilter[];
  next: BrowseFilter;
  count?: number;
  active: boolean;
  /** Level is there to differentiate between organizations and organization subtopics */
  level?: number;
  disableLink?: boolean;
  countBg: string;
} & MUILinkProps) => {
  const { includeDrafts, search, setFilters } = useBrowseContext();
  const classes = useNavItemStyles({ level });

  const [newFiltersAdd, href] = useMemo(() => {
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
      <NavChip backgroundColor={countBg}>{count}</NavChip>
    ) : null;

  return (
    <MotionBox {...accordionPresenceProps} data-testid="navItem">
      <MaybeLink
        href={href}
        passHref
        legacyBehavior
        disabled={!!disableLink}
        scroll={false}
        shallow
      >
        <MUILink
          className={clsx(classes.navItem)}
          variant="body3"
          onClick={
            disableLink && !active
              ? (e) => {
                  e.preventDefault();
                  setFilters(newFiltersAdd);
                }
              : undefined
          }
          sx={{
            p: 2,
            backgroundColor:
              active && level === 1 ? "cobalt.50" : "transparent",
            color: active
              ? level === 1
                ? "text.primary"
                : "cobalt.50"
              : "text.primary",
            cursor: active ? "default" : "pointer",
          }}
        >
          {children}
          {active && level === 1 ? removeFilterButton : countChip}
        </MUILink>
      </MaybeLink>
    </MotionBox>
  );
};

const Subthemes = ({
  subthemes,
  filters,
  counts,
  disableLinks,
  countBg,
}: {
  subthemes: SearchCube["subthemes"];
  filters: BrowseFilter[];
  counts: Record<string, number>;
  disableLinks?: boolean;
  countBg: string;
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
            active={filters[filters.length - 1]?.iri === d.iri}
            level={2}
            count={count}
            disableLink={disableLinks}
            countBg={countBg}
          >
            {d.label}
          </NavItem>
        );
      })}
    </>
  );
};

const NavSectionTitle = ({
  label,
  theme,
}: {
  label: ReactNode;
  theme: { backgroundColor: string };
}) => {
  return (
    <Box
      sx={{
        mb: 2,
        px: 2,
        py: 3,
        borderRadius: "6px",
        backgroundColor: theme.backgroundColor,
      }}
    >
      <Typography variant="h4" component="p" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
    </Box>
  );
};

const NavSection = ({
  label,
  items,
  theme,
  currentFilter,
  filters,
  counts,
  extra,
  disableLinks,
}: {
  label: ReactNode;
  items: (DataCubeTheme | DataCubeOrganization | DataCubeTermset)[];
  theme: { backgroundColor: string };
  currentFilter?: DataCubeTheme | DataCubeOrganization | DataCubeTermset;
  filters: BrowseFilter[];
  counts: Record<string, number>;
  extra?: ReactNode;
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
      <NavSectionTitle label={label} theme={theme} />
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
                disableLink={disableLinks}
                countBg={theme.backgroundColor}
              >
                {item.label}
              </NavItem>
            </Reorder.Item>
          );
        })}
        {topItems.length !== items.length ? (
          <Button
            variant="text"
            color="primary"
            size="sm"
            onClick={isOpen ? close : open}
            endIcon={<Icon name={isOpen ? "arrowUp" : "arrowDown"} size={20} />}
            sx={{ width: "100%", mt: 2 }}
          >
            {isOpen ? (
              <Trans id="show.less">Show less</Trans>
            ) : (
              <Trans id="show.all">Show all</Trans>
            )}
          </Button>
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
        theme={{ backgroundColor: "green.100" }}
        currentFilter={themeFilter}
        counts={counts}
        filters={filters}
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

  const bg = "blue.100";
  const orgNav =
    displayedOrgs && displayedOrgs.length > 0 ? (
      <NavSection
        key="orgs"
        items={displayedOrgs}
        theme={{ backgroundColor: bg }}
        currentFilter={orgFilter}
        counts={counts}
        filters={filters}
        label={<Trans id="browse-panel.organizations">Organizations</Trans>}
        extra={
          orgFilter && filters.map((d) => d.iri).includes(orgFilter.iri) ? (
            <Subthemes
              subthemes={subthemes}
              filters={filters}
              counts={counts}
              disableLinks={disableNavLinks}
              countBg={bg}
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
        theme={{ backgroundColor: "monochrome.200" }}
        currentFilter={termsetFilter}
        counts={counts}
        filters={filters}
        label={
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            gap={2}
            width="100%"
          >
            <Trans id="browse-panel.termsets">Concepts</Trans>
            <InfoIconTooltip
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
    <div key={filters.length} role="search">
      {/* Need to "catch" the Reorder items here, as otherwise there is an exiting
          bug as they get picked by parent AnimatePresence. Probably related to
          https://github.com/framer/motion/issues/1619. */}
      <AnimatePresence>
        <Flex sx={{ flexDirection: "column", rowGap: 8, width: "100%" }}>
          {navs.map((x) => x.element)}
        </Flex>
      </AnimatePresence>
    </div>
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
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
    padding: `${theme.spacing(8)} 0`,
    borderRadius: 0,
    borderTop: `1px solid ${theme.palette.monochrome[400]}`,
    textAlign: "left",
    boxShadow: "none",
  },
  titleClickable: {
    display: "inline-block",
    cursor: "pointer",
    "&:hover": {
      color: theme.palette.primary.main,
    },
    transition: "color 0.2s ease",
  },
}));

const DateFormat = ({ date }: { date: string }) => {
  const formatter = useFormatDate();
  const formatted = useMemo(() => {
    return formatter(date);
  }, [formatter, date]);
  return <>{formatted}</>;
};

type ResultProps = {
  dataCube: PartialSearchCube;
  highlightedTitle?: string | null;
  highlightedDescription?: string | null;
  showTags?: boolean;
  disableTitleLink?: boolean;
  showDimensions?: boolean;
  onClickTitle?: (ev: React.MouseEvent<HTMLDivElement>, iri: string) => void;
};

export const DatasetResult = ({
  dataCube,
  highlightedTitle,
  highlightedDescription,
  showTags,
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
      <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
        <Flex
          sx={{
            justifyContent: "space-between",
            width: "100%",
            // To account for the space taken by the draft tag
            minHeight: 24,
          }}
        >
          <Typography variant="body2" color="monochrome.500">
            {datePublished && <DateFormat date={datePublished} />}
          </Typography>
          {isDraft && (
            <Tag type="draft">
              <Trans id="dataset.tag.draft">Draft</Trans>
            </Tag>
          )}
        </Flex>
        <Typography
          className={disableTitleLink ? "" : `${classes.titleClickable}`}
          fontWeight={700}
          onClick={disableTitleLink ? undefined : handleTitleClick}
        >
          {highlightedTitle ? (
            <Box
              component="span"
              dangerouslySetInnerHTML={{ __html: highlightedTitle }}
              sx={{
                fontWeight: highlightedTitle === title ? 700 : 400,
                "& > b": {
                  fontWeight: 700,
                },
              }}
            />
          ) : (
            title
          )}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            display: "-webkit-box",
            overflow: "hidden",
          }}
          title={description ?? ""}
        >
          {highlightedDescription ? (
            <Box
              component="span"
              dangerouslySetInnerHTML={{ __html: highlightedDescription }}
              sx={{
                fontWeight: 400,
                "& > b": {
                  fontWeight: 700,
                },
              }}
            />
          ) : (
            description
          )}
        </Typography>
      </Stack>
      <Flex sx={{ flexWrap: "wrap", gap: 2 }}>
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
                    scroll={false}
                  >
                    <Tag type="theme">{t.label}</Tag>
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
            scroll={false}
          >
            <Tag type="organization">{creator.label}</Tag>
          </Link>
        ) : null}
        {showDimensions &&
          dimensions?.length !== undefined &&
          dimensions.length > 0 && (
            <>
              {sortBy(dimensions, (t) => t.label).map((dimension) => {
                return (
                  <MaybeTooltip
                    key={dimension.id}
                    title={
                      dimension.termsets.length > 0 ? (
                        <>
                          <Typography variant="caption">
                            <Trans id="dataset-result.dimension-joined-by">
                              Contains values of
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
            </>
          )}
      </Flex>
    </MotionCard>
  );
};

type DatasetResultProps = ComponentProps<typeof DatasetResult>;

DatasetResult.defaultProps = {
  showTags: true,
};
