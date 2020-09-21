import { markdown, ReactSpecimen } from "catalog";
import { Step } from "../components/stepper";

export default () => markdown`
> The "stepper" is used to guide users through the steps of creating a visualization.



  ${(
    <ReactSpecimen span={1}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Step stepNumber={1} stepState="CONFIGURING_CHART" status="past" />
      </div>
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={1}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Step stepNumber={3} stepState="CONFIGURING_CHART" status="current" />
      </div>
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={1}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Step stepNumber={4} stepState="CONFIGURING_CHART" status="future" />
      </div>
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
