import { Trans } from "@lingui/macro";
import { Stack } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import keyBy from "lodash/keyBy";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import { ReactNode, useMemo } from "react";

import { BrowseFilter } from "@/browse/lib/filters";
import { useBrowseContext } from "@/browse/model/context";
import { NavigationSection } from "@/browse/ui/navigation-section";
import { SubthemeFilters } from "@/browse/ui/subtheme-filters";
import { Flex } from "@/components/flex";
import { InfoIconTooltip } from "@/components/info-icon-tooltip";
import { truthy } from "@/domain/types";
import {
  DataCubeOrganization,
  DataCubeTermset,
  DataCubeTheme,
} from "@/graphql/query-hooks";
import { SearchCubeResult } from "@/graphql/resolver-types";

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

  const { themeFilter, organizationFilter, termsetFilter } = useMemo(() => {
    const result = keyBy(filters, (f) => f.__typename);

    return {
      themeFilter: result.DataCubeTheme as DataCubeTheme,
      organizationFilter: result.DataCubeOrganization as
        | DataCubeOrganization
        | undefined,
      termsetFilter: result.DataCubeTermset as DataCubeTermset | undefined,
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

    if (!counts[org.iri] && organizationFilter?.iri !== org.iri) {
      return false;
    }

    if (organizationFilter && organizationFilter.iri !== org.iri) {
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

  const organizationBackgroundColor = "blue.100";
  const organizationNavigation =
    displayedOrgs.length > 0 ? (
      <NavigationSection
        key="orgs"
        items={displayedOrgs}
        backgroundColor={organizationBackgroundColor}
        currentFilter={organizationFilter}
        counts={counts}
        filters={filters}
        label={<Trans id="browse-panel.organizations">Organizations</Trans>}
        extra={
          organizationFilter &&
          filters.map((d) => d.iri).includes(organizationFilter.iri) ? (
            <SubthemeFilters
              subthemes={subthemes}
              filters={filters}
              counts={counts}
              disableLinks={disableNavLinks}
              countBg={organizationBackgroundColor}
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
    { element: organizationNavigation, __typename: "DataCubeOrganization" },
    { element: termsetNavigation, __typename: "DataCubeTermset" },
  ];

  const navigations = sortBy(baseNavigations, (nav) => {
    const i = filters.findIndex((f) => f.__typename === nav.__typename);

    return i === -1
      ? // If the filter is not in the list, we want to put it at the end
        navigationOrder[nav.__typename] + Object.keys(navigationOrder).length
      : i;
  });

  return (
    <div key={filters.length} role="search">
      {/* Need to "catch" the Reorder items here, as otherwise there is an exiting
          bug as they get picked by parent AnimatePresence. Probably related to
          https://github.com/framer/motion/issues/1619. */}
      <AnimatePresence>
        <Flex sx={{ flexDirection: "column", rowGap: 8, width: "100%" }}>
          {navigations.map((nav) => nav.element)}
        </Flex>
      </AnimatePresence>
    </div>
  );
};
