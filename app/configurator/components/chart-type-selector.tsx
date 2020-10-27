import { Trans } from "@lingui/macro";
import { Box, Button, Grid, Text } from "@theme-ui/components";
import React, { SyntheticEvent } from "react";
import { getPossibleChartType } from "../../charts";
import { ChartType, ConfiguratorStateSelectingChartType } from "..";
import { useDataCubeMetadataWithComponentValuesQuery } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { SectionTitle } from "./chart-controls/section";
import { Hint, Loading } from "../../components/hint";
import { FieldProps, useChartTypeSelectorField } from "../config-form";
import { DataCubeMetadata } from "../../graphql/types";
import { Icon } from "../../icons";
import { getFieldLabel, getIconName } from "./ui-helpers";

const chartTypes: ChartType[] = [
  // "bar",
  "column",
  "line",
  "area",
  "scatterplot",
  "pie",
  "table",
];

export const ChartTypeSelectionButton = ({
  label,
  value,
  checked,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: (e: SyntheticEvent<HTMLButtonElement>) => void;
} & FieldProps) => {
  return (
    <Button
      variant="reset"
      tabIndex={0}
      value={value}
      onClick={onClick}
      sx={{
        width: "86px",
        height: "86px",
        mt: 4,
        borderRadius: "default",

        backgroundColor: checked ? "primary" : "monochrome100",
        color: checked
          ? "mutedColored"
          : disabled
          ? "monochrome500"
          : "primary",

        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",

        cursor: disabled ? "initial" : "pointer",
        pointerEvents: disabled ? "none" : "initial",

        transition: "all .2s",

        ":hover": {
          backgroundColor: disabled
            ? "mutedColored"
            : checked
            ? "primary"
            : "mutedDarker",
        },
      }}
    >
      <Icon name={getIconName(label)} />
      <Text
        variant="paragraph2"
        sx={{
          color: disabled
            ? "monochrome600"
            : checked
            ? "monochrome100"
            : "monochrome700",
          fontSize: [2, 2, 2],
        }}
      >
        {getFieldLabel(label)}
      </Text>
    </Button>
  );
};

const ChartTypeSelectorField = ({
  label,
  value,
  metaData,
  disabled,
  ...props
}: {
  label: string;
  value: string;
  metaData: DataCubeMetadata;
  disabled?: boolean;
}) => {
  const field = useChartTypeSelectorField({
    value,
    metaData,
  });

  return (
    <ChartTypeSelectionButton
      disabled={disabled}
      label={label}
      {...field}
    ></ChartTypeSelectionButton>
  );
};

export const ChartTypeSelector = ({
  state,
}: {
  state: ConfiguratorStateSelectingChartType;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale },
  });

  if (data?.dataCubeByIri) {
    const metaData = data.dataCubeByIri;

    const possibleChartTypes = getPossibleChartType({
      chartTypes,
      meta: metaData,
    });

    return (
      <Box as="fieldset">
        <legend style={{ display: "none" }}>
          <Trans id="controls.select.chart.type">Chart Type</Trans>
        </legend>
        <SectionTitle>
          <Trans id="controls.select.chart.type">Chart Type</Trans>
        </SectionTitle>

        {!possibleChartTypes ? (
          <Hint>
            <Trans id="hint.no.visualization.with.dataset">
              No visualization can be created with the selected dataset.
            </Trans>
          </Hint>
        ) : (
          <Grid
            sx={{
              gridTemplateColumns: ["1fr 1fr", "1fr 1fr", "1fr 1fr 1fr"],
              mx: 4,
            }}
          >
            {chartTypes.map((d) => (
              <ChartTypeSelectorField
                key={d}
                label={d}
                value={d}
                metaData={metaData}
                disabled={!possibleChartTypes.includes(d)}
              />
            ))}
          </Grid>
        )}
      </Box>
    );
  } else {
    return <Loading />;
  }
};
