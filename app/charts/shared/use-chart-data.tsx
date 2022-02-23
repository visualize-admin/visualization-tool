import { useEffect } from "react";
import { useDataCubeObservationsQuery } from "../../graphql/query-hooks";
import { Locale } from "../../locales/locales";
import { ChartErrorType, useChartError } from "./errors";

export const useChartData = ({
  locale,
  iri,
  dimensions,
  filters,
}: {
  locale: Locale;
  iri: string;
  dimensions?: string[];
  filters?: any;
}) => {
  const { setChartError } = useChartError();
  let error: ChartErrorType = "none";

  const [{ data, fetching, error: dataLoadingError }] =
    useDataCubeObservationsQuery({
      variables: { locale, iri, dimensions, filters },
    });
  const observations = data?.dataCubeByIri?.observations.data;
  const observationsPresent = observations ? observations.length > 0 : false;

  if (!fetching) {
    if (dataLoadingError) {
      error = "dataLoading";
    } else if (!observationsPresent) {
      error = "noData";
    }
  }

  useEffect(() => setChartError(error));

  return { data, fetching };
};
