import { BrowseFilter } from "@/browse/lib/filters";
import { NavigationItem } from "@/browse/ui/navigation-item";
import { SearchCube } from "@/domain/data";

export const SubthemeFilters = ({
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
