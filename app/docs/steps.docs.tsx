import { markdown, ReactSpecimen } from "catalog";
import {
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateDescribingChart,
  ConfiguratorStateSelectingDataSet,
} from "../configurator";
import { StepperDumb } from "../configurator/components/stepper";
import { DataCubeMetadataWithComponentValuesQuery } from "../graphql/query-hooks";

const mockData = {
  __typename: "Query",
  dataCubeByIri: { dimensions: [{}] },
} as DataCubeMetadataWithComponentValuesQuery;

export default () => markdown`
> The "stepper" is used to guide users through the steps of creating a visualization.


Selecting dataset step

${(
  <ReactSpecimen>
    <StepperDumb
      goPrevious={() => {}}
      goNext={() => {}}
      data={mockData}
      state={
        {
          state: "SELECTING_DATASET",
          dataSet: "https://fake-dataset-iri",
        } as ConfiguratorStateSelectingDataSet
      }
    />
  </ReactSpecimen>
)}


Configuring step

${(
  <ReactSpecimen>
    <StepperDumb
      goPrevious={() => {}}
      goNext={() => {}}
      data={mockData}
      state={
        { state: "CONFIGURING_CHART" } as ConfiguratorStateConfiguringChart
      }
    />
  </ReactSpecimen>
)}

Describing step

  ${(
    <ReactSpecimen>
      <StepperDumb
        goPrevious={() => {}}
        goNext={() => {}}
        data={mockData}
        state={
          { state: "DESCRIBING_CHART" } as ConfiguratorStateDescribingChart
        }
      />
    </ReactSpecimen>
  )}


  ## How to use

~~~
import { Step } from "../components/step";

<Step variant="">
  Primary Step
</Step>
~~~

`;
