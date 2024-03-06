import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import ParsingClient from "sparql-http-client/ParsingClient";

import { ConfiguratorState } from "@/config-types";
import { useLocale } from "@/locales/use-locale";
import { queryLatestCube } from "@/rdf/query-cube-metadata";
import { getErrorQueryParams } from "@/utils/flashes";
import useEvent from "@/utils/use-event";

export const useRedirectToLatestCube = ({
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

    if (datasetIri && !Array.isArray(datasetIri)) {
      hasRun.current = true;

      const sparqlClient = new ParsingClient({ endpointUrl: dataSourceURL });
      const latestIri = await queryLatestCube(sparqlClient, datasetIri);

      if (!latestIri) {
        return router.replace({
          pathname: `/`,
          query: getErrorQueryParams("CANNOT_FIND_CUBE", {
            ...router.query,
            iri: datasetIri,
          }),
        });
      }

      if (datasetIri !== latestIri) {
        return router.replace({
          pathname: "/browse",
          query: {
            ...router.query,
            ...(router.query.iri ? { iri: latestIri } : { dataset: latestIri }),
          },
        });
      }
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
