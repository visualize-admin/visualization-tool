import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useQueryFilters } from "../../charts/shared/chart-helpers";
import { Loading } from "../../components/hint";
import {
  useFormatFullDateAuto,
  useFormatNumber,
} from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import {
  DimensionMetaDataFragment,
  useDataCubeObservationsQuery,
  useDataCubePreviewObservationsQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { ChartConfig } from "../config-types";

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
      <TableHead sx={{ position: "sticky", top: 0, background: "white" }}>
        <TableRow sx={{ borderBottom: "none" }}>
          {headers.map(({ iri, label, unit, __typename }) => {
            return (
              <TableCell
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
        <BackgroundRow nCells={headers.length} />
      </TableHead>
      <TableBody>
        {observations.map((obs, i) => {
          return (
            <TableRow key={i}>
              {headers.map(({ iri, __typename }) => (
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

const BackgroundRow = ({ nCells }: { nCells: number }) => {
  return (
    <TableRow sx={{ padding: 0, background: "black" }}>
      <TableCell
        colSpan={nCells}
        sx={{ height: "1px", padding: 0, borderBottom: "none" }}
      ></TableCell>
    </TableRow>
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

export const DataSetTable = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: ChartConfig;
}) => {
  const locale = useLocale();
  const filters = useQueryFilters({ chartConfig });
  const [{ data, fetching }] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      locale,
      dimensions: null,
      filters,
    },
  });

  if (!fetching && data?.dataCubeByIri) {
    const headers = [
      ...data.dataCubeByIri.dimensions,
      ...data.dataCubeByIri.measures,
    ];

    return (
      <Box sx={{ maxHeight: "600px", overflow: "scroll" }}>
        <PreviewTable
          title={data.dataCubeByIri.title}
          headers={headers}
          observations={data.dataCubeByIri.observations.data}
        />
      </Box>
    );
  } else {
    return <Loading />;
  }
};
