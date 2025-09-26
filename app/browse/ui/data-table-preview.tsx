import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { ascending, descending } from "d3-array";
import { useCallback, useMemo, useRef, useState } from "react";

import { ComponentLabel } from "@/components/chart-data-table-preview/ui/component-label";
import { Loading } from "@/components/hint";
import {
  Component,
  Dimension,
  isNumericalMeasure,
  Measure,
  Observation,
} from "@/domain/data";
import { getSortedComponents } from "@/domain/get-sorted-components";
import { useDimensionFormatters } from "@/formatters";
import SvgIcChevronDown from "@/icons/components/IcChevronDown";
import { uniqueMapBy } from "@/utils/unique-map-by";

export const DataTablePreview = ({
  title,
  dimensions,
  measures,
  observations,
  linkToMetadataPanel,
}: {
  title: string;
  dimensions: Dimension[];
  measures: Measure[];
  observations: Observation[] | undefined;
  linkToMetadataPanel: boolean;
}) => {
  const [sortBy, setSortBy] = useState<Component>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">();
  const sortedComponents = useMemo(() => {
    return getSortedComponents([...dimensions, ...measures]);
  }, [dimensions, measures]);
  const formatters = useDimensionFormatters(sortedComponents);
  const sortedObservations = useMemo(() => {
    if (!sortBy || !observations) {
      return observations;
    }

    const compare = sortDirection === "asc" ? ascending : descending;
    const valuesByLabel = uniqueMapBy(sortBy.values, (d) => d.label);
    const convert =
      isNumericalMeasure(sortBy) || sortBy.isNumerical
        ? (v: string) => +v
        : (v: string) => valuesByLabel.get(v)?.position ?? v;

    return [...observations].sort((a, b) =>
      compare(convert(a[sortBy.id] as string), convert(b[sortBy.id] as string))
    );
  }, [observations, sortBy, sortDirection]);

  const tooltipContainerRef = useRef<HTMLDivElement>(null);
  const tooltipProps = useMemo(() => {
    return {
      PopperProps: {
        // Tooltip contained inside the table so as not to overflow when table is scrolled
        container: tooltipContainerRef.current,
      },
    };
  }, []);

  const handleSort = useCallback(
    (component: Component) => {
      if (sortBy?.id === component.id) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortBy(component);
        setSortDirection("asc");
      }
    },
    [sortBy, sortDirection]
  );

  return (
    <div ref={tooltipContainerRef} style={{ width: "100%" }}>
      <Table>
        <caption style={{ display: "none" }}>{title}</caption>
        <TableHead sx={{ position: "sticky", top: 0 }}>
          <TableRow>
            {sortedComponents.map((component) => {
              return (
                <TableCell
                  key={component.id}
                  component="th"
                  role="columnheader"
                  onClick={() => handleSort(component)}
                  sx={{
                    textAlign: isNumericalMeasure(component) ? "right" : "left",
                    whiteSpace: "nowrap",
                  }}
                >
                  <TableSortLabel
                    active={!sortBy || sortBy.id === component.id}
                    direction={!sortBy ? "desc" : sortDirection}
                    IconComponent={SvgIcChevronDown}
                    sx={{
                      "&:hover > svg": {
                        ...(!sortBy ? { transform: "translateY(-15%)" } : {}),
                      },
                    }}
                  >
                    <ComponentLabel
                      component={component}
                      tooltipProps={tooltipProps}
                      linkToMetadataPanel={linkToMetadataPanel}
                    />
                  </TableSortLabel>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedObservations ? (
            sortedObservations.map((obs, i) => {
              return (
                <TableRow key={i}>
                  {sortedComponents.map((c) => {
                    const numerical = isNumericalMeasure(c);
                    const format = formatters[c.id];
                    const v = obs[c.id];

                    return (
                      <TableCell
                        key={c.id}
                        component="td"
                        sx={{ textAlign: numerical ? "right" : "left" }}
                      >
                        {format(numerical && v ? +v : v)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          ) : (
            <Loading />
          )}
        </TableBody>
      </Table>
    </div>
  );
};
