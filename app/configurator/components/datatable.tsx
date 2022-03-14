import { Box } from "@mui/material";

import { Observation } from "../../domain/data";
import {
  DimensionMetaDataFragment,
  useDataCubePreviewObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { Loading } from "../../components/hint";
import {
  useFormatFullDateAuto,
  useFormatNumber,
} from "../../configurator/components/ui-helpers";

type Header = DimensionMetaDataFragment;

const PreviewTable = ({
  title,
  headers,
  observations,
}: {
  title: string;
  headers: Header[];
  observations: Observation[];
}) => {
  const formatNumber = useFormatNumber();
  const formatDateAuto = useFormatFullDateAuto();
  return (
    <Box
      component="table"
      sx={{
        minWidth: "100%",
        borderCollapse: "collapse",
      }}
    >
      <caption style={{ display: "none" }}>{title}</caption>
      <tbody>
        <Box
          component="tr"
          sx={{
            fontFamily: "body",
            fontSize: ["0.875rem"],
            verticalAlign: "baseline",
            color: "grey.700",
            borderBottomColor: "monochrome700",
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
          }}
        >
          {headers.map(({ iri, label, unit, __typename }) => {
            return (
              <Box
                component="th"
                role="columnheader"
                key={iri}
                // @ts-expect-error `scope` is valid on th, but not on div
                scope="col"
                sx={{
                  textAlign: __typename === "Measure" ? "right" : "left",
                  px: 2,
                  py: 3,
                  minWidth: 128,
                }}
              >
                {unit ? `${label} (${unit})` : label}
              </Box>
            );
          })}
        </Box>
        {observations.map((obs, i) => {
          return (
            <Box
              component="tr"
              sx={{
                fontFamily: "body",
                fontSize: [3],
                color: "grey.800",
                borderBottomColor: "monochrome400",
                borderBottomWidth: "1px",
                borderBottomStyle: "solid",
              }}
              key={i}
            >
              {headers.map(({ iri, label, __typename }) => (
                <Box
                  key={iri}
                  component="td"
                  sx={{
                    textAlign: __typename === "Measure" ? "right" : "left",
                    px: 2,
                    py: 3,
                    minWidth: 128,
                  }}
                >
                  {__typename === "Measure"
                    ? formatNumber(obs[iri] as number | null)
                    : __typename === "TemporalDimension"
                    ? formatDateAuto(obs[iri] as string)
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

export const DataSetPreviewTable = ({
  title,
  dataSetIri,
  dimensions,
  measures,
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
      dimensions: null,
    },
  });

  if (!fetching && data?.dataCubeByIri) {
    const headers = [...dimensions, ...measures];
    return (
      <PreviewTable
        title={title}
        headers={headers}
        observations={data.dataCubeByIri.observations.data}
      />
    );
  } else {
    return <Loading />;
  }
};
