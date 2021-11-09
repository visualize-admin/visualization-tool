/* eslint-disable import/no-anonymous-default-export */
import { markdown, ReactSpecimen } from "catalog";
import { ConfiguratorStateProvider } from "../configurator";
import { DatasetResult } from "../configurator/components/dataset-search";
import { DataCubePublicationStatus } from "../graphql/query-hooks";
import { states } from "./fixtures";

export default () => markdown`

## Dataset result

> Dataset results are shown when selecting a dataset at the beginning of the chart creation process.
  ${(
    <ConfiguratorStateProvider
      chartId={states[0].state}
      initialState={states[0]}
      allowDefaultRedirect={false}
    >
      <ReactSpecimen span={2}>
        <div
          style={{
            width: 800,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "monochrome100",
          }}
        >
          <DatasetResult
            dataCube={{
              iri: "http://example.com/iri",
              themes: [
                {
                  __typename: "DataCubeTheme",
                  label: "Administration",
                  iri: "http://lindas.com/adminstration",
                },
              ],
              title:
                "Comptes des exploitations forestières en francs selon Année, Zone forestière, Canton et Variable",
              description:
                "Comptes des exploitations forestières en francs, dès 2015",
              datePublished: "2020-10-10",
              publicationStatus: "DRAFT" as DataCubePublicationStatus,
            }}
          />
          <DatasetResult
            dataCube={{
              iri: "http://example.com/iri",
              themes: [],
              title:
                "Comptes des exploitations forestières en francs selon Année, Zone forestière, Canton et Variable",
              description:
                "Comptes des exploitations forestières en francs, dès 2015",
              datePublished: "2020-10-10",
              publicationStatus: "PUBLISHED" as DataCubePublicationStatus,
            }}
          />
        </div>
      </ReactSpecimen>
    </ConfiguratorStateProvider>
  )}


  ## How to use

~~~
import { DatasetResult } from "../components/dataset-selector";

<DatasetResult
  dataCube={{
    iri: 'http://'
    title:
      "Comptes des exploitations forestières en francs selon Année, Zone forestière, Canton et Variable",
    description:
      "Comptes des exploitations forestières en francs, dès 2015",
    datePublished: new Date(2020, 1, 1),
  }}
  selected={true}
/>
~~~

`;
