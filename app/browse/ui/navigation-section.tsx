import { Trans } from "@lingui/macro";
import { Button } from "@mui/material";
import { Reorder } from "framer-motion";
import orderBy from "lodash/orderBy";
import sortBy from "lodash/sortBy";
import { ReactNode, useMemo } from "react";

import { BrowseFilter } from "@/browse/lib/filters";
import { NavigationItem } from "@/browse/ui/navigation-item";
import { NavigationSectionTitle } from "@/browse/ui/navigation-section-title";
import { useDisclosure } from "@/components/use-disclosure";
import {
  DataCubeOrganization,
  DataCubeTermset,
  DataCubeTheme,
} from "@/graphql/query-hooks";
import { Icon } from "@/icons";

export const NavigationSection = ({
  label,
  items,
  backgroundColor,
  currentFilter,
  filters,
  counts,
  extra,
  disableLinks,
}: {
  label: ReactNode;
  items: (DataCubeTheme | DataCubeOrganization | DataCubeTermset)[];
  backgroundColor: string;
  currentFilter?: DataCubeTheme | DataCubeOrganization | DataCubeTermset;
  filters: BrowseFilter[];
  counts: Record<string, number>;
  extra?: ReactNode;
  disableLinks?: boolean;
}) => {
  const { isOpen, open, close } = useDisclosure(!!currentFilter);
  const topItems = useMemo(() => {
    return sortBy(
      orderBy(items, (item) => counts[item.iri], "desc").slice(0, 7),
      (item) => item.label
    );
  }, [counts, items]);

  return (
    <div>
      <NavigationSectionTitle label={label} backgroundColor={backgroundColor} />
      <Reorder.Group
        axis="y"
        as="div"
        onReorder={() => {}}
        values={isOpen ? items : topItems}
      >
        {(isOpen ? items : topItems).map((item) => {
          return (
            <Reorder.Item key={item.iri} as="div" value={item}>
              <NavigationItem
                active={currentFilter?.iri === item.iri}
                filters={filters}
                next={item}
                count={counts[item.iri]}
                disableLink={disableLinks}
                countBg={backgroundColor}
              >
                {item.label}
              </NavigationItem>
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
