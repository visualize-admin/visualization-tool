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
  TooltipProps,
  Typography,
} from "@mui/material";
import { ascending, descending } from "d3-array";
import { useCallback, useMemo, useRef, useState } from "react";

import {
  extractChartConfigComponentIds,
  useQueryFilters,
} from "@/charts/shared/chart-helpers";
import { Loading } from "@/components/hint";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import {
  ChartConfig,
  DashboardFiltersConfig,
  DataSource,
} from "@/config-types";
import {
  Component,
  Dimension,
  isNumericalMeasure,
  Measure,
  Observation,
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

const ComponentLabel = ({
  component,
  tooltipProps,
  linkToMetadataPanel,
}: {
  component: Component;
  tooltipProps?: Omit<TooltipProps, "title" | "children">;
  linkToMetadataPanel: boolean;
}) => {
  const label = `${component.label}${
    component.unit ? ` (${component.unit})` : ""
  }`;
  const labelNode = (
    <Typography
      variant="h6"
      component="span"
      sx={{ color: "monochrome.500", textTransform: "uppercase" }}
    >
      {label}
    </Typography>
  );

  return linkToMetadataPanel ? (
    <OpenMetadataPanelWrapper component={component}>
      {labelNode}
    </OpenMetadataPanelWrapper>
  ) : component.description ? (
    <MaybeTooltip title={component.description} tooltipProps={tooltipProps}>
      {labelNode}
    </MaybeTooltip>
  ) : (
    labelNode
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
        ? (v: string) => +v
        : (v: string) => valuesIndex.get(v)?.position ?? v;

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
    (header: Component) => {
      if (sortBy?.id === header.id) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortBy(header);
        setSortDirection("asc");
      }
    },
    [sortBy, sortDirection]
  );

  return (
    <div ref={tooltipContainerRef}>
      <Table>
        <caption style={{ display: "none" }}>{title}</caption>
        <TableHead
          sx={{
            position: "sticky",
            top: 0,
          }}
        >
          <TableRow>
            {headers.map((header) => {
              return (
                <TableCell
                  key={header.id}
                  component="th"
                  role="columnheader"
                  onClick={() => handleSort(header)}
                  sx={{
                    textAlign: isNumericalMeasure(header) ? "right" : "left",
                    whiteSpace: "nowrap",
                  }}
                >
                  <TableSortLabel
                    active={!sortBy || sortBy.id === header.id}
                    direction={!sortBy ? "desc" : sortDirection}
                    IconComponent={SvgIcChevronDown}
                    sx={{
                      "&:hover > svg": {
                        ...(!sortBy ? { transform: "translateY(-15%)" } : {}),
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
        </TableHead>
        <TableBody>
          {sortedObservations.map((obs, i) => {
            return (
              <TableRow key={i}>
                {headers.map((header) => {
                  const format = formatters[header.id];

                  return (
                    <TableCell
                      key={header.id}
                      component="td"
                      sx={{
                        textAlign: isNumericalMeasure(header)
                          ? "right"
                          : "left",
                      }}
                    >
                      {format(obs[header.id])}
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
  dashboardFilters,
  sx,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
  sx?: SxProps<Theme>;
}) => {
  const locale = useLocale();
  const componentIds = extractChartConfigComponentIds({ chartConfig });
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
          componentIds,
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
    dashboardFilters,
    componentIds,
  });
  const [{ data: observationsData }] = useDataCubesObservationsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: queryFilters,
    },
    pause: fetchingComponents,
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
