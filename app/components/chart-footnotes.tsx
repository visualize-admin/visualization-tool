import { Trans } from "@lingui/macro";
import { Box, Link, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import uniqBy from "lodash/uniqBy";
import { useMemo } from "react";

import { extractChartConfigComponentIris } from "@/charts/shared/chart-helpers";
import { LegendItem } from "@/charts/shared/legend-color";
import { ChartFiltersList } from "@/components/chart-filters-list";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import {
  ChartConfig,
  ComboLineColumnConfig,
  ComboLineDualConfig,
  ComboLineSingleConfig,
  DashboardFiltersConfig,
  DataSource,
} from "@/configurator";
import { Component, Measure } from "@/domain/data";
import { truthy } from "@/domain/types";
import { useTimeFormatLocale } from "@/formatters";
import { useDataCubesMetadataQuery } from "@/graphql/hooks";
import { useLocale } from "@/locales/use-locale";

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

export const ChartFootnotes = ({
  dataSource,
  chartConfig,
  dashboardFilters,
  components,
  showVisualizeLink = false,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
  components: Component[];
  showVisualizeLink?: boolean;
}) => {
  const locale = useLocale();
  const usedComponents = useMemo(() => {
    const componentIds = extractChartConfigComponentIris({
      chartConfig,
      includeFilters: false,
    });

    return componentIds
      .map((id) => components.find((component) => component.id === id))
      .filter(truthy); // exclude potential joinBy components
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

  return (
    <Box sx={{ mt: 1, "& > :not(:last-child)": { mb: 3 } }}>
      {data?.dataCubesMetadata.map((metadata) => (
        <div key={metadata.iri}>
          <ChartFootnotesLegend
            chartConfig={chartConfig}
            components={components}
          />
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
            <Typography component="span" variant="caption" color="grey.600">
              {", "}
              <Trans id="dataset.footnotes.updated">
                Latest data update
              </Trans>:{" "}
              {formatLocale.format("%d.%m.%Y %H:%M")(
                new Date(metadata.dateModified)
              )}
            </Typography>
          ) : null}
        </div>
      ))}
      {showVisualizeLink ? <VisualizeLink /> : null}
    </Box>
  );
};

const ChartFootnotesLegend = ({
  chartConfig,
  components,
}: {
  chartConfig: ChartConfig;
  components: Component[];
}) => {
  switch (chartConfig.chartType) {
    case "comboLineColumn": {
      return (
        <ChartFootnotesComboLineColumn
          chartConfig={chartConfig}
          components={components}
        />
      );
    }
    case "comboLineDual": {
      return (
        <ChartFootnotesComboLineDual
          chartConfig={chartConfig}
          components={components}
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
  return <Box sx={{ display: "flex", gap: 3, mb: 1 }}>{children}</Box>;
};

const ChartFootnotesComboLineColumn = ({
  chartConfig,
  components,
}: {
  chartConfig: ComboLineColumnConfig;
  components: Component[];
}) => {
  const {
    y: { columnComponentIri, lineComponentIri, lineAxisOrientation },
  } = chartConfig.fields;
  const columnAxisComponent = components.find(
    (d) => d.id === columnComponentIri
  );
  const lineAxisComponent = components.find((d) => d.id === lineComponentIri);
  const firstComponent =
    lineAxisOrientation === "left" ? lineAxisComponent : columnAxisComponent;
  const secondComponent =
    lineAxisOrientation === "left" ? columnAxisComponent : lineAxisComponent;
  return firstComponent || secondComponent ? (
    <ChartFootnotesLegendContainer>
      {firstComponent && (
        <LegendItem
          item={firstComponent.label}
          color={chartConfig.fields.y.colorMapping[firstComponent.id]}
          symbol={lineAxisOrientation === "left" ? "line" : "square"}
          usage="tooltip"
          dimension={firstComponent as Measure}
        />
      )}
      {secondComponent && (
        <LegendItem
          item={secondComponent.label}
          color={chartConfig.fields.y.colorMapping[secondComponent.id]}
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
}: {
  chartConfig: ComboLineDualConfig;
  components: Component[];
}) => {
  const {
    y: { leftAxisComponentIri, rightAxisComponentIri },
  } = chartConfig.fields;
  const leftAxisComponent = components.find(
    (d) => d.id === leftAxisComponentIri
  );
  const rightAxisComponent = components.find(
    (d) => d.id === rightAxisComponentIri
  );
  return leftAxisComponent || rightAxisComponent ? (
    <ChartFootnotesLegendContainer>
      {leftAxisComponent && (
        <LegendItem
          item={leftAxisComponent.label}
          color={chartConfig.fields.y.colorMapping[leftAxisComponent.id]}
          symbol="line"
          usage="tooltip"
          dimension={leftAxisComponent as Measure}
        />
      )}
      {rightAxisComponent && (
        <LegendItem
          item={rightAxisComponent.label}
          color={chartConfig.fields.y.colorMapping[rightAxisComponent.id]}
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
    y: { componentIris },
  } = chartConfig.fields;
  return componentIris.length ? (
    <ChartFootnotesLegendContainer>
      {componentIris.map((id) => {
        const component = components.find((d) => d.id === id);
        return component ? (
          <LegendItem
            key={component.id}
            item={component.label}
            color={chartConfig.fields.y.colorMapping[component.id]}
            symbol="line"
            usage="tooltip"
            dimension={component as Measure}
          />
        ) : null;
      })}
    </ChartFootnotesLegendContainer>
  ) : null;
};

export const VisualizeLink = () => {
  const locale = useLocale();
  return (
    <Typography variant="caption" color="grey.600">
      <Trans id="metadata.link.created.with">Created with</Trans>
      <Link
        href={`https://visualize.admin.ch/${locale}/`}
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
