import { Box } from "@theme-ui/components";
import * as React from "react";
import { Observation } from "../domain";
import {
  ComponentFieldsFragment,
  useDataCubePreviewObservationsQuery
} from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";
import { Loading } from "./hint";
import { formatNumber } from "../domain/helpers";

type Header = ComponentFieldsFragment;

const Table = ({
  title,
  headers,
  observations
}: {
  title: string;
  headers: Header[];
  observations: Observation[];
}) => {
  return (
    <Box
      as="table"
      sx={{
        minWidth: "100%",
        borderCollapse: "collapse"
      }}
    >
      <caption style={{ display: "none" }}>{title}</caption>
      <tbody>
        <Box
          as="tr"
          sx={{
            fontFamily: "body",
            fontSize: [3],
            verticalAlign: "baseline",
            color: "monochrome700",
            borderBottomColor: "monochrome700",
            borderBottomWidth: "1px",
            borderBottomStyle: "solid"
          }}
        >
          {headers.map(({ iri, label, __typename }) => {
            return (
              <Box
                as="th"
                role="columnheader"
                key={iri}
                sx={{
                  scope: "col",
                  textAlign: __typename === "Measure" ? "right" : "left",
                  px: 2,
                  py: 3,
                  minWidth: 128
                }}
              >
                {label}
              </Box>
            );
          })}
        </Box>
        {observations.map((obs, i) => {
          return (
            <Box
              as="tr"
              sx={{
                fontFamily: "body",
                fontSize: [3],
                color: "monochrome800",
                borderBottomColor: "monochrome400",
                borderBottomWidth: "1px",
                borderBottomStyle: "solid"
              }}
              key={i}
            >
              {headers.map(({ iri, label, __typename }) => (
                <Box
                  key={iri}
                  as="td"
                  sx={{
                    textAlign: __typename === "Measure" ? "right" : "left",
                    px: 2,
                    py: 3,
                    minWidth: 128
                  }}
                >
                  {__typename === "Measure"
                    ? formatNumber(+obs[iri])
                    : obs[iri]}
                </Box>
              ))}
            </Box>
          );
        })}
      </tbody>
    </Box>
  );
};

export const DataTable = ({
  title,
  dataSetIri,
  dimensions,
  measures
}: {
  title: string;
  dataSetIri: string;
  dimensions: Header[];
  measures: Header[];
}) => {
  const locale = useLocale();
  const [{ data, fetching }] = useDataCubePreviewObservationsQuery({
    variables: {
      iri: dataSetIri,
      locale,
      measures: measures.map(m => m.iri)
    }
  });

  if (!fetching && data?.dataCubeByIri) {
    const headers = [...dimensions, ...measures];
    return (
      <Table
        title={title}
        headers={headers}
        observations={data.dataCubeByIri.observations.data}
      />
    );
  } else {
    return <Loading />;
  }
};
