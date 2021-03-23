import { markdown, ReactSpecimen } from "catalog";
import { DatasetButton } from "../configurator/components/dataset-selector";
import { ConfiguratorStateProvider } from "../configurator";
import { states } from "./fixtures";

export default () => markdown`

## Dataset Button
  ${(
    <ConfiguratorStateProvider
      chartId={states[0].state}
      initialState={states[0]}
    >
      <ReactSpecimen span={2}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "monochrome100",
          }}
        >
          <DatasetButton
            iri={""}
            title={
              "Comptes des exploitations forestières en francs selon Année, Zone forestière, Canton et Variable"
            }
            description={
              "Comptes des exploitations forestières en francs, dès 2015"
            }
            isDraft={false}
          />
        </div>
      </ReactSpecimen>
    </ConfiguratorStateProvider>
  )}
  ${(
    <ConfiguratorStateProvider
      chartId={states[0].state}
      initialState={states[0]}
    >
      <ReactSpecimen span={2}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "monochrome100",
          }}
        >
          <DatasetButton
            iri={""}
            title={
              "Comptes des exploitations forestières en francs selon Année, Zone forestière, Canton et Variable"
            }
            description={
              "Comptes des exploitations forestières en francs, dès 2015"
            }
            isDraft={true}
          />
        </div>
      </ReactSpecimen>
    </ConfiguratorStateProvider>
  )}


  ## How to use

~~~
import { DatasetButton } from "../components/dataset-selector";

<DatasetButton
  iri={"http://..."}
  dataSetLabel="Comptes des exploitations forestières en francs selon Année, Zone forestière, Canton et Variable"
  dataSetDescription= "Comptes des exploitations forestières en francs, dès 2015"
  selected={true}
  updateiri={() => updateiri()}
/>
~~~

`;
