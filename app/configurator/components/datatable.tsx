import {
  Box,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Theme,
} from "@mui/material";
import { ascending, descending } from "d3";
import { useMemo, useState } from "react";

import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { useDataSource } from "@/components/data-source-menu";
import { Loading } from "@/components/hint";
import { ChartConfig } from "@/configurator/config-types";
import { Observation } from "@/domain/data";
import {
  DimensionMetaDataFragment,
  useDataCubeObservationsQuery,
  useDataCubePreviewObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { useDimensionFormatters } from "./ui-helpers";

export const PreviewTable = ({
  title,
  headers,
  observations,
}: {
  title: string;
  headers: DimensionMetaDataFragment[];
  observations: Observation[];
}) => {
  const [sortBy, setSortBy] = useState<DimensionMetaDataFragment>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">();
  const formatters = useDimensionFormatters(headers);
  const sortedObservations = useMemo(() => {
    if (sortBy !== undefined) {
      const compare = sortDirection === "asc" ? ascending : descending;
      const convert =
        sortBy.__typename === "Measure" ? (d: string) => +d : (d: string) => d;

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

  return (
    <Table>
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
                  textAlign: header.__typename === "Measure" ? "right" : "left",
                  borderBottom: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <TableSortLabel
                  active={sortBy?.iri === header.iri}
                  direction={sortDirection}
                >
                  {header.unit
                    ? `${header.label} (${header.unit})`
                    : header.label}
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
              {headers.map(({ iri, __typename }) => {
                const formatter = formatters[iri];
                return (
                  <TableCell
                    key={iri}
                    component="td"
                    sx={{
                      textAlign: __typename === "Measure" ? "right" : "left",
                    }}
                  >
                    {/** @ts-ignore */}
                    {formatter(obs[iri])}
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
  dimensions,
  measures,
}: {
  title: string;
  dataSetIri: string;
  dimensions: DimensionMetaDataFragment[];
  measures: DimensionMetaDataFragment[];
}) => {
  const [dataSource] = useDataSource();
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

  if (!fetching && data?.dataCubeByIri) {
    const headers = [...dimensions, ...measures];
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
  chartConfig,
  sx,
}: {
  dataSetIri: string;
  chartConfig: ChartConfig;
  sx?: SxProps<Theme>;
}) => {
  const [dataSource] = useDataSource();
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

  if (!fetching && data?.dataCubeByIri) {
    const headers = [
      ...data.dataCubeByIri.dimensions,
      ...data.dataCubeByIri.measures,
    ];

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
