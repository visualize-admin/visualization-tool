import { DataCube } from "@zazuko/query-rdf-data-cube";
import { Literal } from "rdf-js";
import React, { useState } from "react";
import { AppLayout } from "../../components/layout";
import {
  DataCubeProvider,
  useDataSetMetadata,
  useDataSets
} from "../../domain/data-cube";
import { DSControls } from "../../components/dataset-controls";
import { Box } from "rebass";
import { Label, Select } from "@rebass/forms";

const DSMeta = ({ dataset }: { dataset: DataCube }) => {
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
  const [datasetIri, selectDataset] = useState(
    "http://example.org/anzahl-forstbetriebe/dataset"
  );

  return (
    <>
      <div>
        {datasets.state === "pending" ? (
          "loading …"
        ) : datasets.state === "loaded" ? (
          <>
            <DSSelect
              datasets={datasets.data}
              selectDataset={selectDataset}
            ></DSSelect>
            {datasetIri && (
              <>
                {datasets.data
                  .filter(d => d.iri === datasetIri)
                  .map(d => {
                    return (
                      <div key={d.iri}>
                        <DSControls dataset={d} />
                      </div>
                    );
                  })}
              </>
            )}
          </>
        ) : (
          "Hwoops"
        )}
      </div>
    </>
  );
};

const DSSelect = ({
  datasets,
  selectDataset
}: {
  datasets: DataCube[];
  selectDataset: any;
}) => {
  const update = (e: any) => selectDataset(e.currentTarget.value);
  return (
    <Box>
      <Label htmlFor="dataset-select">
        <h3>Select a dataset</h3>
      </Label>
      <Select
        id="dataset-select"
        name="dataset-select"
        defaultValue=""
        onChange={update}
      >
        {datasets.map(dataset => (
          <option key={dataset.iri} value={dataset.iri}>
            {dataset.iri}
          </option>
        ))}
      </Select>
    </Box>
  );
};

const Page = () => {
  return (
    <div>
      <DataCubeProvider
        endpoint="https://trifid-lindas.test.cluster.ldbar.ch/query"
        // endpoint="https://ld.stadt-zuerich.ch/query"
      >
        <AppLayout>
          <DSInfo />
        </AppLayout>
      </DataCubeProvider>
    </div>
  );
};

export default Page;
