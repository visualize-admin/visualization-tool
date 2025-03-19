import { t, Trans } from "@lingui/macro";
import { Box, Link, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import uniqBy from "lodash/uniqBy";
import { ComponentProps, ReactNode, useMemo } from "react";

import { extractChartConfigUsedComponents } from "@/charts/shared/chart-helpers";
import { LegendItem } from "@/charts/shared/legend-color";
import { ChartFiltersList } from "@/components/chart-filters-list";
import {
  MetadataPanel,
  OpenMetadataPanelWrapper,
} from "@/components/metadata-panel";
import {
  ChartConfig,
  ComboLineColumnConfig,
  ComboLineDualConfig,
  ComboLineSingleConfig,
  DashboardFiltersConfig,
  DataSource,
} from "@/configurator";
import { Component, Measure } from "@/domain/data";
import { useTimeFormatLocale } from "@/formatters";
import { useDataCubesMetadataQuery } from "@/graphql/hooks";
import { useLocale } from "@/locales/use-locale";
import { DISABLE_SCREENSHOT_ATTR } from "@/utils/use-screenshot";

export const useFootnotesStyles = makeStyles<Theme, { useMarginTop: boolean }>(
  (theme) => ({
    actions: {
      marginTop: ({ useMarginTop }) => (useMarginTop ? theme.spacing(2) : 0),
      "--column-gap": "16px",
      columnGap: "var(--column-gap)",
      rowGap: 1,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      overflow: "hidden",
      fontSize: theme.typography.caption.fontSize,
      "& > button": {
        minWidth: "auto",
      },
    },
  })
);

export const CHART_FOOTNOTES_CLASS_NAME = "chart-footnotes";

export const ChartFootnotes = ({
  dataSource,
  chartConfig,
  dashboardFilters,
  components,
  showVisualizeLink = false,
  hideMetadata,
  configKey,
  metadataPanelProps,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
  components: Component[];
  showVisualizeLink?: boolean;
  hideMetadata?: boolean;
  configKey?: string;
  metadataPanelProps?: Omit<
    ComponentProps<typeof MetadataPanel>,
    "dataSource" | "chartConfig" | "dashboardFilters"
  >;
}) => {
  const locale = useLocale();
  const usedComponents = useMemo(() => {
    return extractChartConfigUsedComponents(chartConfig, { components });
  }, [chartConfig, components]);
  const [{ data }] = useDataCubesMetadataQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: uniqBy(
        usedComponents.map((component) => ({ iri: component.cubeIri })),
        "iri"
      ),
    },
    pause: !usedComponents.length,
  });
  const formatLocale = useTimeFormatLocale();
  const hideLegend = !shouldShowChartFootnotesLegend(chartConfig);

  return (
    <Box
      className={CHART_FOOTNOTES_CLASS_NAME}
      sx={{
        display: "flex",
        flexDirection: "column",
        mt: 1,
        "& > :not(:last-child)": { mb: 3 },
      }}
    >
      {metadataPanelProps ? (
        <MetadataPanel
          dataSource={dataSource}
          chartConfig={chartConfig}
          dashboardFilters={dashboardFilters}
          {...metadataPanelProps}
          smallerToggle
        />
      ) : null}
      {data?.dataCubesMetadata.map((metadata) => {
        const hide = hideLegend && hideMetadata;

        return hide ? null : (
          <div key={metadata.iri}>
            <ChartFootnotesLegend
              chartConfig={chartConfig}
              components={components}
              cubeIri={metadata.iri}
            />
            {hideMetadata ? null : (
              <>
                <ChartFiltersList
                  dataSource={dataSource}
                  chartConfig={chartConfig}
                  dashboardFilters={dashboardFilters}
                  components={components}
                  cubeIri={metadata.iri}
                />
                <Typography component="span" variant="caption" color="grey.600">
                  <OpenMetadataPanelWrapper>
                    <Trans id="dataset.footnotes.dataset">Dataset</Trans>
                  </OpenMetadataPanelWrapper>
                  : {metadata.title}
                </Typography>
                {metadata.dateModified ? (
                  <Typography
                    component="span"
                    variant="caption"
                    color="grey.600"
                  >
                    {", "}
                    <Trans id="dataset.footnotes.updated">
                      Latest data update
                    </Trans>
                    :{" "}
                    {formatLocale.format("%d.%m.%Y %H:%M")(
                      new Date(metadata.dateModified)
                    )}
                  </Typography>
                ) : null}
              </>
            )}
          </div>
        );
      })}
      {showVisualizeLink && configKey ? (
        <VisualizeLink
          configKey={configKey}
          createdWith={t({ id: "metadata.link.created.with" })}
        />
      ) : null}
    </Box>
  );
};

const shouldShowChartFootnotesLegend = (chartConfig: ChartConfig) => {
  return ["comboLineColumn", "comboLineDual", "comboLineSingle"].includes(
    chartConfig.chartType
  );
};

