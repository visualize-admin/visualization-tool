import React from "react";
import { Trans } from "@lingui/macro";
import { LocalizedLink } from "../../components/links";
import { LanguageMenu } from "../../components/language-menu";
import {
  DataCubeProvider,
  useDataSets,
  useDataSetMetadata
} from "../../domain/data-cube";
import DataSet from "@zazuko/query-rdf-data-cube/dist/node/dataset";
import { useLocale } from "../../lib/use-locale";
import { Literal } from "rdf-js";

const DSMeta = ({ dataset }: { dataset: DataSet }) => {
  const locale = useLocale();
  const meta = useDataSetMetadata(dataset);

  return meta.state === "loaded" ? (
    <>
      <h3>Measures</h3>
      <ul>
        {meta.data.measures
          .filter(d => (d.label as Literal).language === locale) // FIXME: we shouldn't filter here …
          .map(dim => (
            <li key={dim.iri.value}>
              {dim.label.value} <pre>{JSON.stringify(dim, null, 2)}</pre>
            </li>
          ))}
      </ul>
      <h3>Dimensions</h3>
      <ul>
        {meta.data.dimensions
          .filter(d => (d.label as Literal).language === locale) // FIXME: we shouldn't filter here …
          .map(dim => (
            <li key={dim.iri.value}>
              {dim.label.value} <pre>{JSON.stringify(dim, null, 2)}</pre>
            </li>
          ))}
      </ul>
    </>
  ) : null;
};

const DSInfo = () => {
  const datasets = useDataSets();

  console.log(datasets);

  return (
    <div>
      {datasets.state === "pending"
        ? "loading …"
        : datasets.state === "loaded"
        ? datasets.data.map(d => {
            return (
              <div key={d.iri}>
                <h2>{d.label}</h2>
                <div>{d.graphIri ? d.graphIri.value : ""}</div>
                <DSMeta dataset={d} />
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
      <DataCubeProvider endpoint="https://trifid-lindas.test.cluster.ldbar.ch/query">
        <LanguageMenu />
        <DSInfo />
      </DataCubeProvider>
    </div>
  );
};

export default Page;
