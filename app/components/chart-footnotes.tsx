import { t, Trans } from "@lingui/macro";
import { Box, Link, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import uniqBy from "lodash/uniqBy";
import { ComponentProps, ReactNode, useMemo } from "react";

import { extractChartConfigUsedComponents } from "@/charts/shared/chart-helpers";
import { LegendItem } from "@/charts/shared/legend-color";
import { ChartFiltersList } from "@/components/chart-filters-list";
import { Flex } from "@/components/flex";
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
  isComboChartConfig,
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
  hideFilters,
  hideMetadata,
  configKey,
  metadataPanelProps,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
  components: Component[];
  showVisualizeLink?: boolean;
  hideFilters?: boolean;
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
      {data?.dataCubesMetadata.map((metadata) => {
        const hide = hideLegend && hideMetadata && hideFilters;

        return hide ? null : (
          <div key={metadata.iri}>
            <ChartFootnotesLegend
              chartConfig={chartConfig}
              components={components}
              cubeIri={metadata.iri}
            />
            {hideFilters ? null : (
              <ChartFiltersList
                dataSource={dataSource}
                chartConfig={chartConfig}
                dashboardFilters={dashboardFilters}
                components={components}
                cubeIri={metadata.iri}
              />
            )}
            {hideMetadata ? null : (
              <>
                <Typography variant="caption">
                  <OpenMetadataPanelWrapper>
                    <Trans id="dataset.footnotes.dataset">Dataset</Trans>
                  </OpenMetadataPanelWrapper>
                  : {metadata.title}
                </Typography>
                {metadata.dateModified ? (
                  <Typography variant="caption">
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
      <Flex justifyContent="space-between" alignItems="center">
        {metadataPanelProps ? (
          <MetadataPanel
            dataSource={dataSource}
            chartConfig={chartConfig}
            dashboardFilters={dashboardFilters}
            {...metadataPanelProps}
            smallerToggle
          />
        ) : null}
        {showVisualizeLink && configKey ? (
          <VisualizeLink
            configKey={configKey}
            createdWith={t({ id: "metadata.link.created.with" })}
          />
        ) : null}
      </Flex>
    </Box>
  );
};

const shouldShowChartFootnotesLegend = (chartConfig: ChartConfig) => {
  return isComboChartConfig(chartConfig);
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
          cubeIri={cubeIri}
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
  children: ReactNode;
}) => {
  return (
    <Flex sx={{ flexWrap: "wrap", rowGap: 1, columnGap: 3, mb: 1 }}>
      {children}
    </Flex>
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
          label={firstComponent.label}
          color={chartConfig.fields.color.colorMapping[firstComponent.id]}
          symbol={lineAxisOrientation === "left" ? "line" : "square"}
          dimension={firstComponent as Measure}
          smaller
        />
      )}
      {secondComponent && (
        <LegendItem
          label={secondComponent.label}
          color={chartConfig.fields.color.colorMapping[secondComponent.id]}
          symbol={lineAxisOrientation === "left" ? "square" : "line"}
          dimension={secondComponent as Measure}
          smaller
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
          label={leftAxisComponent.label}
          color={chartConfig.fields.color.colorMapping[leftAxisComponent.id]}
          symbol="line"
          dimension={leftAxisComponent as Measure}
          smaller
        />
      )}
      {rightAxisComponent && (
        <LegendItem
          label={rightAxisComponent.label}
          color={chartConfig.fields.color.colorMapping[rightAxisComponent.id]}
          symbol="line"
          dimension={rightAxisComponent as Measure}
          smaller
        />
      )}
    </ChartFootnotesLegendContainer>
  ) : null;
};

const ChartFootnotesComboLineSingle = ({
  chartConfig,
  components,
  cubeIri,
}: {
  chartConfig: ComboLineSingleConfig;
  components: Component[];
  cubeIri: string;
}) => {
  const {
    y: { componentIds },
  } = chartConfig.fields;

  return componentIds.length ? (
    <ChartFootnotesLegendContainer>
      {componentIds.map((id) => {
        const component = components.find(
          (d) => d.id === id && d.cubeIri === cubeIri
        );

        return component ? (
          <LegendItem
            key={component.id}
            label={component.label}
            color={chartConfig.fields.color.colorMapping[component.id]}
            symbol="line"
            dimension={component as Measure}
            smaller
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
        sx={{ "&:hover": { textDecoration: "none" } }}
      >
        {" "}
        visualize.admin.ch
      </Link>
    </Typography>
  );
};
