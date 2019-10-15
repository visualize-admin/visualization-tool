import { Step, Stepper } from "../components/stepper";
import { markdown, ReactSpecimen } from "catalog";

export default () => markdown`
> The "stepper" is used to guide the user through the steps of creating a visualization.

~~~
import { Step } from "../components/step";

<Step variant="">
  Primary Step
</Step>
~~~


  ${(
    <ReactSpecimen span={2}>
      <Step stepNumber={1} stepState="CONFIGURING_CHART" status="past" />
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={2}>
      <Step stepNumber={3} stepState="CONFIGURING_CHART" status="current" />
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={2}>
      <Step stepNumber={4} stepState="CONFIGURING_CHART" status="future" />
    </ReactSpecimen>
  )}


`;
