import {
  Box,
  SxProps,
  Table,
  TableBody,
  Tooltip,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Theme,
  TooltipProps,
} from "@mui/material";
import { ascending, descending } from "d3";
import { useMemo, useRef, useState } from "react";

import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { Loading } from "@/components/hint";
import { ChartConfig, DataSource } from "@/configurator/config-types";
import { isNumericalMeasure, Observation } from "@/domain/data";
import {
  DimensionMetadataFragment,
  useDataCubeObservationsQuery,
  useDataCubePreviewObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { useDimensionFormatters } from "./ui-helpers";

const DimensionLabel = ({
  dimension,
  tooltipProps,
}: {
  dimension: DimensionMetadataFragment;
  tooltipProps?: Omit<TooltipProps, "title" | "children">;
}) => {
  const label = dimension.unit
    ? `${dimension.label} (${dimension.unit})`
    : dimension.label;
  return dimension.description ? (
    <Tooltip title={dimension.description} arrow {...tooltipProps}>
      <span style={{ textDecoration: "underline" }}>{label}</span>
    </Tooltip>
  ) : (
    <>{label}</>
  );
};

export const PreviewTable = ({
  title,
  headers,
  observations,
}: {
  title: string;
  headers: DimensionMetadataFragment[];
  observations: Observation[];
}) => {
  const [sortBy, setSortBy] = useState<DimensionMetadataFragment>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">();
  const formatters = useDimensionFormatters(headers);
  const sortedObservations = useMemo(() => {
    if (sortBy !== undefined) {
      const compare = sortDirection === "asc" ? ascending : descending;
      const convert = isNumericalMeasure(sortBy)
        ? (d: string) => +d
        : (d: string) => d;

      return [...observations].sort((a, b) =>
        compare(
          convert(a[sortBy.iri] as string),
          convert(b[sortBy.iri] as string)
        )
      );
    } else {
      return observations;
    }
  }, [observations, sortBy, sortDirection]);

  const tooltipContainerRef = useRef(null);

  // Tooltip contained inside the table so as not to overflow when table is scrolled
  const tooltipProps = useMemo(
    () => ({
      PopperProps: {
        container: tooltipContainerRef.current,
      },
    }),
    []
  );
  return (
    <Table>
      <div ref={tooltipContainerRef} />
      <caption style={{ display: "none" }}>{title}</caption>
      <TableHead sx={{ position: "sticky", top: 0, background: "white" }}>
        <TableRow sx={{ borderBottom: "none" }}>
          {headers.map((header) => {
            return (
              <TableCell
                key={header.iri}
                component="th"
                role="columnheader"
                onClick={() => {
                  if (sortBy?.iri === header.iri) {
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy(header);
                    setSortDirection("asc");
                  }
                }}
                sx={{
                  textAlign: isNumericalMeasure(header) ? "right" : "left",
                  borderBottom: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <TableSortLabel
                  active={sortBy?.iri === header.iri}
                  direction={sortDirection}
                >
                  <DimensionLabel
                    dimension={header}
                    tooltipProps={tooltipProps}
                  />
                </TableSortLabel>
              </TableCell>
            );
          })}
        </TableRow>
        <BackgroundRow nCells={headers.length} />
      </TableHead>
      <TableBody>
        {sortedObservations.map((obs, i) => {
          return (
            <TableRow key={i}>
              {headers.map((header) => {
                const formatter = formatters[header.iri];
                return (
                  <TableCell
                    key={header.iri}
                    component="td"
                    sx={{
                      textAlign: isNumericalMeasure(header) ? "right" : "left",
                    }}
                  >
                    {formatter(obs[header.iri])}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

const BackgroundRow = ({ nCells }: { nCells: number }) => {
  return (
    <TableRow sx={{ padding: 0, background: "black" }}>
      <TableCell
        colSpan={nCells}
        sx={{ height: "1px", padding: 0, borderBottom: "none" }}
      ></TableCell>
    </TableRow>
  );
};

export const DataSetPreviewTable = ({
  title,
  dataSetIri,
  dataSource,
  dimensions,
  measures,
}: {
  title: string;
  dataSetIri: string;
  dataSource: DataSource;
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
}) => {
  const locale = useLocale();
  const [{ data, fetching }] = useDataCubePreviewObservationsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dimensions: null,
    },
  });

  const headers = useMemo(() => {
    return getSortedHeaders(dimensions, measures);
  }, [dimensions, measures]);

  if (!fetching && data?.dataCubeByIri) {
    return (
      <PreviewTable
        title={title}
        headers={headers}
        observations={data.dataCubeByIri.observations.data}
      />
    );
  } else {
    return <Loading />;
  }
};

export const DataSetTable = ({
  dataSetIri,
  dataSource,
  chartConfig,
  sx,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  sx?: SxProps<Theme>;
}) => {
  const locale = useLocale();
  const filters = useQueryFilters({ chartConfig });
  const [{ data, fetching }] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dimensions: null,
      filters,
    },
  });

  const headers = useMemo(() => {
    if (!data?.dataCubeByIri) {
      return [];
    }
    return getSortedHeaders(
      data.dataCubeByIri.dimensions,
      data.dataCubeByIri.measures
    );
  }, [data?.dataCubeByIri]);

  if (!fetching && data?.dataCubeByIri) {
    return (
      <Box sx={{ maxHeight: "600px", overflow: "auto", ...sx }}>
        <PreviewTable
          title={data.dataCubeByIri.title}
          headers={headers}
          observations={data.dataCubeByIri.observations.data}
        />
      </Box>
    );
  } else {
    return <Loading />;
  }
};

function getSortedHeaders(
  dimensions: DimensionMetadataFragment[],
  measures: DimensionMetadataFragment[]
) {
  const allDimensions = [...dimensions, ...measures];
  allDimensions.sort((a, b) =>
    ascending(a.order ?? Infinity, b.order ?? Infinity)
  );
  return allDimensions;
}
