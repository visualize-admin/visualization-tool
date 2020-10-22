import { markdown, ReactSpecimen } from "catalog";
import { Step } from "../configurator/components/stepper";

export default () => markdown`
> The "stepper" is used to guide users through the steps of creating a visualization.


  ${(
    <ReactSpecimen span={1}>
      <Step stepNumber={1} stepState="CONFIGURING_CHART" status="past" />
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={1}>
      <Step stepNumber={3} stepState="CONFIGURING_CHART" status="current" />
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={1}>
      <Step stepNumber={4} stepState="CONFIGURING_CHART" status="future" />
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
