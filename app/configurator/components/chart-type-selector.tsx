import { Trans } from "@lingui/macro";
import React, { SyntheticEvent } from "react";
import { Box, Button, Grid, Text } from "theme-ui";
import { ConfiguratorStateSelectingChartType } from "..";
import { enabledChartTypes, getPossibleChartType } from "../../charts";
import { Hint, Loading } from "../../components/hint";
import { useDataCubeMetadataWithComponentValuesQuery } from "../../graphql/query-hooks";
import { DataCubeMetadata } from "../../graphql/types";
import { Icon } from "../../icons";
import { useLocale } from "../../locales/use-locale";
import { FieldProps, useChartTypeSelectorField } from "../config-form";
import { SectionTitle } from "./chart-controls/section";
import { getFieldLabel, getIconName } from "./ui-helpers";
import Link from "next/link";
import { useTheme } from "../../themes";

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
      <Icon size={48} name={getIconName(label)} />
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
  const theme = useTheme();
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale },
  });

  if (data?.dataCubeByIri) {
    const metaData = data.dataCubeByIri;

    const possibleChartTypes = getPossibleChartType({
      chartTypes: enabledChartTypes,
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
            {enabledChartTypes.map((d) => (
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
        {/* Experimental features */}
        <Box sx={{ mt: 4, color: "warning" }}>
          <SectionTitle color={theme.colors.warning}>
            <Trans id="controls.select.chart.type.experimental">
              Experimental Features
            </Trans>
          </SectionTitle>
          <Box sx={{ mx: 4, fontSize: 3 }}>
            <Trans id="controls.select.chart.type.experimental.description">
              Preview the upcoming map feature with a limited subset of datasets
              (link to a new page).
            </Trans>
          </Box>
        </Box>
        <Grid
          sx={{
            gridTemplateColumns: ["1fr 1fr", "1fr 1fr", "1fr 1fr 1fr"],
            mx: 4,
          }}
        >
          <TemporaryLinkToMapPrototype label={"map"} value={"map"} />
        </Grid>
      </Box>
    );
  } else {
    return <Loading />;
  }
};

const TemporaryLinkToMapPrototype = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  return (
    <Link href="/experimental/map">
      <a style={{ textDecoration: "none" }}>
        <Button
          variant="reset"
          tabIndex={0}
          value={value}
          sx={{
            width: "86px",
            height: "86px",
            mt: 4,
            borderRadius: "default",

            backgroundColor: "monochrome100",
            color: "warning",

            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",

            cursor: "pointer",
            pointerEvents: "initial",

            // border: "1px solid",
            // borderColor: "warningLight",

            transition: "all .2s",

            ":hover": {
              backgroundColor: "warningLight",
            },
          }}
        >
          <Icon size={48} name={getIconName(label)} />
          <Text
            variant="paragraph2"
            sx={{
              color: "warning",
              fontSize: [2, 2, 2],
            }}
          >
            {getFieldLabel(label)}
          </Text>
        </Button>
      </a>
    </Link>
  );
};
