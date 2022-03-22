import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

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

export const PreviewTable = ({
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
    <Table>
      <caption style={{ display: "none" }}>{title}</caption>
      <TableHead>
        <TableRow>
          {headers.map(({ iri, label, unit, __typename }) => {
            return (
              <TableCell
                headers=""
                component="th"
                role="columnheader"
                key={iri}
                sx={{
                  textAlign: __typename === "Measure" ? "right" : "left",
                }}
              >
                {unit ? `${label} (${unit})` : label}
              </TableCell>
            );
          })}
        </TableRow>
      </TableHead>
      <TableBody>
        {observations.map((obs, i) => {
          return (
            <TableRow key={i}>
              {headers.map(({ iri, label, __typename }) => (
                <TableCell
                  key={iri}
                  component="td"
                  sx={{
                    textAlign: __typename === "Measure" ? "right" : "left",
                  }}
                >
                  {__typename === "Measure"
                    ? formatNumber(obs[iri] as number | null)
                    : __typename === "TemporalDimension"
                    ? formatDateAuto(obs[iri] as string)
                    : obs[iri]}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
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
