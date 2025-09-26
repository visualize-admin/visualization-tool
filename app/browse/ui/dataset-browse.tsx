import { Trans } from "@lingui/macro";
import { Stack } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import keyBy from "lodash/keyBy";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import { ReactNode, useMemo } from "react";

import { BrowseFilter } from "@/browse/lib/filters";
import { useBrowseContext } from "@/browse/model/context";
import { NavigationItem } from "@/browse/ui/navigation-item";
import { NavigationSection } from "@/browse/ui/navigation-section";
import { Flex } from "@/components/flex";
import { InfoIconTooltip } from "@/components/info-icon-tooltip";
import { SearchCube } from "@/domain/data";
import { truthy } from "@/domain/types";
import {
  DataCubeOrganization,
  DataCubeTermset,
  DataCubeTheme,
} from "@/graphql/query-hooks";
import { SearchCubeResult } from "@/graphql/resolver-types";

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
          <NavigationItem
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
          </NavigationItem>
        );
      })}
    </>
  );
};

const navigationOrder: Record<BrowseFilter["__typename"], number> = {
  DataCubeTheme: 1,
  DataCubeOrganization: 2,
  DataCubeTermset: 3,
  // Not used in the navigation
  DataCubeAbout: 4,
};

export const SearchFilters = ({
  cubes,
  themes,
  orgs,
  termsets,
  disableNavLinks,
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
    const result = keyBy(filters, (f) => f.__typename);

    return {
      DataCubeTheme: result.DataCubeTheme as DataCubeTheme,
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

  const themeNavigation =
    displayedThemes.length > 0 ? (
      <NavigationSection
        key="themes"
        items={displayedThemes}
        backgroundColor="green.100"
        currentFilter={themeFilter}
        counts={counts}
        filters={filters}
        label={<Trans id="browse-panel.themes">Themes</Trans>}
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
  const orgNavigation =
    displayedOrgs.length > 0 ? (
      <NavigationSection
        key="orgs"
        items={displayedOrgs}
        backgroundColor={bg}
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

  const termsetNavigation =
    termsets.length > 0 ? (
      <NavigationSection
        key="termsets"
        items={displayedTermsets}
        backgroundColor="monochrome.200"
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
    ) : null;
  const baseNavigations: {
    element: ReactNode;
    __typename: BrowseFilter["__typename"];
  }[] = [
    { element: themeNavigation, __typename: "DataCubeTheme" },
    { element: orgNavigation, __typename: "DataCubeOrganization" },
    { element: termsetNavigation, __typename: "DataCubeTermset" },
  ];
  const navigations = sortBy(baseNavigations, (x) => {
    const i = filters.findIndex((f) => f.__typename === x.__typename);

    return i === -1
      ? // If the filter is not in the list, we want to put it at the end
        navigationOrder[x.__typename] + Object.keys(navigationOrder).length
      : i;
  });

  return (
    <div key={filters.length} role="search">
      {/* Need to "catch" the Reorder items here, as otherwise there is an exiting
          bug as they get picked by parent AnimatePresence. Probably related to
          https://github.com/framer/motion/issues/1619. */}
      <AnimatePresence>
        <Flex sx={{ flexDirection: "column", rowGap: 8, width: "100%" }}>
          {navigations.map((x) => x.element)}
        </Flex>
      </AnimatePresence>
    </div>
  );
};
