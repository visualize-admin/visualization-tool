import { Trans } from "@lingui/macro";
import { sortBy } from "lodash";
import * as React from "react";
import { useCallback } from "react";
import { Box } from "theme-ui";
import {
  ChartConfig,
  ConfiguratorStateConfiguringChart,
  useConfiguratorState,
} from "..";

import {
  ensureFilterValuesCorrect,
  moveFilterField,
} from "../configurator-state";
import { getFieldComponentIris } from "../../charts";
import { chartConfigOptionsUISpec } from "../../charts/chart-config-ui-options";
import { Loading } from "../../components/hint";
import { useDataCubeMetadataWithComponentValuesQuery } from "../../graphql/query-hooks";
import { DataCubeMetadata } from "../../graphql/types";
import { useLocale } from "../../locales/use-locale";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "./chart-controls/section";
import {
  ControlTabField,
  DataFilterSelect,
  DataFilterSelectTime,
} from "./field";

const DataFilterSelectGeneric = ({
  dimension,
  index,
  onMove,
}: {
  dimension: DataCubeMetadata["dimensions"][number];
  isOptional?: boolean;
  index: number;
  onMove: (n: number) => void;
}) => {
  const controls = (
    <>
      <button
        style={{
          background: "transparent",
          cursor: "pointer",
          color: "#666",
          border: "transparent",
        }}
        onClick={() => onMove(-1)}
      >
        ▲
      </button>
      <button
        style={{
          background: "transparent",
          cursor: "pointer",
          color: "#666",
          border: "transparent",
        }}
        onClick={() => onMove(1)}
      >
        ▼
      </button>
    </>
  );
  return (
    <Box sx={{ px: 2, mb: 2 }}>
      {dimension.__typename === "TemporalDimension" ? (
        <DataFilterSelectTime
          dimensionIri={dimension.iri}
          label={`${index + 1}. ${dimension.label}`}
          controls={controls}
          from={dimension.values[0].value}
          to={dimension.values[1].value}
          timeUnit={dimension.timeUnit}
          timeFormat={dimension.timeFormat}
          disabled={false}
          id={`select-single-filter-${index}`}
          isOptional={!dimension.isKeyDimension}
        />
      ) : (
        <DataFilterSelect
          dimensionIri={dimension.iri}
          label={`${index + 1}. ${dimension.label}`}
          controls={controls}
          options={dimension.values}
          disabled={false}
          id={`select-single-filter-${index}`}
          isOptional={!dimension.isKeyDimension}
        />
      )}
    </Box>
  );
};

export const ChartConfigurator = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const [, dispatch] = useConfiguratorState();
  const variables = React.useMemo(
    () => ({
      date: new Date(),
      iri: state.dataSet,
      locale,
      filters: state.chartConfig.filters,
    }),
    [state, locale]
  );
  const [{ data, fetching }, executeQuery] =
    useDataCubeMetadataWithComponentValuesQuery({
      variables: variables,
    });
  const metaData = data?.dataCubeByIri;

  const handleMove = useCallback(
    (dimensionIri: string, delta: number) => {
      if (!metaData) {
        return;
      }

      const chartConfig = moveFilterField(state.chartConfig, {
        dimensionIri,
        delta,
      });

      dispatch({
        type: "CHART_CONFIG_REPLACED",
        value: {
          chartConfig,
          dataSetMetadata: metaData,
        },
      });
    },
    [dispatch, metaData, state.chartConfig]
  );

  React.useEffect(() => {
    executeQuery({
      requestPolicy: "network-only",
      variables,
    });
  }, [variables, executeQuery]);

  React.useEffect(() => {
    if (!metaData || !data || !data.dataCubeByIri) {
      return;
    }
    // Make sure that the filters are in line with the values
    const chartConfig = ensureFilterValuesCorrect(state.chartConfig, {
      dimensions: data.dataCubeByIri.dimensions,
    });

    dispatch({
      type: "CHART_CONFIG_REPLACED",
      value: {
        chartConfig,
        dataSetMetadata: metaData,
      },
    });
  }, [data, dispatch, metaData, state.chartConfig]);

  if (data?.dataCubeByIri) {
    const mappedIris = getFieldComponentIris(state.chartConfig.fields);
    const keysOrder = Object.fromEntries(
      Object.keys(state.chartConfig.filters).map((k, i) => [k, i])
    );
    const filterDimensions = sortBy(
      data?.dataCubeByIri.dimensions.filter((dim) => !mappedIris.has(dim.iri)),
      [(x) => keysOrder[x.iri] ?? Infinity]
    );
    return (
      <>
        <ControlSection>
          <SectionTitle titleId="controls-design">
            <Trans id="controls.section.chart.options">Chart Options</Trans>
          </SectionTitle>
          <ControlSectionContent
            side="left"
            role="tablist"
            aria-labelledby="controls-design"
          >
            <ChartFields
              chartConfig={state.chartConfig}
              metaData={data.dataCubeByIri}
            />
          </ControlSectionContent>
        </ControlSection>

        <ControlSection>
          <SectionTitle titleId="controls-data">
            <Trans id="controls.section.data.filters">Filters</Trans>
            {fetching ? "..." : ""}
          </SectionTitle>
          <ControlSectionContent side="left" aria-labelledby="controls-data">
            {filterDimensions.map((dimension, i) => (
              <DataFilterSelectGeneric
                key={dimension.iri}
                dimension={dimension}
                index={i}
                onMove={(n) => handleMove(dimension.iri, n)}
              />
            ))}
          </ControlSectionContent>
        </ControlSection>
      </>
    );
  } else {
    return <Loading />;
  }
};

const ChartFields = ({
  chartConfig,
  metaData,
}: {
  chartConfig: ChartConfig;
  metaData: DataCubeMetadata;
}) => {
  const { chartType } = chartConfig;
  const { dimensions, measures } = metaData;
  const components = [...dimensions, ...measures];

  return (
    <>
      {chartConfigOptionsUISpec[chartType].encodings.map((encoding) => {
        const encodingField = encoding.field;

        return (
          <ControlTabField
            key={encoding.field}
            component={components.find(
              (d) =>
                d.iri ===
                (chartConfig.fields as any)[encodingField]?.componentIri
            )}
            value={encoding.field}
            labelId={`${chartConfig.chartType}.${encoding.field}`}
          />
        );
      })}
    </>
  );
};
