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

import {
  extractChartConfigComponentIris,
  useQueryFilters,
} from "@/charts/shared/chart-helpers";
import { Loading } from "@/components/hint";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { ChartConfig, DataSource } from "@/config-types";
import {
  DataCubeComponent,
  DataCubeDimension,
  DataCubeMeasure,
  Observation,
  isDataCubeNumericalMeasure,
} from "@/domain/data";
import { useDimensionFormatters } from "@/formatters";
import {
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
  useDataCubesComponentsQuery,
} from "@/graphql/query-hooks";
import SvgIcChevronDown from "@/icons/components/IcChevronDown";
import { useLocale } from "@/locales/use-locale";
import { uniqueMapBy } from "@/utils/uniqueMapBy";

type ComponentLabelProps = {
  component: DataCubeComponent;
  tooltipProps?: Omit<TooltipProps, "title" | "children">;
  linkToMetadataPanel: boolean;
};

const ComponentLabel = (props: ComponentLabelProps) => {
  const { component, tooltipProps, linkToMetadataPanel } = props;
  const label = `${component.label}${
    component.unit ? ` (${component.unit})` : ""
  }`;

  return linkToMetadataPanel ? (
    <OpenMetadataPanelWrapper dim={component}>
      <span style={{ fontWeight: "bold" }}>{label}</span>
    </OpenMetadataPanelWrapper>
  ) : component.description ? (
    <Tooltip title={component.description} arrow {...tooltipProps}>
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
  headers: DataCubeComponent[];
  observations: Observation[];
  linkToMetadataPanel: boolean;
}) => {
  const [sortBy, setSortBy] = useState<DataCubeComponent>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">();
  const formatters = useDimensionFormatters(headers);
  const sortedObservations = useMemo(() => {
    if (sortBy === undefined) {
      return observations;
    }

    const compare = sortDirection === "asc" ? ascending : descending;
    const valuesIndex = uniqueMapBy(sortBy.values, (x) => x.label);
    const convert =
      isDataCubeNumericalMeasure(sortBy) || sortBy.isNumerical
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
            {headers.map((header) => {
              return (
                <TableCell
                  key={header.iri}
                  component="th"
                  role="columnheader"
                  onClick={() => {
                    if (sortBy?.iri === header.iri) {
                      setSortDirection(
                        sortDirection === "asc" ? "desc" : "asc"
                      );
                    } else {
                      setSortBy(header);
                      setSortDirection("asc");
                    }
                  }}
                  sx={{
                    textAlign: isDataCubeNumericalMeasure(header)
                      ? "right"
                      : "left",
                    borderBottom: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <TableSortLabel
                    active={sortBy === undefined || sortBy.iri === header.iri}
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
                    <ComponentLabel
                      component={header}
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
                        textAlign: isDataCubeNumericalMeasure(header)
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
      />
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
  dimensions: DataCubeDimension[];
  measures: DataCubeMeasure[];
  observations: Observation[] | undefined;
}) => {
  const headers = useMemo(() => {
    return getSortedColumns([...dimensions, ...measures]);
  }, [dimensions, measures]);

  return observations ? (
    <PreviewTable
      title={title}
      headers={headers}
      observations={observations}
      linkToMetadataPanel={false}
    />
  ) : (
    <Loading />
  );
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
  const componentIris = extractChartConfigComponentIris(chartConfig);
  const filters = useQueryFilters({ chartConfig });
  const commonQueryVariables = {
    iri: dataSetIri,
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const [{ data: metadataData }] = useDataCubeMetadataQuery({
    variables: commonQueryVariables,
  });
  const [{ data: componentsData }] = useDataCubesComponentsQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      filters: [{ iri: dataSetIri, componentIris, filters }],
    },
  });
  const [{ data: observationsData }] = useDataCubeObservationsQuery({
    variables: {
      ...commonQueryVariables,
      componentIris,
      filters,
    },
  });

  const headers = useMemo(() => {
    if (!componentsData?.dataCubesComponents) {
      return [];
    }

    return getSortedColumns([
      ...componentsData.dataCubesComponents.dimensions,
      ...componentsData.dataCubesComponents.measures,
    ]);
  }, [componentsData?.dataCubesComponents]);

  return metadataData?.dataCubeByIri &&
    componentsData?.dataCubesComponents &&
    observationsData?.dataCubeByIri ? (
    <Box sx={{ maxHeight: "600px", overflow: "auto", ...sx }}>
      <PreviewTable
        title={metadataData.dataCubeByIri.title}
        headers={headers}
        observations={observationsData.dataCubeByIri.observations.data}
        linkToMetadataPanel={true}
      />
    </Box>
  ) : (
    <Loading />
  );
};

export const getSortedColumns = (components: DataCubeComponent[]) => {
  return [...components].sort((a, b) => {
    return ascending(a.order ?? Infinity, b.order ?? Infinity);
  });
};