const ChartFootnotesLegend = ({
  chartConfig,
  components,
  cubeIri,
}: {
  chartConfig: ChartConfig;
  components: Component[];
  cubeIri: string;
}) => {
  if (!shouldShowChartFootnotesLegend(chartConfig)) {
    return null;
  }

  switch (chartConfig.chartType) {
    case "comboLineColumn": {
      return (
        <ChartFootnotesComboLineColumn
          chartConfig={chartConfig}
          components={components}
          cubeIri={cubeIri}
        />
      );
    }
    case "comboLineDual": {
      return (
        <ChartFootnotesComboLineDual
          chartConfig={chartConfig}
          components={components}
          cubeIri={cubeIri}
        />
      );
    }
    case "comboLineSingle": {
      return (
        <ChartFootnotesComboLineSingle
          chartConfig={chartConfig}
          components={components}
        />
      );
    }
    default:
      return null;
  }
};

const ChartFootnotesLegendContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Box
      sx={{ display: "flex", flexWrap: "wrap", rowGap: 1, columnGap: 3, mb: 1 }}
    >
      {children}
    </Box>
  );
};

const ChartFootnotesComboLineColumn = ({
  chartConfig,
  components,
  cubeIri,
}: {
  chartConfig: ComboLineColumnConfig;
  components: Component[];
  cubeIri: string;
}) => {
  const {
    y: { columnComponentId, lineComponentId, lineAxisOrientation },
  } = chartConfig.fields;
  const columnAxisComponent = components.find(
    (d) => d.id === columnComponentId && d.cubeIri === cubeIri
  );
  const lineAxisComponent = components.find(
    (d) => d.id === lineComponentId && d.cubeIri === cubeIri
  );
  const firstComponent =
    lineAxisOrientation === "left" ? lineAxisComponent : columnAxisComponent;
  const secondComponent =
    lineAxisOrientation === "left" ? columnAxisComponent : lineAxisComponent;

  return firstComponent || secondComponent ? (
    <ChartFootnotesLegendContainer>
      {firstComponent && (
        <LegendItem
          item={firstComponent.label}
          color={chartConfig.fields.color.colorMapping[firstComponent.id]}
          symbol={lineAxisOrientation === "left" ? "line" : "square"}
          usage="tooltip"
          dimension={firstComponent as Measure}
        />
      )}
      {secondComponent && (
        <LegendItem
          item={secondComponent.label}
          color={chartConfig.fields.color.colorMapping[secondComponent.id]}
          symbol={lineAxisOrientation === "left" ? "square" : "line"}
          usage="tooltip"
          dimension={secondComponent as Measure}
        />
      )}
    </ChartFootnotesLegendContainer>
  ) : null;
};

const ChartFootnotesComboLineDual = ({
  chartConfig,
  components,
  cubeIri,
}: {
  chartConfig: ComboLineDualConfig;
  components: Component[];
  cubeIri: string;
}) => {
  const {
    y: { leftAxisComponentId, rightAxisComponentId },
  } = chartConfig.fields;
  const leftAxisComponent = components.find(
    (d) => d.id === leftAxisComponentId && d.cubeIri === cubeIri
  );
  const rightAxisComponent = components.find(
    (d) => d.id === rightAxisComponentId && d.cubeIri === cubeIri
  );

  return leftAxisComponent || rightAxisComponent ? (
    <ChartFootnotesLegendContainer>
      {leftAxisComponent && (
        <LegendItem
          item={leftAxisComponent.label}
          color={chartConfig.fields.color.colorMapping[leftAxisComponent.id]}
          symbol="line"
          usage="tooltip"
          dimension={leftAxisComponent as Measure}
        />
      )}
      {rightAxisComponent && (
        <LegendItem
          item={rightAxisComponent.label}
          color={chartConfig.fields.color.colorMapping[rightAxisComponent.id]}
          symbol="line"
          usage="tooltip"
          dimension={rightAxisComponent as Measure}
        />
      )}
    </ChartFootnotesLegendContainer>
  ) : null;
};

const ChartFootnotesComboLineSingle = ({
  chartConfig,
  components,
}: {
  chartConfig: ComboLineSingleConfig;
  components: Component[];
}) => {
  const {
    y: { componentIds },
  } = chartConfig.fields;

  return componentIds.length ? (
    <ChartFootnotesLegendContainer>
      {componentIds.map((id) => {
        const component = components.find((d) => d.id === id);
        return component ? (
          <LegendItem
            key={component.id}
            item={component.label}
            color={chartConfig.fields.color.colorMapping[component.id]}
            symbol="line"
            usage="tooltip"
            dimension={component as Measure}
          />
        ) : null;
      })}
    </ChartFootnotesLegendContainer>
  ) : null;
};

export const VisualizeLink = ({
  createdWith,
  configKey,
}: {
  createdWith: ReactNode;
  configKey: string;
}) => {
  const locale = useLocale();

  return (
    <Typography variant="caption" color="grey.600" {...DISABLE_SCREENSHOT_ATTR}>
      {createdWith}
      <Link
        href={`https://visualize.admin.ch/${locale}/v/${configKey}`}
        target="_blank"
        rel="noopener noreferrer"
        color="primary.main"
        sx={{ "&:hover": { textDecoration: "none" } }}
      >
        {" "}
        visualize.admin.ch
      </Link>
    </Typography>
  );
};
