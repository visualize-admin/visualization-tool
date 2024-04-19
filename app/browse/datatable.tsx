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
import { ascending, descending } from "d3-array";
import { useMemo, useRef, useState } from "react";

import {
  extractChartConfigComponentIris,
  useQueryFilters,
} from "@/charts/shared/chart-helpers";
import { Loading } from "@/components/hint";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { ChartConfig, DataSource } from "@/config-types";
import {
  Component,
  Dimension,
  Measure,
  Observation,
  isNumericalMeasure,
} from "@/domain/data";
import { useDimensionFormatters } from "@/formatters";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import SvgIcChevronDown from "@/icons/components/IcChevronDown";
import { useLocale } from "@/locales/use-locale";
import { uniqueMapBy } from "@/utils/uniqueMapBy";

type ComponentLabelProps = {
  component: Component;
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
  headers: Component[];
  observations: Observation[];
  linkToMetadataPanel: boolean;
}) => {
  const [sortBy, setSortBy] = useState<Component>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">();
  const formatters = useDimensionFormatters(headers);
  const sortedObservations = useMemo(() => {
    if (!sortBy) {
      return observations;
    }

    const compare = sortDirection === "asc" ? ascending : descending;
    const valuesIndex = uniqueMapBy(sortBy.values, (d) => d.label);
    const convert =
      isNumericalMeasure(sortBy) || sortBy.isNumerical
        ? (value: string) => +value
        : (value: string) => valuesIndex.get(value)?.position ?? value;

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
    () => ({ PopperProps: { container: tooltipContainerRef.current } }),
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
                    textAlign: isNumericalMeasure(header) ? "right" : "left",
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
  dimensions: Dimension[];
  measures: Measure[];
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
  dataSource,
  chartConfig,
  sx,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  sx?: SxProps<Theme>;
}) => {
  const locale = useLocale();
  const componentIris = extractChartConfigComponentIris(chartConfig);
  const commonQueryVariables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const [{ data: metadataData }] = useDataCubesMetadataQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({ iri: cube.iri })),
    },
  });
  const [{ data: componentsData, fetching: fetchingComponents }] =
    useDataCubesComponentsQuery({
      variables: {
        ...commonQueryVariables,
        cubeFilters: chartConfig.cubes.map((cube) => ({
          iri: cube.iri,
          componentIris,
          joinBy: cube.joinBy,
        })),
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
  const queryFilters = useQueryFilters({
    chartConfig,
    dimensions: componentsData?.dataCubesComponents?.dimensions,
    componentIris,
  });
  const [{ data: observationsData }] = useDataCubesObservationsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: queryFilters ?? [],
    },
    pause: fetchingComponents || !queryFilters,
  });

  return metadataData?.dataCubesMetadata &&
    componentsData?.dataCubesComponents &&
    observationsData?.dataCubesObservations ? (
    <Box sx={{ maxHeight: "600px", overflow: "auto", ...sx }}>
      <PreviewTable
        // FIXME: adapt to design
        title={metadataData.dataCubesMetadata.map((d) => d.title).join(", ")}
        headers={headers}
        observations={observationsData.dataCubesObservations.data}
        linkToMetadataPanel
      />
    </Box>
  ) : (
    <Loading />
  );
};

export const getSortedColumns = (components: Component[]) => {
  return [...components].sort((a, b) => {
    return ascending(a.order ?? Infinity, b.order ?? Infinity);
  });
};
