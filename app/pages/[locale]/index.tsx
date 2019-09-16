import { DataCube } from "@zazuko/query-rdf-data-cube";
import { Literal } from "rdf-js";
import React from "react";
import { AppLayout } from "../../components/layout";
import {
  DataCubeProvider,
  useDataSetMetadata,
  useDataSets
} from "../../domain/data-cube";
import { useLocale } from "../../lib/use-locale";
import { DSControls } from "../../components/dataset-controls";

const DSMeta = ({ dataset }: { dataset: DataCube }) => {
  const locale = useLocale();
  const meta = useDataSetMetadata(dataset);

  return meta.state === "loaded" ? (
    <>
      <h3>Measures</h3>
      <ul>
        {meta.data.measures.map(dim => (
          <li key={dim.iri.value}>
            <pre>{JSON.stringify(dim, null, 2)}</pre>
          </li>
        ))}
      </ul>
      <h3>Dimensions</h3>
      <ul>
        {meta.data.dimensions.map(dim => (
          <li key={dim.iri.value}>
            <pre>{JSON.stringify(dim, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </>
  ) : null;
};

const DSInfo = () => {
  const datasets = useDataSets();

  return (
    <div>
      {datasets.state === "pending"
        ? "loading …"
        : datasets.state === "loaded"
        ? datasets.data
            .filter(
              d => d.iri === "http://environment.data.admin.ch/ubd/28/qb/ubd28"
            )
            .map(d => {
              return (
                <div key={d.iri}>
                  {/* <DSMeta dataset={d} /> */}
                  <DSControls dataset={d} />
                </div>
              );
            })
        : "Hwoops"}
    </div>
  );
};

const Page = () => {
  return (
    <div>
      <DataCubeProvider
        // endpoint="https://trifid-lindas.test.cluster.ldbar.ch/sparql"
        endpoint="https://ld.stadt-zuerich.ch/query"
      >
        <AppLayout>
          <DSInfo />
        </AppLayout>
      </DataCubeProvider>
    </div>
  );
};

export default Page;
