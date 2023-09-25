import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import ParsingClient from "sparql-http-client/ParsingClient";

import { useLocale } from "@/locales/use-locale";
import { queryLatestPublishedCubeFromUnversionedIri } from "@/rdf/query-cube-metadata";
import { getErrorQueryParams } from "@/utils/flashes";
import useEvent from "@/utils/use-event";

import { ConfiguratorState } from "../config-types";

/**
 * Heuristic to check if a dataset IRI is versioned.
 * Versioned iris look like https://blabla/<number/
 */
const isDatasetIriVersioned = (iri: string) => {
  return iri.match(/\/\d+\/?$/) !== null;
};
export const useRedirectToVersionedCube = ({
  datasetIri,
  dataSource,
}: {
  datasetIri: string | undefined;
  dataSource: ConfiguratorState["dataSource"];
}) => {
  const locale = useLocale();
  const router = useRouter();
  const hasRun = useRef(false);

  const handleLoad = useEvent(async () => {
    const { url: dataSourceURL } = dataSource;
    if (hasRun.current) {
      return;
    }

    if (
      datasetIri &&
      !Array.isArray(datasetIri) &&
      !isDatasetIriVersioned(datasetIri)
    ) {
      const sparqlClient = new ParsingClient({
        endpointUrl: dataSourceURL,
      });
      const resp = await queryLatestPublishedCubeFromUnversionedIri(
        sparqlClient,
        datasetIri
      );

      if (resp) {
        router.replace({
          pathname: "/browse",
          query: {
            ...router.query,
            ...(router.query.iri ? { iri: resp.iri } : { dataset: resp.iri }),
          },
        });
      } else {
        router.replace({
          pathname: `/`,
          query: getErrorQueryParams("CANNOT_FIND_CUBE", {
            ...router.query,
            iri: datasetIri,
          }),
        });
      }
      hasRun.current = true;
    }
  });

  useEffect(() => {
    if (dataSource.type !== "sparql") {
      console.error(
        `Cannot redirect to unversioned IRI if dataSource.type !== "sparql", here it\'s ${dataSource.type}`
      );
      return;
    }

    if (router.isReady) {
      handleLoad();
    }
  }, [router, locale, dataSource, datasetIri, handleLoad]);
};
