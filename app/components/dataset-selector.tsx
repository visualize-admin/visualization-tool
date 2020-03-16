import React from "react";
import { Box, Button, Text } from "@theme-ui/components";
import { useConfiguratorState } from "../domain";
import { Loading } from "./hint";
import { Trans } from "@lingui/macro";
import { SectionTitle } from "./chart-controls/section";
import { useDataCubesQuery } from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";

export const DataSetList = () => {
  const locale = useLocale();
  const [{ data }] = useDataCubesQuery({ variables: { locale } });

  if (data) {
    return (
      <Box sx={{ bg: "monochrome100" }}>
        <SectionTitle>
          <Trans id="controls.select.dataset">Select Dataset</Trans>
        </SectionTitle>
        {data.dataCubes.map(d => (
          <DatasetButton
            key={d.iri}
            dataSetIri={d.iri}
            dataSetLabel={d.title}
            dataSetDescription={d.description}
          />
        ))}
      </Box>
    );
  } else {
    return <Loading />;
  }
};

export const DatasetButton = ({
  dataSetIri,
  dataSetLabel,
  dataSetDescription
}: {
  dataSetIri: string;
  dataSetLabel: string;
  dataSetDescription: string | null;
}) => {
  const [state, dispatch] = useConfiguratorState();

  const selected = dataSetIri === state.dataSet;

  return (
    <Button
      variant="reset"
      onClick={() =>
        dispatch({ type: "DATASET_SELECTED", dataSet: dataSetIri })
      }
      sx={{
        bg: selected ? "mutedDarker" : "transparent",
        position: "relative",
        color: "monochrome700",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        py: 4,
        borderRadius: 0,
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome300",
        "&:first-of-type": {
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "monochrome300"
        },
        ":hover": {
          bg: "mutedDarker"
        },
        ":active": {
          bg: "mutedDarker"
        }
      }}
    >
      {selected && (
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "4px",
            height: "calc(100% + 2px)",
            bg: "primary",
            marginTop: "-1px"
          }}
        ></Box>
      )}
      <Text variant="paragraph2" sx={{ fontWeight: "bold" }} pb={1}>
        {dataSetLabel}
      </Text>
      <Text variant="paragraph2">{dataSetDescription}</Text>
      {/* <Text variant="paragraph2" my={1} sx={{ bg: "missing" }}>
      {"Fehlende Tags"}
    </Text> */}
    </Button>
  );
};
