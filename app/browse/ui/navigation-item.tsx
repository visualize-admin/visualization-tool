import { ButtonBase, Link, LinkProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import pickBy from "lodash/pickBy";
import { stringify } from "qs";
import { ReactNode, useMemo } from "react";

import { BrowseFilter, encodeFilter } from "@/browse/lib/filters";
import { useBrowseContext } from "@/browse/model/context";
import { NavigationChip } from "@/browse/ui/navigation-chip";
import { MaybeLink } from "@/components/maybe-link";
import { accordionPresenceProps, MotionBox } from "@/components/presence";
import SvgIcClose from "@/icons/components/IcClose";

export const NavigationItem = ({
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
} & LinkProps) => {
  const { includeDrafts, search, setFilters } = useBrowseContext();
  const classes = useStyles({ level });
  const highlighted = active && level === 1;

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
      pickBy({ includeDrafts, search }, Boolean)
    );
    const newFilters = filters.filter(
      (f) => f.__typename !== "DataCubeAbout" && f.iri !== next.iri
    );

    return [
      newFilters,
      `/browse/${newFilters.map(encodeFilter).join("/")}?${extraURLParams}`,
    ] as const;
  }, [includeDrafts, search, filters, next.iri]);

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
        <Link
          className={classes.root}
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
            backgroundColor: highlighted ? "cobalt.50" : "transparent",
            color: active
              ? level === 1
                ? "text.primary"
                : "cobalt.50"
              : "text.primary",
            cursor: active ? "default" : "pointer",
          }}
        >
          {children}
          {highlighted ? (
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
          ) : count !== undefined ? (
            <NavigationChip backgroundColor={countBg}>{count}</NavigationChip>
          ) : null}
        </Link>
      </MaybeLink>
    </MotionBox>
  );
};

const useStyles = makeStyles<Theme, { level: number }>((theme) => ({
  root: {
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
