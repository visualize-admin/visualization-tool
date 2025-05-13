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
  getLabelWithUnit,
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

export const ChartDataTablePreview = ({
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
  const sortedComponents = useMemo(() => {
    if (!componentsData?.dataCubesComponents) {
      return [];
    }

    return getSortedComponents([
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
      <ChartDataTablePreviewInner
        title={metadataData.dataCubesMetadata.map((d) => d.title).join(", ")}
        sortedComponents={sortedComponents}
        observations={observationsData.dataCubesObservations.data}
        linkToMetadataPanel
      />
    </Box>
  ) : (
    <Loading />
  );
};

export const ChartDataTablePreviewInner = ({
  title,
  sortedComponents,
  observations,
  linkToMetadataPanel,
}: {
  title: string;
  sortedComponents: Component[];
  observations: Observation[];
  linkToMetadataPanel: boolean;
}) => {
  const [sortBy, setSortBy] = useState<Component>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">();
  const formatters = useDimensionFormatters(sortedComponents);
  const sortedObservations = useMemo(() => {
    if (!sortBy) {
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
          {sortedObservations.map((obs, i) => {
            return (
              <TableRow key={i}>
                {sortedComponents.map((component) => {
                  const format = formatters[component.id];

                  return (
                    <TableCell
                      key={component.id}
                      component="td"
                      sx={{
                        textAlign: isNumericalMeasure(component)
                          ? "right"
                          : "left",
                      }}
                    >
                      {format(obs[component.id])}
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

export const CubeDataTablePreview = ({
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
  const sortedComponents = useMemo(() => {
    return getSortedComponents([...dimensions, ...measures]);
  }, [dimensions, measures]);

  return observations ? (
    <ChartDataTablePreviewInner
      title={title}
      sortedComponents={sortedComponents}
      observations={observations}
      linkToMetadataPanel={false}
    />
  ) : (
    <Loading />
  );
};

export const getSortedComponents = (components: Component[]) => {
  return [...components].sort((a, b) => {
    return ascending(a.order ?? Infinity, b.order ?? Infinity);
  });
};

const ComponentLabel = ({
  component,
  tooltipProps,
  linkToMetadataPanel,
}: {
  component: Component;
  tooltipProps?: Omit<TooltipProps, "title" | "children">;
  linkToMetadataPanel: boolean;
}) => {
  const label = getLabelWithUnit(component);
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
