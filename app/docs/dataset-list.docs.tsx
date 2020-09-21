import { markdown, ReactSpecimen } from "catalog";
import { DatasetButton } from "../components/dataset-selector";

export default () => markdown`

## Dataset Button
  ${(
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
        />
      </div>
    </ReactSpecimen>
  )}
  ${(
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
        />
      </div>
    </ReactSpecimen>
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
