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
  Tooltip,
  TooltipProps,
} from "@mui/material";
import { ascending, descending } from "d3";
import { useMemo, useRef, useState } from "react";

import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { Loading } from "@/components/hint";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { ChartConfig, DataSource } from "@/configurator/config-types";
import { Observation, isNumericalMeasure } from "@/domain/data";
import { useDimensionFormatters } from "@/formatters";
import {
  DimensionMetadataFragment,
  useComponentsQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import SvgIcChevronDown from "@/icons/components/IcChevronDown";
import { useLocale } from "@/locales/use-locale";
import { uniqueMapBy } from "@/utils/uniqueMapBy";

const DimensionLabel = ({
  dimension,
  tooltipProps,
  linkToMetadataPanel,
}: {
  dimension: DimensionMetadataFragment;
  tooltipProps?: Omit<TooltipProps, "title" | "children">;
  linkToMetadataPanel: boolean;
}) => {
  const label = dimension.unit
    ? `${dimension.label} (${dimension.unit})`
    : dimension.label;

  return linkToMetadataPanel ? (
    <OpenMetadataPanelWrapper dim={dimension}>
      <span style={{ fontWeight: "bold" }}>{label}</span>
    </OpenMetadataPanelWrapper>
  ) : dimension.description ? (
    <Tooltip title={dimension.description} arrow {...tooltipProps}>
      <span style={{ fontWeight: "bold", textDecoration: "underline" }}>
        {label}
      </span>
    </Tooltip>
  ) : (
    <span style={{ fontWeight: "bold" }}>{label}</span>
  );
};

export const PreviewTable = ({
  title,
  headers,
  observations,
  linkToMetadataPanel,
}: {
  title: string;
  headers: DimensionMetadataFragment[];
  observations: Observation[];
  linkToMetadataPanel: boolean;
}) => {
  const [sortBy, setSortBy] = useState<DimensionMetadataFragment>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">();
  const formatters = useDimensionFormatters(headers);
  const sortedObservations = useMemo(() => {
    if (sortBy !== undefined) {
      const compare = sortDirection === "asc" ? ascending : descending;
      const valuesIndex = uniqueMapBy(sortBy.values, (x) => x.label);
      const convert = isNumericalMeasure(sortBy)
        ? (d: string) => +d
        : (d: string) => {
            const value = valuesIndex.get(d);
            if (value?.position) {
              return value.position;
            }
            return d;
          };

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
    <div ref={tooltipContainerRef}>
      <Table>
        <caption style={{ display: "none" }}>{title}</caption>
        <TableHead sx={{ position: "sticky", top: 0, background: "white" }}>
          <TableRow sx={{ borderBottom: "none" }}>
            {headers.map((d) => {
              return (
                <TableCell
                  key={d.iri}
                  component="th"
                  role="columnheader"
                  onClick={() => {
                    if (sortBy?.iri === d.iri) {
                      setSortDirection(
                        sortDirection === "asc" ? "desc" : "asc"
                      );
                    } else {
                      setSortBy(d);
                      setSortDirection("asc");
                    }
                  }}
                  sx={{
                    textAlign: isNumericalMeasure(d) ? "right" : "left",
                    borderBottom: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <TableSortLabel
                    active={sortBy === undefined || sortBy.iri === d.iri}
                    direction={sortBy === undefined ? "desc" : sortDirection}
                    IconComponent={SvgIcChevronDown}
                    sx={{
                      "&:hover > svg": {
                        ...(sortBy === undefined
                          ? { transform: "translateY(-15%)" }
                          : {}),
                      },
                    }}
                  >
                    <DimensionLabel
                      dimension={d}
                      tooltipProps={tooltipProps}
                      linkToMetadataPanel={linkToMetadataPanel}
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
                        textAlign: isNumericalMeasure(header)
                          ? "right"
                          : "left",
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
    </div>
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
  dimensions,
  measures,
  observations,
}: {
  title: string;
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
  observations: Observation[];
}) => {
  const headers = useMemo(() => {
    return getSortedColumns(dimensions, measures);
  }, [dimensions, measures]);

  if (observations) {
    return (
      <PreviewTable
        title={title}
        headers={headers}
        observations={observations}
        linkToMetadataPanel={false}
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
  const [{ data: metadataData }] = useDataCubeMetadataQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const [{ data: componentsData }] = useComponentsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const [{ data: observationsData }] = useDataCubeObservationsQuery({
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
    if (!componentsData?.dataCubeByIri) {
      return [];
    }

    return getSortedColumns(
      componentsData.dataCubeByIri.dimensions,
      componentsData.dataCubeByIri.measures
    );
  }, [componentsData?.dataCubeByIri]);

  if (
    metadataData?.dataCubeByIri &&
    componentsData?.dataCubeByIri &&
    observationsData?.dataCubeByIri
  ) {
    return (
      <Box sx={{ maxHeight: "600px", overflow: "auto", ...sx }}>
        <PreviewTable
          title={metadataData.dataCubeByIri.title}
          headers={headers}
          observations={observationsData.dataCubeByIri.observations.data}
          linkToMetadataPanel={true}
        />
      </Box>
    );
  } else {
    return <Loading />;
  }
};

export const getSortedColumns = (
  dimensions: DimensionMetadataFragment[],
  measures: DimensionMetadataFragment[]
) => {
  const allDimensions = [...dimensions, ...measures];
  allDimensions.sort((a, b) =>
    ascending(a.order ?? Infinity, b.order ?? Infinity)
  );
  return allDimensions;
};
